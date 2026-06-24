# Contributing to ROV System

Thank you for your interest in contributing. This guide covers local development, pull requests, quality checks, and Cursor-specific project rules.

## Getting started

1. Fork the repository and clone your fork.
2. Ensure prerequisites are installed (Go 1.26+, Node.js 20+).
3. Start the backend and UI — see [README.md](README.md#quick-start).

## Development workflow

The project has two main codebases:

| Module | Path | When to change |
|--------|------|----------------|
| Backend | `backend/` | WebSocket, physics, telemetry, control logic, mock mode |
| UI + simulator | `ui/` | React components, HUD, input, Three.js simulator |

Protocol changes must be documented in `protocol/` **before** or **alongside** code changes.

### Typical data flow

1. UI sends control commands → backend (`/ws`)
2. Backend processes commands → mock physics or hardware
3. Backend broadcasts telemetry (+ echoed command) → UI
4. WebGL simulator in `ui/src/sim/` renders the nose-camera view

Keep this flow intact when adding features.

## Branch & commit conventions

- Create a feature branch from `main`: `feature/short-description` or `fix/short-description`
- Keep commits focused — one logical change per commit
- Write clear commit messages in imperative mood, e.g. `Add velocity to telemetry payload`

## Pull requests

1. Update relevant documentation (`README.md`, `protocol/`, `PROJECT_OVERVIEW.md`) if your change affects architecture or APIs.
2. Run lint and build checks locally (see below).
3. Open a PR against `main` with:
   - **Summary** — what changed and why
   - **Test plan** — steps to verify the change
4. Ensure the PR does not include generated artifacts (`node_modules/`, `dist/`, binaries).
5. Keep diffs small and reviewable.

## Lint & build

### Backend (`backend/`)

```bash
cd backend

# Build
go build ./...

# Vet (static analysis)
go vet ./...

# Tests (when present)
go test ./...
```

There is no separate linter configured for Go yet. `go vet` and `go build` are the minimum checks before a PR.

### UI (`ui/`)

```bash
cd ui

# Install dependencies
npm install

# Lint
npm run lint

# Type-check & production build
npm run build
```

There are no automated UI tests yet. Verify changes manually in the browser at `http://localhost:5173` with the backend running.

### Full stack smoke test

```bash
# Terminal 1
cd backend && go run ./cmd/server/

# Terminal 2
cd ui && npm run dev
```

Confirm:

- HUD shows **Connected**
- 3D simulator renders in the viewport
- WASD / QE / RF inputs move the ROV and update telemetry

## Code placement rules

Follow the project structure — do not mix responsibilities:

| Concern | Belongs in |
|---------|-----------|
| Physics, motor mixing, telemetry logic | `backend/internal/` |
| WebSocket server | `backend/internal/ws/` |
| React components, HUD, input | `ui/src/components/`, `ui/src/hooks/`, `ui/src/input/` |
| WebGL simulator, 3D scene, nose camera | `ui/src/sim/` |
| Protocol documentation | `protocol/` |

**Do not** add external 3D engines or simulators outside the browser. All simulation runs in `ui/src/sim/`.

## Cursor AI rules

This project includes Cursor rules in `.cursor/rules/`. They are applied automatically when using Cursor IDE:

| Rule file | Purpose |
|-----------|---------|
| `rov-guidelines.mdc` | Module boundaries, folder placement, mock mode |
| `rov-karpathy.mdc` | Engineering style — simplicity, small diffs, explicit protocols |
| `rov-persona.mdc` | Senior engineer persona and code style preferences |

When contributing with Cursor:

- Read `PROJECT_OVERVIEW.md` for architecture context
- Let Cursor place code in the correct module (`backend/` vs `ui/src/sim/`)
- Do not ask Cursor to generate Unity or external simulator code
- Keep protocol docs in sync with code changes

If you add new conventions, consider updating the relevant `.mdc` rule file in the same PR.

## Environment variables

| Variable | Module | Default | Description |
|----------|--------|---------|-------------|
| `ADDR` | backend | `:8080` | Listen address |
| `MOCK_MODE` | backend | `1` | Mock physics on/off |
| `VITE_WS_URL` | ui | `ws://localhost:8080/ws` | WebSocket endpoint |

Copy `ui/.env.example` to `ui/.env` for local overrides. Never commit `.env` files with secrets.

## Questions

Open an issue for bugs, feature requests, or architectural questions before starting large changes.
