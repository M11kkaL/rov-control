# Commands (UI → Backend)

All commands are JSON objects sent over the WebSocket at `/ws`.

## Envelope

```json
{
  "type": "command",
  "payload": { ... },
  "timestamp": 1710000000000
}
```

| Field       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| `type`      | string | Always `"command"`                   |
| `payload`   | object | Control values (see below)           |
| `timestamp` | number | Client timestamp in milliseconds     |

## Payload

```json
{
  "throttle": 0.0,
  "yaw": 0.0,
  "pitch": 0.0,
  "vertical": 0.0,
  "lateral": 0.0,
  "flightMode": "manual",
  "lights": false,
  "lightsLevel": 80,
  "cameraTilt": 0.0,
  "holdDepthTarget": 12.5,
  "emergencyStop": false
}
```

| Field             | Type    | Range   | Description                    |
|-------------------|---------|---------|--------------------------------|
| `throttle`        | number  | -1 … 1  | Forward / backward             |
| `yaw`             | number  | -1 … 1  | Rotate left / right            |
| `pitch`           | number  | -1 … 1  | Tilt nose up / down            |
| `vertical`        | number  | -1 … 1  | Ascend / descend               |
| `lateral`         | number  | -1 … 1  | Strafe left / right            |
| `flightMode`      | string  |         | `manual`, `stabilized`, `hold_depth` |
| `lights`          | boolean |         | ROV lights on/off (derived from `lightsLevel`) |
| `lightsLevel`     | number  | 0 … 100 | Headlight brightness percent   |
| `cameraTilt`      | number  | -1 … 1  | Camera gimbal tilt input       |
| `holdDepthTarget` | number  | metres  | Optional. Depth setpoint when `flightMode` is `hold_depth` |
| `emergencyStop`   | boolean |         | Optional. Stops all thrusters  |

## Input mapping (UI)

| Axis      | Keyboard      | Gamepad (default) |
|-----------|---------------|-------------------|
| Throttle  | W / S         | Left stick Y      |
| Yaw       | A / D         | Left stick X      |
| Pitch     | ↑ / ↓         | LB / RB (buttons 4/5) |
| Vertical  | Q / E         | Right stick Y     |
| Lateral   | ← / →         | Right stick X     |
| E-stop    | Space (hold)  | —                 |

## Flight modes

| Mode | Description |
|------|-------------|
| `manual` | Direct axis control (default) |
| `stabilized` | Auto-level pitch and roll; operator trim still available |
| `hold_depth` | Maintains depth at activation setpoint |

When **Cam Tilt** is active in the UI, arrow keys send `cameraTilt` instead of `pitch`.
