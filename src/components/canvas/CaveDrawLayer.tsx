import { Layer, Line, Circle } from 'react-konva'

interface Props {
  points: number[]       // flat [x0,y0,x1,y1,...] committed vertices
  mousePos: { x: number; y: number } | null
}

export function CaveDrawLayer({ points, mousePos }: Props) {
  if (points.length === 0) return null

  // Preview line from last vertex to current mouse position
  const lastX = points[points.length - 2]
  const lastY = points[points.length - 1]
  const previewPoints = mousePos ? [lastX, lastY, mousePos.x, mousePos.y] : []

  return (
    <Layer listening={false}>
      {/* Filled polygon so far */}
      {points.length >= 4 && (
        <Line
          points={points}
          fill="rgba(45, 36, 16, 0.5)"
          stroke="#aaa"
          strokeWidth={2}
          closed
        />
      )}
      {/* Outline of placed edges */}
      <Line
        points={points}
        stroke="#aaa"
        strokeWidth={2}
        closed={false}
      />
      {/* Vertex dots */}
      {Array.from({ length: points.length / 2 }, (_, i) => (
        <Circle
          key={i}
          x={points[i * 2]}
          y={points[i * 2 + 1]}
          radius={i === 0 ? 6 : 4}
          fill={i === 0 ? '#00aaff' : '#fff'}
          stroke="#333"
          strokeWidth={1}
        />
      ))}
      {/* Preview line to mouse */}
      {previewPoints.length === 4 && (
        <Line
          points={previewPoints}
          stroke="#00aaff"
          strokeWidth={1}
          dash={[6, 4]}
        />
      )}
    </Layer>
  )
}
