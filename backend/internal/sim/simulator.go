package sim

import (
	"encoding/json"
	"math"
	"net/http"

	"rov-system/backend/internal/control"
	"rov-system/backend/internal/telemetry"
)

const (
	depthRate       = 2.0
	headingRate     = 45.0
	pitchRate       = 30.0
	maxPitch        = 45.0
	maxRoll         = 30.0
	camTiltRate     = 25.0
	maxCamTilt      = 35.0
	moveRate        = 1.5
	batteryDrainPerSec = 0.018
	batteryMotorFactor = 0.022
	batteryLightsFactor = 0.012
	stabilizeRate   = 50.0
	holdDepthGain   = 1.8
	rollResponse    = 4.0
	rollStabilize   = 5.0
)

type Simulator struct {
	depth           float64
	heading         float64
	battery         float64
	x               float64
	z               float64
	pitch           float64
	roll            float64
	cameraTilt      float64
	velocity        float64
	holdDepthTarget float64
	prevFlightMode  string
	lights          bool
	lightsLevel     float64
	lastX           float64
	lastZ           float64
	lastDepth       float64
	last            telemetry.Snapshot
	enabled         bool
}

func New(enabled bool) *Simulator {
	s := &Simulator{
		battery:        100,
		depth:          2.0,
		x:              0,
		z:              0,
		prevFlightMode: control.FlightManual,
		enabled:        enabled,
	}
	s.last = s.snapshot(control.Command{}, telemetry.Thrusters{}, nil)
	return s
}

func (s *Simulator) Tick(cmd control.Command, dt float64) telemetry.Snapshot {
	if !s.enabled {
		s.last = s.snapshot(cmd, mixThrusters(cmd), nil)
		return s.last
	}

	applied := s.applyFlightMode(cmd.Clamped(), dt)
	thrusters := mixThrusters(applied)

	if applied.EmergencyStop {
		s.velocity = 0
		s.last = s.snapshot(applied, thrusters, []string{"EMERGENCY STOP"})
		return s.last
	}

	s.lightsLevel = applied.LightsLevel
	s.lights = applied.LightsLevel > 0
	s.lastX = s.x
	s.lastZ = s.z
	s.lastDepth = s.depth

	s.cameraTilt += applied.CameraTilt * camTiltRate * dt
	if s.cameraTilt > maxCamTilt {
		s.cameraTilt = maxCamTilt
	} else if s.cameraTilt < -maxCamTilt {
		s.cameraTilt = -maxCamTilt
	}

	s.depth -= applied.Vertical * depthRate * dt

	s.heading = math.Mod(s.heading-applied.Yaw*headingRate*dt+360, 360)

	s.integratePitch(applied, dt)
	s.integrateRoll(applied, dt)

	rad := s.heading * math.Pi / 180
	forward := applied.Throttle * moveRate * dt
	strafe := applied.Lateral * moveRate * dt
	// Body-relative: forward = (-sin, -cos), strafe right = (cos, -sin) in XZ
	s.x += -forward*math.Sin(rad) + strafe*math.Cos(rad)
	s.z += -forward*math.Cos(rad) - strafe*math.Sin(rad)

	s.clampToPond()

	dx := s.x - s.lastX
	dz := s.z - s.lastZ
	dy := s.depth - s.lastDepth
	if dt > 0 {
		s.velocity = math.Sqrt(dx*dx+dz*dz+dy*dy) / dt
	}

	s.battery = math.Max(0, s.battery-s.computeBatteryDrain(applied, dt))

	s.last = s.snapshot(applied, thrusters, s.pondWarnings())
	return s.last
}

func (s *Simulator) applyFlightMode(cmd control.Command, _ float64) control.Command {
	if cmd.FlightMode != s.prevFlightMode {
		if cmd.FlightMode == control.FlightHoldDepth {
			if cmd.HoldDepthTarget > 0 {
				s.holdDepthTarget = cmd.HoldDepthTarget
			} else {
				s.holdDepthTarget = s.depth
			}
		}
		s.prevFlightMode = cmd.FlightMode
	} else if cmd.FlightMode == control.FlightHoldDepth && cmd.HoldDepthTarget > 0 {
		s.holdDepthTarget = cmd.HoldDepthTarget
	}

	if cmd.FlightMode == control.FlightHoldDepth {
		err := s.holdDepthTarget - s.depth
		cmd.Vertical = clamp(err * holdDepthGain)
	}

	return cmd
}

func (s *Simulator) integratePitch(cmd control.Command, dt float64) {
	if cmd.FlightMode == control.FlightStabilized {
		if math.Abs(cmd.Pitch) > 0.01 {
			s.pitch += cmd.Pitch * pitchRate * dt
		} else {
			s.pitch = stabilizeAngle(s.pitch, stabilizeRate, dt)
		}
	} else {
		s.pitch += cmd.Pitch * pitchRate * dt
	}

	if s.pitch > maxPitch {
		s.pitch = maxPitch
	} else if s.pitch < -maxPitch {
		s.pitch = -maxPitch
	}
}

func (s *Simulator) integrateRoll(cmd control.Command, dt float64) {
	// Bank into turn / strafe (matches Three.js roll convention).
	targetRoll := -cmd.Yaw*12 - cmd.Lateral*8
	s.roll += (targetRoll - s.roll) * rollResponse * dt

	if cmd.FlightMode == control.FlightStabilized {
		s.roll = stabilizeAngle(s.roll, rollStabilize*10, dt)
	}

	if s.roll > maxRoll {
		s.roll = maxRoll
	} else if s.roll < -maxRoll {
		s.roll = -maxRoll
	}
}

func stabilizeAngle(angle, rate, dt float64) float64 {
	if math.Abs(angle) < 0.05 {
		return 0
	}
	step := rate * dt
	if angle > 0 {
		angle -= step
		if angle < 0 {
			return 0
		}
		return angle
	}
	angle += step
	if angle > 0 {
		return 0
	}
	return angle
}

func clamp(v float64) float64 {
	return math.Max(-1, math.Min(1, v))
}

func (s *Simulator) computeBatteryDrain(cmd control.Command, dt float64) float64 {
	load := math.Abs(cmd.Throttle) +
		math.Abs(cmd.Yaw)*0.6 +
		math.Abs(cmd.Pitch)*0.3 +
		math.Abs(cmd.Vertical)*0.5 +
		math.Abs(cmd.Lateral)*0.5
	lights := cmd.LightsLevel / 100.0 * batteryLightsFactor
	motors := load * batteryMotorFactor
	return (batteryDrainPerSec + lights + motors) * dt
}

func (s *Simulator) LastSnapshot() telemetry.Snapshot {
	return s.last
}

func (s *Simulator) ServeState(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(s.LastSnapshot())
}

func mixThrusters(cmd control.Command) telemetry.Thrusters {
	return telemetry.Thrusters{
		Front:    cmd.Throttle,
		Rear:     -cmd.Throttle,
		Left:     cmd.Lateral + cmd.Yaw,
		Right:    -cmd.Lateral - cmd.Yaw,
		Vertical: cmd.Vertical,
	}
}

func (s *Simulator) snapshot(cmd control.Command, thrusters telemetry.Thrusters, warnings []string) telemetry.Snapshot {
	if warnings == nil {
		warnings = []string{}
	}
	holdTarget := 0.0
	if cmd.FlightMode == control.FlightHoldDepth {
		holdTarget = s.holdDepthTarget
	}
	return telemetry.Snapshot{
		Depth:           s.depth,
		Heading:         s.heading,
		Pitch:           s.pitch,
		Roll:            s.roll,
		CameraTilt:      s.cameraTilt,
		FlightMode:      cmd.FlightMode,
		Lights:          s.lights,
		LightsLevel:     s.lightsLevel,
		HoldDepthTarget: holdTarget,
		Battery:         s.battery,
		X:               s.x,
		Z:               s.z,
		Velocity:        s.velocity,
		Command:         cmd,
		Thrusters:       thrusters,
		Warnings:        warnings,
	}
}
