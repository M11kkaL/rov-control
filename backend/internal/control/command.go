package control

import "math"

const (
	FlightManual      = "manual"
	FlightStabilized  = "stabilized"
	FlightHoldDepth   = "hold_depth"
)

type Command struct {
	Throttle      float64 `json:"throttle"`
	Yaw           float64 `json:"yaw"`
	Pitch         float64 `json:"pitch"`
	Vertical      float64 `json:"vertical"`
	Lateral       float64 `json:"lateral"`
	FlightMode    string  `json:"flightMode,omitempty"`
	Lights        bool    `json:"lights,omitempty"`
	LightsLevel   float64 `json:"lightsLevel,omitempty"`
	CameraTilt    float64 `json:"cameraTilt,omitempty"`
	EmergencyStop bool    `json:"emergencyStop,omitempty"`
	HoldDepthTarget float64 `json:"holdDepthTarget,omitempty"`
}

func (c Command) Clamped() Command {
	if c.EmergencyStop {
		return Command{EmergencyStop: true, FlightMode: normalizeFlightMode(c.FlightMode)}
	}
	level := clampPercent(c.LightsLevel)
	if c.Lights && level == 0 {
		level = 100
	}
	lights := level > 0

	return Command{
		Throttle:        clamp(c.Throttle),
		Yaw:             clamp(c.Yaw),
		Pitch:           clamp(c.Pitch),
		Vertical:        clamp(c.Vertical),
		Lateral:         clamp(c.Lateral),
		FlightMode:      normalizeFlightMode(c.FlightMode),
		Lights:          lights,
		LightsLevel:     level,
		CameraTilt:      clamp(c.CameraTilt),
		HoldDepthTarget: math.Max(0, c.HoldDepthTarget),
	}
}

func normalizeFlightMode(mode string) string {
	switch mode {
	case FlightStabilized, FlightHoldDepth:
		return mode
	default:
		return FlightManual
	}
}

func clamp(v float64) float64 {
	return math.Max(-1, math.Min(1, v))
}

func clampPercent(v float64) float64 {
	return math.Max(0, math.Min(100, v))
}

type State struct {
	command Command
}

func NewState() *State {
	return &State{}
}

func (s *State) SetCommand(cmd Command) {
	s.command = cmd.Clamped()
}

func (s *State) Command() Command {
	return s.command
}
