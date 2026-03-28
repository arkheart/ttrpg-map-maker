import { Layer, Line } from 'react-konva'
import type { GridSettings } from '@/types/map'

interface Props {
  width: number
  height: number
  scale: number
  stagePos: { x: number; y: number }
  grid: GridSettings
}

export function GlobalGridLayer({ width, height, scale, stagePos, grid }: Props) {
  if (!grid.enabled || grid.size < 4) return null

  const color = grid.color ?? '#ffffff'
  const opacity = grid.opacity ?? 0.15
  const size = grid.size

  // Compute the visible world-space bounds
  const left = -stagePos.x / scale
  const top = -stagePos.y / scale
  const right = left + width / scale
  const bottom = top + height / scale

  // Snap start positions to the nearest grid line
  const startX = Math.floor(left / size) * size
  const startY = Math.floor(top / size) * size

  const lines: React.ReactElement[] = []

  for (let x = startX; x <= right; x += size) {
    lines.push(
      <Line
        key={`gv-${x}`}
        points={[x, top, x, bottom]}
        stroke={color}
        strokeWidth={0.5 / scale}
        opacity={opacity}
        listening={false}
      />
    )
  }

  for (let y = startY; y <= bottom; y += size) {
    lines.push(
      <Line
        key={`gh-${y}`}
        points={[left, y, right, y]}
        stroke={color}
        strokeWidth={0.5 / scale}
        opacity={opacity}
        listening={false}
      />
    )
  }

  return <Layer listening={false}>{lines}</Layer>
}
