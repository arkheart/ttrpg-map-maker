import { useState, useEffect, RefObject } from 'react'

export function useCanvasSize(containerRef: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    observer.observe(el)
    // Set initial size
    setSize({ width: el.clientWidth, height: el.clientHeight })

    return () => observer.disconnect()
  }, [containerRef])

  return size
}
