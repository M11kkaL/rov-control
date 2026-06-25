package control

import "testing"

func TestClampedPreservesFlightModeAndLights(t *testing.T) {
	cmd := Command{
		Throttle:   2,
		Yaw:        -2,
		FlightMode: FlightHoldDepth,
		Lights:     true,
		CameraTilt: 0.5,
	}
	got := cmd.Clamped()

	if got.FlightMode != FlightHoldDepth {
		t.Fatalf("flight mode = %q, want %q", got.FlightMode, FlightHoldDepth)
	}
	if !got.Lights {
		t.Fatal("expected lights to remain enabled")
	}
	if got.LightsLevel != 100 {
		t.Fatalf("lightsLevel = %v, want 100 when lights=true", got.LightsLevel)
	}
	if got.Throttle != 1 || got.Yaw != -1 {
		t.Fatalf("axes not clamped: throttle=%v yaw=%v", got.Throttle, got.Yaw)
	}
	if got.CameraTilt != 0.5 {
		t.Fatalf("cameraTilt = %v, want 0.5", got.CameraTilt)
	}
}

func TestClampedEmergencyStopClearsAxes(t *testing.T) {
	cmd := Command{
		Throttle:      1,
		EmergencyStop: true,
		FlightMode:    FlightStabilized,
	}
	got := cmd.Clamped()

	if got.Throttle != 0 {
		t.Fatalf("throttle = %v, want 0 on e-stop", got.Throttle)
	}
	if got.FlightMode != FlightStabilized {
		t.Fatalf("flight mode = %q, want %q", got.FlightMode, FlightStabilized)
	}
}

func TestClampedLightsLevelDims(t *testing.T) {
	cmd := Command{LightsLevel: 45}
	got := cmd.Clamped()
	if got.LightsLevel != 45 {
		t.Fatalf("lightsLevel = %v, want 45", got.LightsLevel)
	}
	if !got.Lights {
		t.Fatal("expected lights on when level > 0")
	}

	off := Command{LightsLevel: 0}.Clamped()
	if off.Lights {
		t.Fatal("expected lights off at level 0")
	}
}

func TestNormalizeFlightMode(t *testing.T) {
	if normalizeFlightMode("unknown") != FlightManual {
		t.Fatal("unknown mode should default to manual")
	}
}
