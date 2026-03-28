import { Layer, Rect, Ellipse, Line, Text } from 'react-konva'
import type { MapTerrain } from '@/types/map'
import { TERRAIN_PALETTE } from '@/types/map'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid'

interface Props {
  terrain: MapTerrain[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function TerrainLayer({ terrain, onSelect, selectedId }: Props) {
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()
  const draggable = activeTool === 'select'
  const selected = (id: string) => selectedId === id

  return (
    <Layer>
      {terrain.map(t => {
        const def = TERRAIN_PALETTE[t.terrainType]
        const stroke = selected(t.id) ? '#00aaff' : def.stroke
        const strokeWidth = selected(t.id) ? 2 : 1

        const sharedHandlers = {
          onClick: () => onSelect(t.id),
          draggable,
        }

        if (t.shape === 'rect') {
          return (
            <>
              <Rect
                key={t.id}
                id={t.id}
                x={t.x} y={t.y}
                width={t.width} height={t.height}
                fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
                {...sharedHandlers}
                onDragEnd={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } })}
              />
              {t.grid && <RectGrid key={`${t.id}-grid`} grid={t.grid} x={t.x} y={t.y} width={t.width} height={t.height} />}
              <Text key={`${t.id}-i`} x={t.x + 4} y={t.y + 4} text={def.icon} fontSize={14} listening={false} />
              {t.label && <Text key={`${t.id}-l`} x={t.x + 4} y={t.y + 22} text={t.label} fontSize={11} fill="#ddd" listening={false} />}
            </>
          )
        }

        if (t.shape === 'ellipse') {
          return (
            <>
              <Ellipse
                key={t.id}
                id={t.id}
                x={t.x} y={t.y}
                radiusX={t.radiusX} radiusY={t.radiusY}
                fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
                {...sharedHandlers}
                onDragEnd={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } })}
              />
              {t.grid && <EllipseGrid key={`${t.id}-grid`} grid={t.grid} cx={t.x} cy={t.y} radiusX={t.radiusX} radiusY={t.radiusY} />}
              <Text key={`${t.id}-i`} x={t.x - 8} y={t.y - 10} text={def.icon} fontSize={14} listening={false} />
              {t.label && <Text key={`${t.id}-l`} x={t.x - t.radiusX} y={t.y - t.radiusY + 4} text={t.label} fontSize={11} fill="#ddd" listening={false} />}
            </>
          )
        }

        if (t.shape === 'custom') {
          // Bounding box top-left for icon/label placement
          const xs = t.points.filter((_, i) => i % 2 === 0)
          const ys = t.points.filter((_, i) => i % 2 !== 0)
          const minX = Math.min(...xs)
          const minY = Math.min(...ys)
          return (
            <>
              <Line
                key={t.id}
                id={t.id}
                points={t.points}
                fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
                closed
                {...sharedHandlers}
                onDragEnd={e => {
                  dispatch({ type: 'UPDATE_TERRAIN', payload: {
                    id: t.id,
                    points: t.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()),
                  }})
                  e.target.position({ x: 0, y: 0 })
                }}
              />
              {t.grid && <PolyGrid key={`${t.id}-grid`} grid={t.grid} points={t.points} />}
              <Text key={`${t.id}-i`} x={minX + 4} y={minY + 4} text={def.icon} fontSize={14} listening={false} />
              {t.label && <Text key={`${t.id}-l`} x={minX + 4} y={minY + 22} text={t.label} fontSize={11} fill="#ddd" listening={false} />}
            </>
          )
        }

        return null
      })}
    </Layer>
  )
}
