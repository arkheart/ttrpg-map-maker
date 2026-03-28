import { useState, useEffect } from 'react'
import { Layer, Rect, Ellipse, Line, Text, Circle } from 'react-konva'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'
import { TERRAIN_PALETTE } from '@/types/map'
import type { MapRoom, MapCave, MapTerrain, MapItem } from '@/types/map'
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid'

const HANDLE_RADIUS = 6
const HANDLE_FILL = '#fff'
const HANDLE_STROKE = '#0088ff'

type RectPatch = { x?: number; y?: number; width?: number; height?: number }
type EllipsePatch = { radiusX?: number; radiusY?: number }

// Handles for rect shapes — 4 corners + 4 edge midpoints
// onLive fires during drag for preview, onCommit fires on release to persist
function RectHandles({ x, y, width, height, onLive, onCommit }: {
  x: number; y: number; width: number; height: number
  onLive: (patch: RectPatch) => void
  onCommit: (patch: RectPatch) => void
}) {
  const handles: { hx: number; hy: number; calc: (nx: number, ny: number) => RectPatch }[] = [
    { hx: x,             hy: y,              calc: (nx, ny) => ({ x: nx, y: ny, width: x + width - nx, height: y + height - ny }) },
    { hx: x + width,     hy: y,              calc: (nx, ny) => ({ y: ny, width: nx - x, height: y + height - ny }) },
    { hx: x + width,     hy: y + height,     calc: (nx, ny) => ({ width: nx - x, height: ny - y }) },
    { hx: x,             hy: y + height,     calc: (nx, ny) => ({ x: nx, width: x + width - nx, height: ny - y }) },
    { hx: x + width / 2, hy: y,              calc: (_nx, ny) => ({ y: ny, height: y + height - ny }) },
    { hx: x + width,     hy: y + height / 2, calc: (nx, _ny) => ({ width: nx - x }) },
    { hx: x + width / 2, hy: y + height,     calc: (_nx, ny) => ({ height: ny - y }) },
    { hx: x,             hy: y + height / 2, calc: (nx, _ny) => ({ x: nx, width: x + width - nx }) },
  ]
  return (
    <>
      {handles.map((h, i) => (
        <Circle
          key={i}
          x={h.hx} y={h.hy}
          radius={HANDLE_RADIUS}
          fill={HANDLE_FILL}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          draggable
          onDragMove={e => onLive(h.calc(e.target.x(), e.target.y()))}
          onDragEnd={e => {
            const patch = h.calc(e.target.x(), e.target.y())
            onCommit(patch)
            e.target.position({ x: h.hx, y: h.hy })
          }}
        />
      ))}
    </>
  )
}

// Handles for ellipse shapes — top, right, bottom, left
function EllipseHandles({ cx, cy, radiusX, radiusY, onLive, onCommit }: {
  cx: number; cy: number; radiusX: number; radiusY: number
  onLive: (patch: EllipsePatch) => void
  onCommit: (patch: EllipsePatch) => void
}) {
  const handles: { hx: number; hy: number; calc: (nx: number, ny: number) => EllipsePatch }[] = [
    { hx: cx,           hy: cy - radiusY, calc: (_nx, ny) => ({ radiusY: Math.max(4, cy - ny) }) },
    { hx: cx + radiusX, hy: cy,           calc: (nx, _ny) => ({ radiusX: Math.max(4, nx - cx) }) },
    { hx: cx,           hy: cy + radiusY, calc: (_nx, ny) => ({ radiusY: Math.max(4, ny - cy) }) },
    { hx: cx - radiusX, hy: cy,           calc: (nx, _ny) => ({ radiusX: Math.max(4, cx - nx) }) },
  ]
  return (
    <>
      {handles.map((h, i) => (
        <Circle
          key={i}
          x={h.hx} y={h.hy}
          radius={HANDLE_RADIUS}
          fill={HANDLE_FILL}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          draggable
          onDragMove={e => onLive(h.calc(e.target.x(), e.target.y()))}
          onDragEnd={e => {
            const patch = h.calc(e.target.x(), e.target.y())
            onCommit(patch)
            e.target.position({ x: h.hx, y: h.hy })
          }}
        />
      ))}
    </>
  )
}

// Handles for polygon/custom shapes — one handle per vertex
function PolyHandles({ points, onLive, onCommit }: {
  points: number[]
  onLive: (points: number[]) => void
  onCommit: (points: number[]) => void
}) {
  return (
    <>
      {Array.from({ length: points.length / 2 }, (_, i) => {
        const hx = points[i * 2]
        const hy = points[i * 2 + 1]
        const update = (nx: number, ny: number) => {
          const newPoints = [...points]
          newPoints[i * 2] = nx
          newPoints[i * 2 + 1] = ny
          return newPoints
        }
        return (
          <Circle
            key={i}
            x={hx} y={hy}
            radius={HANDLE_RADIUS}
            fill={HANDLE_FILL}
            stroke={HANDLE_STROKE}
            strokeWidth={2}
            draggable
            onDragMove={e => onLive(update(e.target.x(), e.target.y()))}
            onDragEnd={e => {
              onCommit(update(e.target.x(), e.target.y()))
              e.target.position({ x: hx, y: hy })
            }}
          />
        )
      })}
    </>
  )
}

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
  const editMode = activeTool === 'edit'

  return (
    <Layer>
      {type === 'terrain' && <TerrainElement t={element as MapTerrain} isSelected={isSelected} onSelect={onSelect} draggable={draggable} editMode={editMode} dispatch={dispatch} />}
      {type === 'room'    && <RoomElement    r={element as MapRoom}    isSelected={isSelected} onSelect={onSelect} draggable={draggable} editMode={editMode} dispatch={dispatch} />}
      {type === 'cave'    && <CaveElement    c={element as MapCave}    isSelected={isSelected} onSelect={onSelect} draggable={draggable} editMode={editMode} dispatch={dispatch} />}
      {type === 'item'    && <ItemElement    i={element as MapItem}    isSelected={isSelected} onSelect={onSelect} draggable={draggable} dispatch={dispatch} />}
    </Layer>
  )
}

// ── Terrain ───────────────────────────────────────────────────────

function TerrainElement({ t, isSelected, onSelect, draggable, editMode, dispatch }: {
  t: MapTerrain; isSelected: boolean; onSelect: () => void; draggable: boolean; editMode: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  const def = TERRAIN_PALETTE[t.terrainType]
  const stroke = isSelected ? '#00aaff' : def.stroke
  const strokeWidth = isSelected ? 2 : 1
  const shared = { onClick: onSelect, draggable }
  const showHandles = editMode && isSelected

  // Local draft for live handle preview
  const [draft, setDraft] = useState<typeof t>(t)
  useEffect(() => { setDraft(t) }, [t])
  const d = draft

  if (d.shape === 'rect') {
    return (
      <>
        <Rect
          id={t.id} x={d.x} y={d.y} width={d.width} height={d.height}
          fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
          {...shared}
          onDragEnd={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } })}
        />
        {t.grid && <RectGrid grid={t.grid} x={d.x} y={d.y} width={d.width} height={d.height} />}
        <Text x={d.x + d.width / 2} y={d.y + d.height / 2 - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
        {t.label && <Text x={d.x} y={d.y + d.height / 2 + 6} width={d.width} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
        {showHandles && <RectHandles x={d.x} y={d.y} width={d.width} height={d.height}
          onLive={patch => setDraft(prev => ({ ...prev, ...patch }))}
          onCommit={patch => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, ...patch } })} />}
      </>
    )
  }

  if (d.shape === 'ellipse') {
    return (
      <>
        <Ellipse
          id={t.id} x={d.x} y={d.y} radiusX={d.radiusX} radiusY={d.radiusY}
          fill={def.fill} stroke={stroke} strokeWidth={strokeWidth}
          {...shared}
          onDragEnd={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } })}
        />
        {t.grid && <EllipseGrid grid={t.grid} cx={d.x} cy={d.y} radiusX={d.radiusX} radiusY={d.radiusY} />}
        <Text x={d.x} y={d.y - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
        {t.label && <Text x={d.x - d.radiusX} y={d.y + 6} width={d.radiusX * 2} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
        {showHandles && <EllipseHandles cx={d.x} cy={d.y} radiusX={d.radiusX} radiusY={d.radiusY}
          onLive={patch => setDraft(prev => ({ ...prev, ...patch }))}
          onCommit={patch => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, ...patch } })} />}
      </>
    )
  }

  // custom
  const xs = d.points.filter((_, i) => i % 2 === 0)
  const ys = d.points.filter((_, i) => i % 2 !== 0)
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length
  const cy = ys.reduce((a, b) => a + b, 0) / ys.length
  const spanX = Math.max(...xs) - Math.min(...xs)
  return (
    <>
      <Line
        id={t.id} points={d.points} fill={def.fill} stroke={stroke} strokeWidth={strokeWidth} closed
        {...shared}
        onDragEnd={e => {
          dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, points: t.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } })
          e.target.position({ x: 0, y: 0 })
        }}
      />
      {t.grid && <PolyGrid grid={t.grid} points={d.points} />}
      <Text x={cx} y={cy - (t.label ? 12 : 8)} text={def.icon} fontSize={14} align="center" offsetX={7} listening={false} />
      {t.label && <Text x={cx - spanX / 2} y={cy + 6} width={spanX} text={t.label} fontSize={11} fill="#ddd" align="center" listening={false} />}
      {showHandles && <PolyHandles points={d.points}
        onLive={pts => setDraft(prev => ({ ...prev, points: pts }))}
        onCommit={pts => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, points: pts } })} />}
    </>
  )
}

// ── Room ─────────────────────────────────────────────────────────

function RoomElement({ r, isSelected, onSelect, draggable, editMode, dispatch }: {
  r: MapRoom; isSelected: boolean; onSelect: () => void; draggable: boolean; editMode: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  const stroke = isSelected ? '#00aaff' : '#ccc'
  const strokeWidth = isSelected ? 3 : 2
  const shared = { draggable, onClick: onSelect }
  const showHandles = editMode && isSelected

  // Local draft for live handle preview
  const [draft, setDraft] = useState<typeof r>(r)
  useEffect(() => { setDraft(r) }, [r])
  const d = draft

  if (d.shape === 'ellipse') {
    return (
      <>
        <Ellipse
          id={r.id} x={d.x} y={d.y} radiusX={d.radiusX} radiusY={d.radiusY}
          fill={r.fill} stroke={stroke} strokeWidth={strokeWidth}
          {...shared}
          onDragEnd={e => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } })}
        />
        {r.grid && <EllipseGrid grid={r.grid} cx={d.x} cy={d.y} radiusX={d.radiusX} radiusY={d.radiusY} />}
        {r.label && <Text x={d.x - d.radiusX} y={d.y - d.radiusY + 4} text={r.label} fontSize={13} fill="#fff" listening={false} />}
        {showHandles && <EllipseHandles cx={d.x} cy={d.y} radiusX={d.radiusX} radiusY={d.radiusY}
          onLive={patch => setDraft(prev => ({ ...prev, ...patch }))}
          onCommit={patch => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, ...patch } })} />}
      </>
    )
  }

  if (d.shape === 'custom') {
    const xs = d.points.filter((_, i) => i % 2 === 0)
    const ys = d.points.filter((_, i) => i % 2 !== 0)
    return (
      <>
        <Line
          id={r.id} points={d.points} fill={r.fill} stroke={stroke} strokeWidth={strokeWidth} closed
          {...shared}
          onDragEnd={e => {
            dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, points: r.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } })
            e.target.position({ x: 0, y: 0 })
          }}
        />
        {r.grid && <PolyGrid grid={r.grid} points={d.points} />}
        {r.label && <Text x={Math.min(...xs)} y={Math.min(...ys)} text={r.label} fontSize={13} fill="#fff" listening={false} />}
        {showHandles && <PolyHandles points={d.points}
          onLive={pts => setDraft(prev => ({ ...prev, points: pts }))}
          onCommit={pts => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, points: pts } })} />}
      </>
    )
  }

  // rect — d.shape === 'rect'
  return (
    <>
      <Rect
        id={r.id} x={d.x} y={d.y} width={d.width} height={d.height}
        fill={r.fill} stroke={stroke} strokeWidth={strokeWidth}
        {...shared}
        onDragEnd={e => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } })}
      />
      {r.grid && <RectGrid grid={r.grid} x={d.x} y={d.y} width={d.width} height={d.height} />}
      {r.label && (
        <Text
          x={d.x + d.width / 2} y={d.y + d.height / 2}
          text={r.label} fontSize={13} fill="#fff"
          offsetX={r.label.length * 3.5} offsetY={7}
          listening={false}
        />
      )}
      {showHandles && <RectHandles x={d.x} y={d.y} width={d.width} height={d.height}
        onLive={patch => setDraft(prev => ({ ...prev, ...patch }))}
        onCommit={patch => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, ...patch } })} />}
    </>
  )
}

// ── Cave ─────────────────────────────────────────────────────────

function CaveElement({ c, isSelected, onSelect, draggable, editMode, dispatch }: {
  c: MapCave; isSelected: boolean; onSelect: () => void; draggable: boolean; editMode: boolean; dispatch: ReturnType<typeof useMapDispatch>
}) {
  const showHandles = editMode && isSelected

  // Local draft for live handle preview
  const [draft, setDraft] = useState<typeof c>(c)
  useEffect(() => { setDraft(c) }, [c])
  const d = draft

  const cxs = d.points.filter((_, i) => i % 2 === 0)
  const cys = d.points.filter((_, i) => i % 2 !== 0)
  const ccx = cxs.reduce((a, b) => a + b, 0) / cxs.length
  const ccy = cys.reduce((a, b) => a + b, 0) / cys.length
  const spanX = Math.max(...cxs) - Math.min(...cxs)

  return (
    <>
      <Line
        id={c.id} points={d.points} fill={c.fill}
        stroke={isSelected ? '#00aaff' : '#aaa'}
        strokeWidth={isSelected ? 3 : 2}
        closed draggable={draggable}
        onClick={onSelect}
        onDragEnd={e => {
          dispatch({ type: 'UPDATE_CAVE', payload: { id: c.id, points: c.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } })
          e.target.position({ x: 0, y: 0 })
        }}
      />
      {c.grid && <PolyGrid grid={c.grid} points={d.points} />}
      {c.label && <Text x={ccx - spanX / 2} y={ccy - 7} width={spanX} text={c.label} fontSize={13} fill="#fff" align="center" listening={false} />}
      {showHandles && <PolyHandles points={d.points}
        onLive={pts => setDraft(prev => ({ ...prev, points: pts }))}
        onCommit={pts => dispatch({ type: 'UPDATE_CAVE', payload: { id: c.id, points: pts } })} />}
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
