package sim

import (
	"encoding/json"
	"math"
	"net/http"

	"rov-system/backend/internal/control"
	"rov-system/backend/internal/telemetry"
)

const (
	depthRate    = 2.0
	headingRate  = 45.0
	pitchRate    = 30.0
	maxPitch     = 45.0
	moveRate     = 1.5
	batteryDrain = 0.01
)

type Simulator struct {
	depth     float64
	heading   float64
	battery   float64
	x         float64
	z         float64
	pitch     float64
	velocity  float64
	lastX     float64
	lastZ     float64
	lastDepth float64
	last      telemetry.Snapshot
	enabled   bool
}

func New(enabled bool) *Simulator {
	s := &Simulator{
		battery: 100,
		depth:   2.0,
		x:       0,
		z:       0,
		enabled: enabled,
	}
	s.last = s.snapshot(control.Command{}, telemetry.Thrusters{}, nil)
	return s
}

func (s *Simulator) Tick(cmd control.Command, dt float64) telemetry.Snapshot {
	if !s.enabled {
		s.last = s.snapshot(cmd, mixThrusters(cmd), nil)
		return s.last
	}

	thrusters := mixThrusters(cmd)

	if cmd.EmergencyStop {
		s.velocity = 0
		s.last = s.snapshot(cmd, thrusters, []string{"EMERGENCY STOP"})
		return s.last
	}

	s.lastX = s.x
	s.lastZ = s.z
	s.lastDepth = s.depth

	s.depth -= cmd.Vertical * depthRate * dt
	if s.depth < 0 {
		s.depth = 0
	}

	s.heading = math.Mod(s.heading-cmd.Yaw*headingRate*dt+360, 360)

	s.pitch += cmd.Pitch * pitchRate * dt
	if s.pitch > maxPitch {
		s.pitch = maxPitch
	} else if s.pitch < -maxPitch {
		s.pitch = -maxPitch
	}

	rad := s.heading * math.Pi / 180
	forward := cmd.Throttle * moveRate * dt
	strafe := cmd.Lateral * moveRate * dt
	// Three.js forward = -Z at heading 0
	s.x += -forward*math.Sin(rad) + strafe*math.Cos(rad)
	s.z += -forward*math.Cos(rad) + strafe*math.Sin(rad)

	s.clampToPond()

	dx := s.x - s.lastX
	dz := s.z - s.lastZ
	dy := s.depth - s.lastDepth
	if dt > 0 {
		s.velocity = math.Sqrt(dx*dx+dz*dz+dy*dy) / dt
	}

	s.battery = math.Max(0, s.battery-batteryDrain)

	s.last = s.snapshot(cmd, thrusters, s.pondWarnings())
	return s.last
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
	return telemetry.Snapshot{
		Depth:     s.depth,
		Heading:   s.heading,
		Pitch:     s.pitch,
		Battery:   s.battery,
		X:         s.x,
		Z:         s.z,
		Velocity:  s.velocity,
		Command:   cmd,
		Thrusters: thrusters,
		Warnings:  warnings,
	}
}
