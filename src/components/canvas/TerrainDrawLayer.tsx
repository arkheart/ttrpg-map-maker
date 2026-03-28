import { Layer, Ellipse, Line, Circle } from 'react-konva'
import type { TerrainDrawMode } from '@/types/map'

interface Props {
  drawMode: TerrainDrawMode
  // rect / ellipse drag preview
  preview: { x: number; y: number; w: number; h: number } | null
  // custom polygon in progress
  points: number[]
  mousePos: { x: number; y: number } | null
}

const CLOSE_THRESHOLD = 12

export function TerrainDrawLayer({ drawMode, preview, points, mousePos }: Props) {
  const isNearFirst = mousePos && points.length >= 4
    ? Math.hypot(mousePos.x - points[0], mousePos.y - points[1]) < CLOSE_THRESHOLD
    : false

  return (
    <Layer listening={false}>
      {/* Ellipse drag preview */}
      {drawMode === 'ellipse' && preview && preview.w > 2 && preview.h > 2 && (
        <Ellipse
          x={preview.x + preview.w / 2}
          y={preview.y + preview.h / 2}
          radiusX={preview.w / 2}
          radiusY={preview.h / 2}
          fill="rgba(74,124,78,0.3)"
          stroke="#00aaff"
          strokeWidth={2}
          dash={[6, 4]}
        />
      )}

      {/* Custom polygon in progress */}
      {drawMode === 'custom' && points.length >= 4 && (
        <Line
          points={points}
          fill="rgba(74,124,78,0.3)"
          stroke="#aaa"
          strokeWidth={2}
          closed
        />
      )}
      {drawMode === 'custom' && points.length >= 2 && (
        <Line
          points={points}
          stroke="#aaa"
          strokeWidth={2}
          closed={false}
        />
      )}
      {/* Vertex dots */}
      {drawMode === 'custom' && Array.from({ length: points.length / 2 }, (_, i) => (
        <Circle
          key={i}
          x={points[i * 2]}
          y={points[i * 2 + 1]}
          radius={i === 0 ? 6 : 4}
          fill={i === 0 ? (isNearFirst ? '#00ff88' : '#00aaff') : '#fff'}
          stroke="#333"
          strokeWidth={1}
        />
      ))}
      {/* Preview line to mouse */}
      {drawMode === 'custom' && points.length >= 2 && mousePos && (
        <Line
          points={[points[points.length - 2], points[points.length - 1], mousePos.x, mousePos.y]}
          stroke="#00aaff"
          strokeWidth={1}
          dash={[6, 4]}
        />
      )}
    </Layer>
  )
}
