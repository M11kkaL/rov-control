package telemetry

import (
	"time"

	"rov-system/backend/internal/control"
)

type Thrusters struct {
	Front    float64 `json:"front"`
	Rear     float64 `json:"rear"`
	Left     float64 `json:"left"`
	Right    float64 `json:"right"`
	Vertical float64 `json:"vertical"`
}

type Snapshot struct {
	Depth     float64          `json:"depth"`
	Heading   float64          `json:"heading"`
	Pitch     float64          `json:"pitch"`
	Battery   float64          `json:"battery"`
	X         float64          `json:"x"`
	Z         float64          `json:"z"`
	Velocity  float64          `json:"velocity"`
	Command   control.Command  `json:"command"`
	Thrusters Thrusters        `json:"thrusters"`
	Warnings  []string         `json:"warnings"`
	Timestamp int64            `json:"timestamp"`
}

type Message struct {
	Type    string   `json:"type"`
	Payload Snapshot `json:"payload"`
}

func NewMessage(snapshot Snapshot) Message {
	if snapshot.Warnings == nil {
		snapshot.Warnings = []string{}
	}
	if snapshot.Timestamp == 0 {
		snapshot.Timestamp = time.Now().UnixMilli()
	}
	return Message{
		Type:    "telemetry",
		Payload: snapshot,
	}
}
