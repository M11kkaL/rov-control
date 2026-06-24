package sim

import "math"

// Pond layout — keep in sync with ui/src/sim/environment/pond.ts
const (
	PondRadius = 38.0
	PondMargin = 2.0
	MaxDepth   = 13.0
)

func PondDepthAt(x, z float64) float64 {
	r := math.Hypot(x, z)
	if r >= PondRadius {
		return 0
	}
	t := 1 - r/PondRadius
	return MaxDepth * t * t
}

func (s *Simulator) clampToPond() {
	r := math.Hypot(s.x, s.z)
	maxR := PondRadius - PondMargin
	if r > maxR && r > 0 {
		scale := maxR / r
		s.x *= scale
		s.z *= scale
	}

	maxDepth := PondDepthAt(s.x, s.z)
	if maxDepth > 0 && s.depth > maxDepth {
		s.depth = maxDepth
	}
	if s.depth < 0 {
		s.depth = 0
	}
}

func (s *Simulator) pondWarnings() []string {
	warnings := []string{}
	if s.battery < 20 {
		warnings = append(warnings, "LOW BATTERY")
	}
	r := math.Hypot(s.x, s.z)
	if r > (PondRadius-PondMargin)*0.88 {
		warnings = append(warnings, "NEAR SHORE")
	}
	return warnings
}
