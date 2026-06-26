import { useEffect, useState } from 'react'

export function useKeyboardHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' || (event.key === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey)) {
        const target = event.target as HTMLElement | null
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return { open, setOpen }
}
