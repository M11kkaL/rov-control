package control

import "math"

type Command struct {
	Throttle      float64 `json:"throttle"`
	Yaw           float64 `json:"yaw"`
	Vertical      float64 `json:"vertical"`
	Lateral       float64 `json:"lateral"`
	EmergencyStop bool    `json:"emergencyStop,omitempty"`
}

func (c Command) Clamped() Command {
	if c.EmergencyStop {
		return Command{}
	}
	return Command{
		Throttle: clamp(c.Throttle),
		Yaw:      clamp(c.Yaw),
		Vertical: clamp(c.Vertical),
		Lateral:  clamp(c.Lateral),
	}
}

func clamp(v float64) float64 {
	return math.Max(-1, math.Min(1, v))
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
