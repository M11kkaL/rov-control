import { useEffect, useState } from 'react'

export function useClock(): string {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
