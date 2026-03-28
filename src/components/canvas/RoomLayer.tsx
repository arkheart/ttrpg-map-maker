import { Layer, Rect, Line, Text } from 'react-konva'
import type { MapRoom, MapCave } from '@/types/map'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'

interface Props {
  rooms: MapRoom[]
  caves: MapCave[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function RoomLayer({ rooms, caves, onSelect, selectedId }: Props) {
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()

  return (
    <Layer>
      {rooms.map(r => (
        <>
          <Rect
            key={r.id}
            id={r.id}
            x={r.x}
            y={r.y}
            width={r.width}
            height={r.height}
            fill={r.fill}
            stroke={selectedId === r.id ? '#00aaff' : '#ccc'}
            strokeWidth={selectedId === r.id ? 3 : 2}
            draggable={activeTool === 'select'}
            onClick={() => onSelect(r.id)}
            onDragEnd={e => {
              dispatch({
                type: 'UPDATE_ROOM',
                payload: { id: r.id, x: e.target.x(), y: e.target.y() },
              })
            }}
          />
          {r.label && (
            <Text
              key={`${r.id}-label`}
              x={r.x + r.width / 2}
              y={r.y + r.height / 2}
              text={r.label}
              fontSize={13}
              fill="#fff"
              offsetX={r.label.length * 3.5}
              offsetY={7}
              listening={false}
            />
          )}
        </>
      ))}

      {caves.map(c => (
        <>
          <Line
            key={c.id}
            id={c.id}
            points={c.points}
            fill={c.fill}
            stroke={selectedId === c.id ? '#00aaff' : '#aaa'}
            strokeWidth={selectedId === c.id ? 3 : 2}
            closed
            draggable={activeTool === 'select'}
            onClick={() => onSelect(c.id)}
            onDragEnd={e => {
              dispatch({
                type: 'UPDATE_CAVE',
                payload: { id: c.id, points: c.points.map((p, i) =>
                  i % 2 === 0 ? p + e.target.x() : p + e.target.y()
                )},
              })
              e.target.position({ x: 0, y: 0 })
            }}
          />
          {c.label && (
            <Text
              key={`${c.id}-label`}
              x={c.points[0]}
              y={c.points[1]}
              text={c.label}
              fontSize={13}
              fill="#fff"
              listening={false}
            />
          )}
        </>
      ))}
    </Layer>
  )
}
