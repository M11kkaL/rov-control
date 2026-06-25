package sim

import (
	"math"
	"testing"

	"rov-system/backend/internal/control"
)

func TestHoldDepthMaintainsTarget(t *testing.T) {
	s := New(true)
	s.depth = 6
	s.prevFlightMode = control.FlightHoldDepth
	s.holdDepthTarget = 6

	for i := 0; i < 200; i++ {
		s.Tick(control.Command{FlightMode: control.FlightHoldDepth, Vertical: 1}, 0.05)
	}

	if math.Abs(s.depth-s.holdDepthTarget) > 0.25 {
		t.Fatalf("depth=%.2f target=%.2f, hold depth did not maintain setpoint", s.depth, s.holdDepthTarget)
	}
}

func TestStabilizedLevelsPitch(t *testing.T) {
	s := New(true)
	s.pitch = 20

	for i := 0; i < 120; i++ {
		s.Tick(control.Command{FlightMode: control.FlightStabilized}, 0.05)
	}

	if math.Abs(s.pitch) > 1.0 {
		t.Fatalf("pitch=%.2f, expected near level in stabilized mode", s.pitch)
	}
}

func TestLateralStrafesSidewaysAtHeading0(t *testing.T) {
	s := New(true)
	s.heading = 0

	for i := 0; i < 40; i++ {
		s.Tick(control.Command{Lateral: 1}, 0.05)
	}

	if s.x <= 0 {
		t.Fatalf("expected strafe right (+x), got x=%.3f z=%.3f", s.x, s.z)
	}
	if math.Abs(s.z) > 0.01 {
		t.Fatalf("expected no forward/back at heading 0, got x=%.3f z=%.3f", s.x, s.z)
	}
}

func TestLateralPerpendicularToForward(t *testing.T) {
	s := New(true)
	s.heading = 45
	startX, startZ := s.x, s.z

	for i := 0; i < 40; i++ {
		s.Tick(control.Command{Lateral: 1}, 0.05)
	}

	dx := s.x - startX
	dz := s.z - startZ
	rad := 45 * math.Pi / 180
	fx := -math.Sin(rad)
	fz := -math.Cos(rad)
	dot := dx*fx + dz*fz
	if math.Abs(dot) > 0.05 {
		t.Fatalf("lateral leaked into forward axis: dot=%.3f dx=%.3f dz=%.3f", dot, dx, dz)
	}
}

func TestRollBanksIntoStrafe(t *testing.T) {
	right := New(true)
	for i := 0; i < 60; i++ {
		right.Tick(control.Command{Lateral: 1}, 0.05)
	}
	if right.roll > -0.5 {
		t.Fatalf("strafe right: roll=%.2f, expected negative roll banking into strafe", right.roll)
	}

	left := New(true)
	for i := 0; i < 60; i++ {
		left.Tick(control.Command{Lateral: -1}, 0.05)
	}
	if left.roll < 0.5 {
		t.Fatalf("strafe left: roll=%.2f, expected positive roll banking into strafe", left.roll)
	}
}

func TestRollBanksIntoTurn(t *testing.T) {
	left := New(true)
	for i := 0; i < 60; i++ {
		left.Tick(control.Command{Yaw: -1}, 0.05)
	}
	if left.roll < 0.5 {
		t.Fatalf("left turn: roll=%.2f, expected positive roll banking into turn", left.roll)
	}

	right := New(true)
	for i := 0; i < 60; i++ {
		right.Tick(control.Command{Yaw: 1}, 0.05)
	}
	if right.roll > -0.5 {
		t.Fatalf("right turn: roll=%.2f, expected negative roll banking into turn", right.roll)
	}
}

func TestClampToPond(t *testing.T) {
	s := New(true)
	s.x = PondRadius
	s.z = 0
	s.depth = 2

	s.clampToPond()

	maxR := PondRadius - PondMargin
	if math.Hypot(s.x, s.z) > maxR+0.01 {
		t.Fatalf("position outside pond: r=%.2f max=%.2f", math.Hypot(s.x, s.z), maxR)
	}
}

func TestCameraTiltIntegration(t *testing.T) {
	s := New(true)

	for i := 0; i < 40; i++ {
		s.Tick(control.Command{CameraTilt: 1}, 0.05)
	}

	if s.cameraTilt <= 0 {
		t.Fatalf("cameraTilt=%.2f, expected positive tilt", s.cameraTilt)
	}
	if s.cameraTilt > maxCamTilt {
		t.Fatalf("cameraTilt=%.2f exceeds max %.2f", s.cameraTilt, maxCamTilt)
	}
}

func TestLightsEchoedInSnapshot(t *testing.T) {
	s := New(true)
	snap := s.Tick(control.Command{Lights: true}, 0.05)

	if !snap.Lights {
		t.Fatal("expected lights=true in telemetry")
	}
}
