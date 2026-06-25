# WebSocket Protocol

## Endpoint

```
ws://<host>:<port>/ws
```

Default development URL: `ws://localhost:8080/ws`

Configure the UI with `VITE_WS_URL` in `.env`.

## Connection lifecycle

1. UI opens a WebSocket to `/ws`.
2. UI sends `command` messages as the operator provides input.
3. Backend broadcasts `telemetry` messages at 20 Hz (includes echoed command).
4. WebGL simulator in the UI consumes telemetry to drive the 3D scene.
5. Either side may close the connection; the UI reconnects with backoff.

## Message direction

| Direction    | Message type | Document                     |
|--------------|--------------|------------------------------|
| UI → Backend | `command`    | [commands.md](./commands.md) |
| UI → Backend | `ping`       | This document (RTT)          |
| Backend → UI | `telemetry`  | [telemetry.md](./telemetry.md) |
| Backend → UI | `pong`       | This document (RTT)          |

## Simulation video

There is no separate video stream. The WebGL/Three.js simulator renders the camera view directly in the browser canvas (`ui/src/sim/`). The ROV uses a first-person **nose camera** attached to the vehicle front.

## Mock mode

Backend mock physics is enabled by default (`MOCK_MODE=1`). Set `MOCK_MODE=0` for real hardware.

## Health check

HTTP `GET /health` returns `200 ok` for liveness probes.

HTTP `GET /sim/state` returns the latest telemetry snapshot as JSON (debug).

## Application ping (RTT)

UI may send periodic ping messages to measure round-trip latency:

```json
{ "type": "ping", "id": 1, "timestamp": 1710000000000 }
```

Backend responds immediately:

```json
{ "type": "pong", "id": 1, "timestamp": 1710000000000 }
```

RTT = `Date.now() - timestamp` when the pong is received (using the client send time stored by `id`).
