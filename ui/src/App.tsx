import { ControlPanel, HUD, VideoFeed, useSimBridge } from './components'
import { useCommandSender, useControlInput, useGamepadConnected, useWebSocket } from './hooks'

function App() {
  const bridge = useSimBridge()
  const { connected, telemetry, service } = useWebSocket(bridge)
  const control = useControlInput()
  const gamepadConnected = useGamepadConnected()

  useCommandSender(service, control)

  return (
    <div className="app">
      <header className="app__header">
        <h1>ROV Control</h1>
      </header>
      <main className="app__main">
        <section className="app__viewport">
          <VideoFeed bridge={bridge} />
          <HUD telemetry={telemetry} connected={connected} />
        </section>
        <ControlPanel control={control} gamepadConnected={gamepadConnected} />
      </main>
    </div>
  )
}

export default App
