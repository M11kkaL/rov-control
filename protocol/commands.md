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
  "vertical": 0.0,
  "lateral": 0.0,
  "emergencyStop": false
}
```

| Field           | Type    | Range   | Description                    |
|-----------------|---------|---------|--------------------------------|
| `throttle`      | number  | -1 … 1  | Forward / backward             |
| `yaw`           | number  | -1 … 1  | Rotate left / right            |
| `vertical`      | number  | -1 … 1  | Ascend / descend               |
| `lateral`       | number  | -1 … 1  | Strafe left / right            |
| `emergencyStop` | boolean |         | Optional. Stops all thrusters  |

## Input mapping (UI)

| Axis      | Keyboard      | Gamepad (default) |
|-----------|---------------|-------------------|
| Throttle  | W / S         | Left stick Y      |
| Yaw       | A / D         | Left stick X      |
| Vertical  | Q / E         | Right stick Y     |
| Lateral   | R / F         | Right stick X     |
| E-stop    | Space (hold)  | —                 |
