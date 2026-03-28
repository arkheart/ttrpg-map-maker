import { Layer, Line } from 'react-konva'
import type { GridSettings } from '@/types/map'

interface Props {
  width: number
  height: number
  grid: GridSettings
}

export function GlobalGridLayer({ width, height, grid }: Props) {
  if (!grid.enabled || grid.size < 4) return null

  const color = grid.color ?? '#ffffff'
  const opacity = grid.opacity ?? 0.15
  const size = grid.size
  const lines: React.ReactElement[] = []

  // Vertical lines
  for (let x = 0; x <= width; x += size) {
    lines.push(
      <Line
        key={`gv-${x}`}
        points={[x, 0, x, height]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += size) {
    lines.push(
      <Line
        key={`gh-${y}`}
        points={[0, y, width, y]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }

  return <Layer listening={false}>{lines}</Layer>
}
