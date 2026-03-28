import { Layer, Rect, Ellipse, Line, Text } from 'react-konva'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'
import { TERRAIN_PALETTE } from '@/types/map'
import type { MapRoom, MapCave, MapTerrain, MapItem } from '@/types/map'
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid'

interface Props {
  element: MapRoom | MapCave | MapTerrain | MapItem
  type: 'room' | 'cave' | 'terrain' | 'item'
  isSelected: boolean
  onSelect: () => void
}

export function ElementLayer({ element, type, isSelected, onSelect }: Props) {
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()
  const draggable = activeTool === 'select'

  return (
    <Layer>
      {type === 'terrain' && <TerrainElement t={element as MapTerrain} isSelected={isSelected} onSelect={onSelect} draggable={draggable} dispatch={dispatch} />}
      {type === 'room'    && <RoomElement    r={element as MapRoom}    isSelected={isSelected} onSelect={onSelect} draggable={draggable} dispatch={dispatch} />}
      {type === 'cave'    && <CaveElement    c={element as MapCave}    isSelected={isSelected} onSelect={onSelect} draggable={draggable} dispatch={dispatch} />}
      {type === 'item'    && <ItemElement    i={element as MapItem}    isSelected={isSelected} onSelect={onSelect} draggable={draggable} dispatch={dispatch} />}
    </Layer>
  )
}

// ── Terrain ───────────────────────────────────────────────────────

function TerrainElement({ t, isSelected, onSelect, draggable, dispatch }: {
  t: MapTerrain; isSelected: boolean; onSelect: () => void; draggable: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  const def = TERRAIN_PALETTE[t.terrainType]
  const stroke = isSelected ? '#00aaff' : def.stroke
  const strokeWidth = isSelected ? 2 : 1
  const shared = { onClick: onSelect, draggable }

  if (t.shape === 'rect') {
    return (
      <>
        <Rect
          id={t.id} x={t.x} y={t.y} width={t.width} height={t.height}
          fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
          {...shared}
          onDragEnd={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } })}
        />
        {t.grid && <RectGrid grid={t.grid} x={t.x} y={t.y} width={t.width} height={t.height} />}
        <Text x={t.x + t.width / 2} y={t.y + t.height / 2 - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
        {t.label && <Text x={t.x} y={t.y + t.height / 2 + 6} width={t.width} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
      </>
    )
  }

  if (t.shape === 'ellipse') {
    return (
      <>
        <Ellipse
          id={t.id} x={t.x} y={t.y} radiusX={t.radiusX} radiusY={t.radiusY}
          fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
          {...shared}
          onDragEnd={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } })}
        />
        {t.grid && <EllipseGrid grid={t.grid} cx={t.x} cy={t.y} radiusX={t.radiusX} radiusY={t.radiusY} />}
        <Text x={t.x} y={t.y - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
        {t.label && <Text x={t.x - t.radiusX} y={t.y + 6} width={t.radiusX * 2} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
      </>
    )
  }

  // custom
  const xs = t.points.filter((_, i) => i % 2 === 0)
  const ys = t.points.filter((_, i) => i % 2 !== 0)
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length
  const cy = ys.reduce((a, b) => a + b, 0) / ys.length
  const spanX = Math.max(...xs) - Math.min(...xs)
  return (
    <>
      <Line
        id={t.id} points={t.points} fill={def.fill} stroke={stroke} strokeWidth={strokeWidth} closed
        {...shared}
        onDragEnd={e => {
          dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, points: t.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } })
          e.target.position({ x: 0, y: 0 })
        }}
      />
      {t.grid && <PolyGrid grid={t.grid} points={t.points} />}
      <Text x={cx} y={cy - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
      {t.label && <Text x={cx - spanX / 2} y={cy + 6} width={spanX} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
    </>
  )
}

// ── Room ─────────────────────────────────────────────────────────

function RoomElement({ r, isSelected, onSelect, draggable, dispatch }: {
  r: MapRoom; isSelected: boolean; onSelect: () => void; draggable: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  const stroke = isSelected ? '#00aaff' : '#ccc'
  const strokeWidth = isSelected ? 3 : 2
  const shared = { draggable, onClick: onSelect }

  if (r.shape === 'ellipse') {
    return (
      <>
        <Ellipse
          id={r.id} x={r.x} y={r.y} radiusX={r.radiusX} radiusY={r.radiusY}
          fill={r.fill} stroke={stroke} strokeWidth={strokeWidth}
          {...shared}
          onDragEnd={e => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } })}
        />
        {r.grid && <EllipseGrid grid={r.grid} cx={r.x} cy={r.y} radiusX={r.radiusX} radiusY={r.radiusY} />}
        {r.label && <Text x={r.x - r.radiusX} y={r.y - r.radiusY + 4} text={r.label} fontSize={13} fill="#fff" listening={false} />}
      </>
    )
  }

  if (r.shape === 'custom') {
    const xs = r.points.filter((_, i) => i % 2 === 0)
    const ys = r.points.filter((_, i) => i % 2 !== 0)
    return (
      <>
        <Line
          id={r.id} points={r.points} fill={r.fill} stroke={stroke} strokeWidth={strokeWidth} closed
          {...shared}
          onDragEnd={e => {
            dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, points: r.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } })
            e.target.position({ x: 0, y: 0 })
          }}
        />
        {r.grid && <PolyGrid grid={r.grid} points={r.points} />}
        {r.label && <Text x={Math.min(...xs)} y={Math.min(...ys)} text={r.label} fontSize={13} fill="#fff" listening={false} />}
      </>
    )
  }

  // rect
  return (
    <>
      <Rect
        id={r.id} x={r.x} y={r.y} width={r.width} height={r.height}
        fill={r.fill} stroke={stroke} strokeWidth={strokeWidth}
        {...shared}
        onDragEnd={e => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } })}
      />
      {r.grid && <RectGrid grid={r.grid} x={r.x} y={r.y} width={r.width} height={r.height} />}
      {r.label && (
        <Text
          x={r.x + r.width / 2} y={r.y + r.height / 2}
          text={r.label} fontSize={13} fill="#fff"
          offsetX={r.label.length * 3.5} offsetY={7}
          listening={false}
        />
      )}
    </>
  )
}

// ── Cave ─────────────────────────────────────────────────────────

function CaveElement({ c, isSelected, onSelect, draggable, dispatch }: {
  c: MapCave; isSelected: boolean; onSelect: () => void; draggable: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  const cxs = c.points.filter((_, i) => i % 2 === 0)
  const cys = c.points.filter((_, i) => i % 2 !== 0)
  const ccx = cxs.reduce((a, b) => a + b, 0) / cxs.length
  const ccy = cys.reduce((a, b) => a + b, 0) / cys.length
  const spanX = Math.max(...cxs) - Math.min(...cxs)

  return (
    <>
      <Line
        id={c.id} points={c.points} fill={c.fill}
        stroke={isSelected ? '#00aaff' : '#aaa'}
        strokeWidth={isSelected ? 3 : 2}
        closed draggable={draggable}
        onClick={onSelect}
        onDragEnd={e => {
          dispatch({ type: 'UPDATE_CAVE', payload: { id: c.id, points: c.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } })
          e.target.position({ x: 0, y: 0 })
        }}
      />
      {c.grid && <PolyGrid grid={c.grid} points={c.points} />}
      {c.label && <Text x={ccx - spanX / 2} y={ccy - 7} width={spanX} text={c.label} fontSize={13} fill="#fff" align="center" listening={false} />}
    </>
  )
}

// ── Item ─────────────────────────────────────────────────────────

function ItemElement({ i, isSelected, onSelect, draggable, dispatch }: {
  i: MapItem; isSelected: boolean; onSelect: () => void; draggable: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  return (
    <Text
      id={i.id} x={i.x} y={i.y}
      text={i.symbol} fontSize={24}
      fill={isSelected ? '#00aaff' : '#fff'}
      draggable={draggable}
      onClick={onSelect}
      onDragEnd={e => dispatch({ type: 'UPDATE_ITEM', payload: { id: i.id, x: e.target.x(), y: e.target.y() } })}
    />
  )
}
