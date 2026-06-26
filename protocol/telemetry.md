# Telemetry (Backend → UI)

Telemetry is broadcast from the backend to all connected UI clients at 20 Hz.

## Envelope

```json
{
  "type": "telemetry",
  "payload": { ... }
}
```

## Payload

```json
{
  "depth": 12.5,
  "heading": 180.0,
  "pitch": 5.0,
  "roll": -2.0,
  "cameraTilt": 10.0,
  "flightMode": "hold_depth",
  "lights": true,
  "lightsLevel": 80,
  "holdDepthTarget": 12.5,
  "battery": 87.0,
  "x": 1.2,
  "z": -0.5,
  "velocity": 0.85,
  "command": {
    "throttle": 0.5,
    "yaw": 0.0,
    "pitch": 0.0,
    "vertical": 0.0,
    "lateral": 0.0,
    "flightMode": "hold_depth",
    "lights": true,
    "lightsLevel": 80,
    "holdDepthTarget": 12.5
  },
  "thrusters": {
    "front": 0.5,
    "rear": -0.5,
    "left": 0.0,
    "right": 0.0,
    "vertical": 0.0
  },
  "warnings": [],
  "timestamp": 1710000000000
}
```

| Field                | Type     | Unit / range | Description                    |
|----------------------|----------|--------------|--------------------------------|
| `depth`              | number   | metres       | Current depth                  |
| `heading`            | number   | degrees      | Compass heading 0–360          |
| `pitch`              | number   | degrees      | Nose tilt -45 … 45 (neg = up)  |
| `roll`               | number   | degrees      | Roll angle -30 … 30            |
| `cameraTilt`         | number   | degrees      | Camera gimbal angle            |
| `flightMode`         | string   |              | Active flight mode echo        |
| `lights`             | boolean  |              | ROV lights state (on when `lightsLevel` > 0) |
| `lightsLevel`        | number   | 0 … 100      | Headlight brightness percent   |
| `holdDepthTarget`    | number   | metres       | Setpoint when in `hold_depth`  |
| `battery`            | number   | percent      | Remaining charge 0–100         |
| `x`                  | number   | metres       | World X position               |
| `z`                  | number   | metres       | World Z position               |
| `velocity`           | number   | m/s          | Speed magnitude                |
| `command`            | object   |              | Last applied control command   |
| `thrusters.front`    | number   | -1 … 1       | Front thruster output          |
| `thrusters.rear`     | number   | -1 … 1       | Rear thruster output           |
| `thrusters.left`     | number   | -1 … 1       | Left thruster output           |
| `thrusters.right`    | number   | -1 … 1       | Right thruster output          |
| `thrusters.vertical` | number   | -1 … 1       | Vertical thruster output       |
| `warnings`           | string[] |              | Active warning messages        |
| `timestamp`          | number   | ms           | Server timestamp               |

## WebGL simulator usage

The browser simulator syncs `depth`, `heading`, `pitch`, `roll`, `cameraTilt`, `lights`, `lightsLevel`, `x`, `z`, and `velocity` from the backend. It toggles the nose headlight from `lightsLevel` (intensity scales with percent) and applies gimbal tilt on the camera.

## Broadcast rate

Default: **20 Hz** (50 ms interval).
