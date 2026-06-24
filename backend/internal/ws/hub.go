package ws

import (
	"encoding/json"
	"sync"
	"time"

	"rov-system/backend/internal/control"
	"rov-system/backend/internal/sim"
	"rov-system/backend/internal/telemetry"
)

const tickRate = 20 * time.Millisecond

type Hub struct {
	mu       sync.RWMutex
	clients  map[*client]struct{}
	control  *control.State
	sim      *sim.Simulator
	register chan *client
}

func NewHub(ctrl *control.State, simulator *sim.Simulator) *Hub {
	return &Hub{
		clients:  make(map[*client]struct{}),
		control:  ctrl,
		sim:      simulator,
		register: make(chan *client),
	}
}

func (h *Hub) Run() {
	ticker := time.NewTicker(tickRate)
	defer ticker.Stop()

	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			h.clients[c] = struct{}{}
			h.mu.Unlock()

		case <-ticker.C:
			cmd := h.control.Command()
			snapshot := h.sim.Tick(cmd, tickRate.Seconds())
			h.broadcast(telemetry.NewMessage(snapshot))
		}
	}
}

func (h *Hub) broadcast(msg telemetry.Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for c := range h.clients {
		select {
		case c.send <- data:
		default:
			go h.removeClient(c)
		}
	}
}

func (h *Hub) removeClient(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.clients[c]; ok {
		delete(h.clients, c)
		close(c.send)
	}
}
