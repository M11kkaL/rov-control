# ROV System

Remotely Operated Vehicle (ROV) control system with a Go backend, React/TypeScript UI, and a browser-based WebGL/Three.js simulator. The stack runs entirely without external 3D engines or plugins — simulation and control happen in the browser.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (UI)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Controls  │  │     HUD      │  │  WebGL Simulator    │ │
│  │  (WASD /    │  │ depth, speed │  │  Three.js + nose    │ │
│  │   gamepad)  │  │  thrusters   │  │  camera on ROV      │ │
│  └──────┬──────┘  └──────▲───────┘  └──────────▲──────────┘ │
│         │                │                      │           │
│         │    WebSocket   │    telemetry +     │           │
│         └────────────────┼────echoed command────┘           │
└──────────────────────────┼──────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   Go Backend    │
                  │  control, sim,  │
                  │   telemetry WS  │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        MOCK_MODE=1               MOCK_MODE=0
     (mock physics)              (real hardware)
```

| Module | Role | Location |
|--------|------|----------|
| **Backend** | Control logic, motor mixing, mock physics, WebSocket server | `backend/` |
| **UI** | Control panel, HUD, input handling | `ui/src/` |
| **Simulator** | Underwater 3D view rendered in the browser | `ui/src/sim/` |
| **Protocol** | Typed command & telemetry definitions | `protocol/` |

### WebGL simulator & nose camera

The simulator lives inside the UI at `ui/src/sim/`. It uses **Three.js** to render an underwater scene directly in the browser canvas.

The camera is a **first-person nose camera** mounted on the front of the ROV mesh. It moves and rotates with the vehicle — there is no external chase camera. What you see is what the ROV “sees”.

The simulator receives **echoed commands** from the backend via WebSocket telemetry and applies them in a real-time update loop. It also syncs depth, heading, position, and velocity with the backend state.

### Mock mode

The backend supports two operating modes via the `MOCK_MODE` environment variable:

| Value | Mode | Behaviour |
|-------|------|-----------|
| `1` (default) | Simulation | Internal physics simulator runs; no hardware required |
| `0` | Real ROV | Mock physics disabled; real motor hardware expected |

The UI and WebSocket protocol stay the same in both modes.

## Quick start

### Prerequisites

- [Go](https://go.dev/) 1.26+
- [Node.js](https://nodejs.org/) 20+

### 1. Backend

```bash
cd backend
go run ./cmd/server/
```

Server listens on `:8080` by default. Override with `ADDR=:9090`.

Optional environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `ADDR` | `:8080` | HTTP/WebSocket listen address |
| `MOCK_MODE` | `1` | `1` = mock physics, `0` = real hardware |

### 2. UI (includes simulator)

```bash
cd ui
npm install
cp .env.example .env   # optional — defaults work for local dev
npm run dev
```

Open **http://localhost:5173** in your browser.

The WebGL simulator starts automatically — no separate process is needed.

### 3. Verify

| Check | Expected |
|-------|----------|
| `GET http://localhost:8080/health` | `ok` |
| UI status | **Connected** |
| Press **W/A/S/D** | ROV moves in 3D view; HUD updates |
| Press **Space** | Emergency stop |

## Project structure

```
rov-system/
├── backend/
│   ├── cmd/server/          # Entry point
│   └── internal/
│       ├── config/          # Mock mode
│       ├── control/         # Command handling
│       ├── sim/             # Mock physics
│       ├── telemetry/       # Telemetry types
│       └── ws/              # WebSocket server
├── ui/
│   └── src/
│       ├── components/      # HUD, control panel, video feed
│       ├── hooks/           # WebSocket, input, simulator
│       ├── input/           # Keyboard & gamepad
│       ├── services/        # WebSocket client
│       ├── sim/             # WebGL/Three.js simulator
│       │   ├── core/        # Scene, renderer, nose camera
│       │   ├── environment/ # Fog, lighting, particles
│       │   ├── rov/         # ROV mesh & movement
│       │   └── controls/    # Backend command bridge
│       └── types/           # Shared TypeScript types
├── protocol/                # Protocol documentation
│   ├── commands.md
│   ├── telemetry.md
│   └── websocket.md
├── .cursor/rules/           # Cursor AI project rules
├── PROJECT_OVERVIEW.md      # Detailed architecture reference
├── CONTRIBUTING.md
└── LICENSE
```

## Technology stack

| Layer | Technologies |
|-------|-------------|
| Backend | Go, gorilla/websocket |
| UI | React 19, TypeScript, Vite |
| Simulator | Three.js, WebGL |
| Protocol | JSON over WebSocket |
| Tooling | oxlint (UI), Go toolchain (backend) |

## Controls

| Axis | Keyboard | Gamepad |
|------|----------|---------|
| Throttle | W / S | Left stick Y |
| Yaw | A / D | Left stick X |
| Vertical | Q / E | Right stick Y |
| Lateral | R / F | Right stick X |
| Emergency stop | Space (hold) | Button 0 |

## Roadmap

- [ ] Real hardware motor interface (`MOCK_MODE=0`)
- [ ] Simulation / real mode toggle in UI
- [ ] WebSocket authentication
- [ ] Backend unit tests & CI pipeline
- [ ] UI component tests
- [ ] Improved underwater visuals (caustics, seabed textures)
- [ ] Mission recording & playback
- [ ] Multi-client observer mode
- [ ] Thruster failure & warning scenarios

## Documentation

- [Project overview](PROJECT_OVERVIEW.md) — detailed architecture & design principles
- [Commands protocol](protocol/commands.md)
- [Telemetry protocol](protocol/telemetry.md)
- [WebSocket protocol](protocol/websocket.md)
- [Contributing guide](CONTRIBUTING.md)

## License

[MIT](LICENSE)
