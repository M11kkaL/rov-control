package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"rov-system/backend/internal/control"
	"rov-system/backend/internal/sim"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Server accepts WebSocket connections and delegates lifecycle to the hub.
type Server struct {
	hub *Hub
}

func NewServer(ctrl *control.State, simulator *sim.Simulator) *Server {
	return &Server{
		hub: NewHub(ctrl, simulator),
	}
}

func (s *Server) Run() {
	s.hub.Run()
}

func (s *Server) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws upgrade: %v", err)
		return
	}

	c := &client{
		hub:  s.hub,
		conn: conn,
		send: make(chan []byte, 16),
	}
	s.hub.register <- c

	go c.writePump()
	go c.readPump()
}

type client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

type inboundMessage struct {
	Type      string          `json:"type"`
	Payload   control.Command `json:"payload"`
	ID        int64           `json:"id"`
	Timestamp int64           `json:"timestamp"`
}

func (c *client) readPump() {
	defer func() {
		c.hub.removeClient(c)
		_ = c.conn.Close()
	}()

	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, data, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var msg inboundMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "ping":
			pong, err := json.Marshal(map[string]any{
				"type":      "pong",
				"id":        msg.ID,
				"timestamp": msg.Timestamp,
			})
			if err != nil {
				continue
			}
			select {
			case c.send <- pong:
			default:
			}
		case "command":
			c.hub.control.SetCommand(msg.Payload)
		}
	}
}

func (c *client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		_ = c.conn.Close()
	}()

	for {
		select {
		case data, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
