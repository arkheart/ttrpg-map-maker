import { Layer, Rect, Ellipse, Line, Text } from 'react-konva'
import type { MapRoom, MapCave } from '@/types/map'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid'

interface Props {
  rooms: MapRoom[]
  caves: MapCave[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function RoomLayer({ rooms, caves, onSelect, selectedId }: Props) {
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()
  const draggable = activeTool === 'select'

  return (
    <Layer>
      {rooms.map(r => {
        const isSelected = selectedId === r.id
        const stroke = isSelected ? '#00aaff' : '#ccc'
        const strokeWidth = isSelected ? 3 : 2
        const shared = { draggable, onClick: () => onSelect(r.id) }

        if (r.shape === 'ellipse') {
          return (
            <>
              <Ellipse
                key={r.id}
                id={r.id}
                x={r.x} y={r.y}
                radiusX={r.radiusX} radiusY={r.radiusY}
                fill={r.fill}
                stroke={stroke} strokeWidth={strokeWidth}
                {...shared}
                onDragEnd={e => {
                  dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } })
                }}
              />
              {r.grid && <EllipseGrid key={`${r.id}-grid`} grid={r.grid} cx={r.x} cy={r.y} radiusX={r.radiusX} radiusY={r.radiusY} />}
              {r.label && <Text key={`${r.id}-label`} x={r.x - r.radiusX} y={r.y - r.radiusY + 4} text={r.label} fontSize={13} fill="#fff" listening={false} />}
            </>
          )
        }

        if (r.shape === 'custom') {
          const xs = r.points.filter((_, i) => i % 2 === 0)
          const ys = r.points.filter((_, i) => i % 2 !== 0)
          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          return (
            <>
              <Line
                key={r.id}
                id={r.id}
                points={r.points}
                fill={r.fill}
                stroke={stroke} strokeWidth={strokeWidth}
                closed
                {...shared}
                onDragEnd={e => {
                  dispatch({ type: 'UPDATE_ROOM', payload: {
                    id: r.id,
                    points: r.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()),
                  }})
                  e.target.position({ x: 0, y: 0 })
                }}
              />
              {r.grid && <PolyGrid key={`${r.id}-grid`} grid={r.grid} points={r.points} />}
              {r.label && <Text key={`${r.id}-label`} x={minX} y={minY} text={r.label} fontSize={13} fill="#fff" listening={false} />}
            </>
          )
        }

        // Default: rect
        return (
          <>
            <Rect
              key={r.id}
              id={r.id}
              x={r.x} y={r.y}
              width={r.width} height={r.height}
              fill={r.fill}
              stroke={stroke} strokeWidth={strokeWidth}
              {...shared}
              onDragEnd={e => {
                dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } })
              }}
            />
            {r.grid && <RectGrid key={`${r.id}-grid`} grid={r.grid} x={r.x} y={r.y} width={r.width} height={r.height} />}
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
        )
      })}

      {caves.map(c => {
        const cxs = c.points.filter((_, i) => i % 2 === 0)
        const cys = c.points.filter((_, i) => i % 2 !== 0)
        const ccx = cxs.reduce((a, b) => a + b, 0) / cxs.length
        const ccy = cys.reduce((a, b) => a + b, 0) / cys.length
        const spanX = Math.max(...cxs) - Math.min(...cxs)
        return (
          <>
            <Line
              key={c.id}
              id={c.id}
              points={c.points}
              fill={c.fill}
              stroke={selectedId === c.id ? '#00aaff' : '#aaa'}
              strokeWidth={selectedId === c.id ? 3 : 2}
              closed
              draggable={draggable}
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
            {c.grid && <PolyGrid key={`${c.id}-grid`} grid={c.grid} points={c.points} />}
            {c.label && (
              <Text
                key={`${c.id}-label`}
                x={ccx - spanX / 2}
                y={ccy - 7}
                width={spanX}
                text={c.label}
                fontSize={13}
                fill="#fff"
                align="center"
                listening={false}
              />
            )}
          </>
        )
      })}
    </Layer>
  )
}
