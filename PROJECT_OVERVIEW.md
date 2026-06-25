# ROV System – Project Overview

## Purpose
This project implements a complete remotely operated vehicle (ROV) control system with:
- Go backend (control logic, physics, telemetry, WebSocket server)
- React UI (HUD, controls, joystick + keyboard input, WebGL simulator)
- Protocol definitions (commands, telemetry, WebSocket)

The system must support two modes:
1. **Simulation mode** – WebGL/Three.js simulator in the browser; backend runs mock physics (`MOCK_MODE=1`).
2. **Real ROV mode** – Real hardware provides motor feedback; backend disables mock physics (`MOCK_MODE=0`).

The architecture must allow switching between these modes without changing UI or backend protocol.

---

## High-Level Architecture

### Backend (Go)
The backend is the “brain” of the system. Responsibilities:
- WebSocket server for UI communication
- Command handling (throttle, yaw, pitch, vertical, lateral, flight modes, lights)
- Telemetry broadcasting (depth, heading, velocity, battery, thruster output, echoed command)
- Mock physics simulation when `MOCK_MODE=1`
- Motor mixing logic
- Logging and diagnostics
- Deterministic control loops

Backend directory structure:
```
backend/
  cmd/
    server/
      main.go
  internal/
    config/      # mock mode
    ws/
    sim/
    telemetry/
    control/
  pkg/
```

**Mock mode:** Set `MOCK_MODE=0` to disable internal physics (real hardware expected). Default is mock enabled.

---

### UI (React + TypeScript + Three.js)
The UI is the “control panel” and “eyes” in simulation mode. Responsibilities:
- Render WebGL underwater simulator (Three.js)
- **Nose camera** – first-person camera mounted on the ROV front; moves and rotates with the vehicle (no external chase camera)
- Show HUD overlays (depth, heading, velocity, thrusters, warnings)
- Provide input: Gamepad API + keyboard (WASD + QE + RF + Space)
- Send control commands to backend via WebSocket
- Receive telemetry and echoed commands from backend
- Drive the 3D simulator from backend WebSocket data

UI directory structure:
```
ui/
  src/
    components/
    hooks/
    services/
    types/
    input/
    sim/
      core/          # scene, renderer, nose camera
      environment/   # underwater fog, light, particles
      rov/           # ROV mesh + movement
      controls/      # backend command bridge
```

---

## Protocol
All communication is explicit and typed.

### UI → Backend (Commands)
- throttle, yaw, pitch, vertical, lateral
- flightMode (`manual`, `stabilized`, `hold_depth`)
- lights, cameraTilt
- emergency stop

### Backend → UI (Telemetry)
- depth, heading, pitch, roll, velocity, battery
- cameraTilt, flightMode, lights, holdDepthTarget
- thruster outputs
- echoed `command` (last applied control)
- warnings, timestamps

### Simulator (WebGL)
- Runs entirely in the browser inside `ui/src/sim/`
- Receives echoed commands via WebSocket telemetry
- Renders first-person view from ROV nose camera
- Computes local telemetry (depth, heading, velocity) for the render loop
- Syncs with backend state on each telemetry broadcast

Protocol documentation:
```
protocol/
  commands.md
  telemetry.md
  websocket.md
```

---

## Design Principles
- Clear separation of concerns:
  - Backend = logic + authoritative mock physics
  - UI = control + visualization + WebGL simulator
- No Unity or external simulator dependencies
- Deterministic real-time loops
- Replaceability: mock physics can be disabled for real hardware
- Explicit protocols, no magic strings
- Small, focused components and functions
- Simulation and real mode share the same API

---

## Development Workflow
1. UI sends control commands → backend
2. Backend processes commands → updates mock physics or hardware
3. Backend sends telemetry (+ echoed command) → UI
4. WebGL simulator applies commands and renders nose-camera view
5. UI renders HUD + simulator + controls

---

## Goals
- Build a clean, modular, production-quality ROV control system
- Make the architecture easy to extend to real hardware
- Keep simulation and real mode unified under one protocol
- Run the full simulation stack in the browser without plugins
