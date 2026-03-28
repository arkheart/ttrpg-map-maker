import { Group, Line } from 'react-konva'
import type { GridSettings } from '@/types/map'

interface RectGridProps {
  grid: GridSettings
  x: number
  y: number
  width: number
  height: number
}

/** Grid clipped to a rectangle (rooms, terrain rects) */
export function RectGrid({ grid, x, y, width, height }: RectGridProps) {
  if (!grid.enabled || grid.size < 4) return null

  const color = grid.color ?? '#ffffff'
  const opacity = grid.opacity ?? 0.2
  const size = grid.size
  const lines: React.ReactElement[] = []

  for (let dx = 0; dx <= width; dx += size) {
    lines.push(
      <Line
        key={`v-${dx}`}
        points={[x + dx, y, x + dx, y + height]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }
  for (let dy = 0; dy <= height; dy += size) {
    lines.push(
      <Line
        key={`h-${dy}`}
        points={[x, y + dy, x + width, y + dy]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }

  return (
    <Group
      clipX={x}
      clipY={y}
      clipWidth={width}
      clipHeight={height}
      listening={false}
    >
      {lines}
    </Group>
  )
}

interface PolyGridProps {
  grid: GridSettings
  points: number[]  // flat [x0,y0,x1,y1,...]
}

/** Grid clipped to an arbitrary polygon (caves, custom terrain) */
export function PolyGrid({ grid, points }: PolyGridProps) {
  if (!grid.enabled || grid.size < 4 || points.length < 6) return null

  const color = grid.color ?? '#ffffff'
  const opacity = grid.opacity ?? 0.2
  const size = grid.size

  const xs = points.filter((_, i) => i % 2 === 0)
  const ys = points.filter((_, i) => i % 2 !== 0)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = maxX - minX
  const height = maxY - minY

  const lines: React.ReactElement[] = []
  for (let dx = 0; dx <= width; dx += size) {
    lines.push(
      <Line
        key={`v-${dx}`}
        points={[minX + dx, minY, minX + dx, maxY]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }
  for (let dy = 0; dy <= height; dy += size) {
    lines.push(
      <Line
        key={`h-${dy}`}
        points={[minX, minY + dy, maxX, minY + dy]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }

  const pairs: [number, number][] = []
  for (let i = 0; i < points.length; i += 2) {
    pairs.push([points[i], points[i + 1]])
  }

  return (
    <Group
      clipFunc={(ctx: any) => {
        ctx.beginPath()
        ctx.moveTo(pairs[0][0], pairs[0][1])
        for (let i = 1; i < pairs.length; i++) {
          ctx.lineTo(pairs[i][0], pairs[i][1])
        }
        ctx.closePath()
      }}
      listening={false}
    >
      {lines}
    </Group>
  )
}

interface EllipseGridProps {
  grid: GridSettings
  cx: number
  cy: number
  radiusX: number
  radiusY: number
}

/** Grid clipped to an ellipse */
export function EllipseGrid({ grid, cx, cy, radiusX, radiusY }: EllipseGridProps) {
  if (!grid.enabled || grid.size < 4) return null

  const color = grid.color ?? '#ffffff'
  const opacity = grid.opacity ?? 0.2
  const size = grid.size
  const lines: React.ReactElement[] = []

  for (let dx = 0; dx <= radiusX * 2; dx += size) {
    lines.push(
      <Line
        key={`v-${dx}`}
        points={[cx - radiusX + dx, cy - radiusY, cx - radiusX + dx, cy + radiusY]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }
  for (let dy = 0; dy <= radiusY * 2; dy += size) {
    lines.push(
      <Line
        key={`h-${dy}`}
        points={[cx - radiusX, cy - radiusY + dy, cx + radiusX, cy - radiusY + dy]}
        stroke={color}
        strokeWidth={0.5}
        opacity={opacity}
        listening={false}
      />
    )
  }

  return (
    <Group
      clipFunc={(ctx: any) => {
        ctx.beginPath()
        ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2)
        ctx.closePath()
      }}
      listening={false}
    >
      {lines}
    </Group>
  )
}
