package config

import "os"

// IsMockMode returns true when the backend runs the internal physics simulator
// instead of real hardware. Enabled by default; set MOCK_MODE=0 for real ROV.
func IsMockMode() bool {
	return os.Getenv("MOCK_MODE") != "0"
}
