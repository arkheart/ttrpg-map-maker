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
              <Text key={`${t.id}-i`} x={t.x + t.width / 2} y={t.y + t.height / 2 - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
              {t.label && <Text key={`${t.id}-l`} x={t.x} y={t.y + t.height / 2 + 6} width={t.width} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
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
              <Text key={`${t.id}-i`} x={t.x} y={t.y - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
              {t.label && <Text key={`${t.id}-l`} x={t.x - t.radiusX} y={t.y + 6} width={t.radiusX * 2} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
            </>
          )
        }

        if (t.shape === 'custom') {
          const xs = t.points.filter((_, i) => i % 2 === 0)
          const ys = t.points.filter((_, i) => i % 2 !== 0)
          const cx = xs.reduce((a, b) => a + b, 0) / xs.length
          const cy = ys.reduce((a, b) => a + b, 0) / ys.length
          const spanX = Math.max(...xs) - Math.min(...xs)
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
              <Text key={`${t.id}-i`} x={cx} y={cy - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
              {t.label && <Text key={`${t.id}-l`} x={cx - spanX / 2} y={cy + 6} width={spanX} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
            </>
          )
        }

        return null
      })}
    </Layer>
  )
}
