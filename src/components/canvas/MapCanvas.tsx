import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Stage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import { ElementLayer } from './ElementLayer'
import { TerrainDrawLayer } from './TerrainDrawLayer'
import { CaveDrawLayer, PaintCaveDrawLayer } from './CaveDrawLayer'
import { GlobalGridLayer } from './GlobalGridLayer'
import { useMapState, useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'
import { useCanvasSize } from '@/hooks/useCanvasSize'
import type { SelectedElement } from '@/types/map'

const ROOM_FILL = '#3a3a3a'
const CAVE_FILL = '#2d2410'
const CLOSE_THRESHOLD = 12

const ZOOM_MIN = 0.2
const ZOOM_MAX = 8
const ZOOM_STEP = 1.1

const ITEM_SYMBOLS: Record<string, string> = {
  door: '🚪', chest: '📦', trap: '⚠', stairs: '🔼', torch: '🕯', monster: '👾',
}

const EXPORT_PADDING = 40
const EXPORT_PIXEL_RATIO = 2

interface DragStart { startX: number; startY: number }

interface Props {
  selectedElement: SelectedElement | null
  onSelect: (el: SelectedElement | null) => void
}

export interface MapCanvasHandle {
  exportPng: () => void
}

export const MapCanvas = forwardRef<MapCanvasHandle, Props>(function MapCanvas({ selectedElement, onSelect }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const { width, height } = useCanvasSize(containerRef)
  const state = useMapState()
  const dispatch = useMapDispatch()
  const { activeTool, activeTerrainType, terrainDrawMode, roomDrawMode, caveDrawMode } = useMapTool()

  // Viewport state
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const panStart = useRef<{ screenX: number; screenY: number; stageX: number; stageY: number } | null>(null)
  const [ctrlHeld, setCtrlHeld] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Control') setCtrlHeld(true) }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Control') { setCtrlHeld(false); panStart.current = null } }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  // Drag-draw state (rect/ellipse drag tools)
  const [dragStart, setDragStart] = useState<DragStart | null>(null)
  const [previewRect, setPreviewRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  // Polygon state
  const [cavePoints, setCavePoints] = useState<number[]>([])
  const [terrainPoints, setTerrainPoints] = useState<number[]>([])
  const [roomPoints, setRoomPoints] = useState<number[]>([])
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

  // Paint mode state
  const isPainting = useRef(false)
  const paintPointsRef = useRef<number[]>([])
  const [paintPreview, setPaintPreview] = useState<number[]>([])
  const [isPaintingState, setIsPaintingState] = useState(false)

  const getPos = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()!
    const pointer = stage.getPointerPosition()!
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    }
  }

  const isNearFirst = (points: number[], x: number, y: number) =>
    points.length >= 4 && Math.hypot(x - points[0], y - points[1]) < CLOSE_THRESHOLD

  // ── Commit helpers ─────────────────────────────────────────────

  // Ramer–Douglas–Peucker simplification for paint strokes
  const rdpSimplify = (pts: number[], epsilon: number): number[] => {
    if (pts.length <= 4) return pts
    const n = pts.length / 2
    let maxDist = 0
    let maxIdx = 0
    const x0 = pts[0], y0 = pts[1], xn = pts[n * 2 - 2], yn = pts[n * 2 - 1]
    const dx = xn - x0, dy = yn - y0
    const len = Math.hypot(dx, dy)
    for (let i = 1; i < n - 1; i++) {
      const px = pts[i * 2], py = pts[i * 2 + 1]
      const dist = len === 0
        ? Math.hypot(px - x0, py - y0)
        : Math.abs(dy * px - dx * py + xn * y0 - yn * x0) / len
      if (dist > maxDist) { maxDist = dist; maxIdx = i }
    }
    if (maxDist > epsilon) {
      const left = rdpSimplify(pts.slice(0, (maxIdx + 1) * 2), epsilon)
      const right = rdpSimplify(pts.slice(maxIdx * 2), epsilon)
      return [...left.slice(0, -2), ...right]
    }
    return [x0, y0, xn, yn]
  }

  const commitCave = (points: number[]) => {
    if (points.length < 6) return
    dispatch({ type: 'ADD_CAVE', payload: { id: crypto.randomUUID(), points, fill: CAVE_FILL } })
    setCavePoints([])
    setMousePos(null)
  }

  const commitPaintCave = () => {
    const pts = paintPointsRef.current
    isPainting.current = false
    setIsPaintingState(false)
    paintPointsRef.current = []
    setPaintPreview([])
    if (pts.length < 6) return
    const simplified = rdpSimplify(pts, 3)
    dispatch({ type: 'ADD_CAVE', payload: { id: crypto.randomUUID(), points: simplified, fill: CAVE_FILL } })
  }

  const commitTerrainCustom = (points: number[]) => {
    if (points.length < 6) return
    dispatch({ type: 'ADD_TERRAIN', payload: { id: crypto.randomUUID(), shape: 'custom', points, terrainType: activeTerrainType } })
    setTerrainPoints([])
    setMousePos(null)
  }

  const commitRoomCustom = (points: number[]) => {
    if (points.length < 6) return
    dispatch({ type: 'ADD_ROOM', payload: { id: crypto.randomUUID(), shape: 'custom', points, fill: ROOM_FILL } })
    setRoomPoints([])
    setMousePos(null)
  }

  // ── Mouse move ─────────────────────────────────────────────────

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (panStart.current) {
      const stage = e.target.getStage()!
      const pointer = stage.getPointerPosition()!
      setStagePos({
        x: panStart.current.stageX + (pointer.x - panStart.current.screenX),
        y: panStart.current.stageY + (pointer.y - panStart.current.screenY),
      })
      return
    }

    const pos = getPos(e)

    // Paint mode: collect points while mouse button is held
    if (activeTool === 'cave' && caveDrawMode === 'paint') {
      setMousePos(pos)
      if (isPainting.current) {
        const last = paintPointsRef.current
        const MIN_DIST = 4 / scale
        if (last.length === 0 || Math.hypot(pos.x - last[last.length - 2], pos.y - last[last.length - 1]) >= MIN_DIST) {
          paintPointsRef.current = [...last, pos.x, pos.y]
          setPaintPreview([...paintPointsRef.current])
        }
      }
      return
    }

    const isPolygonMode =
      (activeTool === 'cave' && caveDrawMode === 'polygon') ||
      (activeTool === 'terrain' && terrainDrawMode === 'custom') ||
      (activeTool === 'room' && roomDrawMode === 'custom')

    if (isPolygonMode) {
      setMousePos(pos)
      return
    }

    if (dragStart) {
      setPreviewRect({
        x: Math.min(dragStart.startX, pos.x),
        y: Math.min(dragStart.startY, pos.y),
        w: Math.abs(pos.x - dragStart.startX),
        h: Math.abs(pos.y - dragStart.startY),
      })
    }
  }

  const handleMouseLeave = () => setMousePos(null)

  // ── Ctrl+Scroll zoom ───────────────────────────────────────────

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey) return
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()!
    const oldScale = stage.scaleX()
    const direction = e.evt.deltaY < 0 ? 1 : -1
    const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldScale * (direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP)))

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }

    setScale(newScale)
    setStagePos(newPos)
  }

  // ── Click ──────────────────────────────────────────────────────

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    const pos = getPos(e)
    const onStage = e.target === e.target.getStage()

    // Cave polygon
    if (activeTool === 'cave' && caveDrawMode === 'polygon') {
      if (isNearFirst(cavePoints, pos.x, pos.y)) commitCave(cavePoints)
      else setCavePoints(prev => [...prev, pos.x, pos.y])
      return
    }

    // Paint mode clicks are handled by mousedown/up, not click
    if (activeTool === 'cave' && caveDrawMode === 'paint') return

    // Room custom polygon
    if (activeTool === 'room' && roomDrawMode === 'custom') {
      if (isNearFirst(roomPoints, pos.x, pos.y)) commitRoomCustom(roomPoints)
      else setRoomPoints(prev => [...prev, pos.x, pos.y])
      return
    }

    // Terrain custom polygon
    if (activeTool === 'terrain' && terrainDrawMode === 'custom') {
      if (isNearFirst(terrainPoints, pos.x, pos.y)) commitTerrainCustom(terrainPoints)
      else setTerrainPoints(prev => [...prev, pos.x, pos.y])
      return
    }

    if (activeTool === 'select' && onStage) { onSelect(null); return }

    if (activeTool === 'erase' && !onStage) {
      const id = e.target.id()
      if (id) dispatch({ type: 'DELETE_ELEMENT', payload: { id } })
      return
    }

    if (activeTool === 'item') {
      dispatch({ type: 'ADD_ITEM', payload: { id: crypto.randomUUID(), x: pos.x - 12, y: pos.y - 12, symbol: ITEM_SYMBOLS['door'] } })
      return
    }
  }

  const handleDblClick = (_e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'cave' && caveDrawMode === 'polygon' && cavePoints.length >= 6) {
      commitCave(cavePoints.slice(0, -2))
    }
    if (activeTool === 'room' && roomDrawMode === 'custom' && roomPoints.length >= 6) {
      commitRoomCustom(roomPoints.slice(0, -2))
    }
    if (activeTool === 'terrain' && terrainDrawMode === 'custom' && terrainPoints.length >= 6) {
      commitTerrainCustom(terrainPoints.slice(0, -2))
    }
  }

  // ── Mouse down / up (drag tools) ───────────────────────────────

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.ctrlKey) {
      const stage = e.target.getStage()!
      const pointer = stage.getPointerPosition()!
      panStart.current = { screenX: pointer.x, screenY: pointer.y, stageX: stagePos.x, stageY: stagePos.y }
      return
    }

    // Paint cave mode
    if (activeTool === 'cave' && caveDrawMode === 'paint') {
      const pos = getPos(e)
      isPainting.current = true
      setIsPaintingState(true)
      paintPointsRef.current = [pos.x, pos.y]
      setPaintPreview([pos.x, pos.y])
      return
    }

    const isDragTool =
      (activeTool === 'room' && (roomDrawMode === 'rect' || roomDrawMode === 'ellipse')) ||
      (activeTool === 'terrain' && (terrainDrawMode === 'rect' || terrainDrawMode === 'ellipse'))
    if (!isDragTool) return
    if (e.target !== e.target.getStage()) return

    const pos = getPos(e)
    setDragStart({ startX: pos.x, startY: pos.y })
    setPreviewRect({ x: pos.x, y: pos.y, w: 0, h: 0 })
  }

  const handleMouseUp = (_e: KonvaEventObject<MouseEvent>) => {
    if (panStart.current) { panStart.current = null; return }

    // Commit paint cave
    if (activeTool === 'cave' && caveDrawMode === 'paint' && isPainting.current) {
      commitPaintCave()
      return
    }

    if (!dragStart || !previewRect) return
    const { x, y, w, h } = previewRect

    if (w >= 5 && h >= 5) {
      const id = crypto.randomUUID()
      if (activeTool === 'room' && roomDrawMode === 'rect') {
        dispatch({ type: 'ADD_ROOM', payload: { id, shape: 'rect', x, y, width: w, height: h, fill: ROOM_FILL } })
      } else if (activeTool === 'room' && roomDrawMode === 'ellipse') {
        dispatch({ type: 'ADD_ROOM', payload: { id, shape: 'ellipse', x: x + w / 2, y: y + h / 2, radiusX: w / 2, radiusY: h / 2, fill: ROOM_FILL } })
      } else if (activeTool === 'terrain' && terrainDrawMode === 'rect') {
        dispatch({ type: 'ADD_TERRAIN', payload: { id, shape: 'rect', x, y, width: w, height: h, terrainType: activeTerrainType } })
      } else if (activeTool === 'terrain' && terrainDrawMode === 'ellipse') {
        dispatch({ type: 'ADD_TERRAIN', payload: { id, shape: 'ellipse', x: x + w / 2, y: y + h / 2, radiusX: w / 2, radiusY: h / 2, terrainType: activeTerrainType } })
      }
    }

    setDragStart(null)
    setPreviewRect(null)
  }

  // ── Select / erase via layer callbacks ─────────────────────────

  const handleSelect = (type: SelectedElement['type'], id: string) => {
    if (activeTool === 'erase') dispatch({ type: 'DELETE_ELEMENT', payload: { id } })
    else if (activeTool === 'select') onSelect({ type, id })
  }

  useImperativeHandle(ref, () => ({
    exportPng() {
      const stage = stageRef.current
      if (!stage) return
      // Compute bounding box of all map content
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const r of state.rooms) {
        if (r.shape === 'rect' || !r.shape) {
          minX = Math.min(minX, r.x); minY = Math.min(minY, r.y)
          maxX = Math.max(maxX, r.x + r.width); maxY = Math.max(maxY, r.y + r.height)
        } else if (r.shape === 'ellipse') {
          minX = Math.min(minX, r.x - r.radiusX); minY = Math.min(minY, r.y - r.radiusY)
          maxX = Math.max(maxX, r.x + r.radiusX); maxY = Math.max(maxY, r.y + r.radiusY)
        } else if (r.shape === 'custom') {
          for (let i = 0; i < r.points.length; i += 2) {
            minX = Math.min(minX, r.points[i]); maxX = Math.max(maxX, r.points[i])
            minY = Math.min(minY, r.points[i + 1]); maxY = Math.max(maxY, r.points[i + 1])
          }
        }
      }
      for (const c of state.caves) {
        for (let i = 0; i < c.points.length; i += 2) {
          minX = Math.min(minX, c.points[i]); maxX = Math.max(maxX, c.points[i])
          minY = Math.min(minY, c.points[i + 1]); maxY = Math.max(maxY, c.points[i + 1])
        }
      }
      for (const t of state.terrain) {
        if (t.shape === 'rect') {
          minX = Math.min(minX, t.x); minY = Math.min(minY, t.y)
          maxX = Math.max(maxX, t.x + t.width); maxY = Math.max(maxY, t.y + t.height)
        } else if (t.shape === 'ellipse') {
          minX = Math.min(minX, t.x - t.radiusX); minY = Math.min(minY, t.y - t.radiusY)
          maxX = Math.max(maxX, t.x + t.radiusX); maxY = Math.max(maxY, t.y + t.radiusY)
        } else if (t.shape === 'custom') {
          for (let i = 0; i < t.points.length; i += 2) {
            minX = Math.min(minX, t.points[i]); maxX = Math.max(maxX, t.points[i])
            minY = Math.min(minY, t.points[i + 1]); maxY = Math.max(maxY, t.points[i + 1])
          }
        }
      }
      for (const item of state.items) {
        minX = Math.min(minX, item.x); minY = Math.min(minY, item.y)
        maxX = Math.max(maxX, item.x + 24); maxY = Math.max(maxY, item.y + 24)
      }
      if (!isFinite(minX)) { alert('Nothing to export — draw something first!'); return }
      const x = minX - EXPORT_PADDING
      const y = minY - EXPORT_PADDING
      const width = (maxX - minX) + EXPORT_PADDING * 2
      const height = (maxY - minY) + EXPORT_PADDING * 2
      const dataURL = stage.toDataURL({ x, y, width, height, pixelRatio: EXPORT_PIXEL_RATIO })
      const link = document.createElement('a')
      link.download = 'map.png'
      link.href = dataURL
      link.click()
    }
  }))

  const nearFirstCave = activeTool === 'cave' && caveDrawMode === 'polygon' && mousePos ? isNearFirst(cavePoints, mousePos.x, mousePos.y) : false
  const nearFirstRoom = activeTool === 'room' && roomDrawMode === 'custom' && mousePos ? isNearFirst(roomPoints, mousePos.x, mousePos.y) : false
  const nearFirstTerrain = activeTool === 'terrain' && terrainDrawMode === 'custom' && mousePos ? isNearFirst(terrainPoints, mousePos.x, mousePos.y) : false
  const nearFirst_ = nearFirstCave || nearFirstRoom || nearFirstTerrain

  const showHint =
    (activeTool === 'cave' && caveDrawMode === 'polygon') ||
    (activeTool === 'cave' && caveDrawMode === 'paint') ||
    (activeTool === 'room' && roomDrawMode === 'custom') ||
    (activeTool === 'terrain' && terrainDrawMode === 'custom')

  const activePoints =
    activeTool === 'cave' ? cavePoints :
    activeTool === 'room' ? roomPoints :
    terrainPoints

  // Ellipse preview check — suppress dashed rect overlay when drawing ellipses
  const isEllipseMode =
    (activeTool === 'room' && roomDrawMode === 'ellipse') ||
    (activeTool === 'terrain' && terrainDrawMode === 'ellipse')

  return (
    <div ref={containerRef} style={{ flex: 1, background: '#1a1a1a', overflow: 'hidden', position: 'relative', minWidth: 0, minHeight: 0 }}>
      <Stage
        ref={stageRef}
        width={width} height={height}
        scaleX={scale} scaleY={scale}
        x={stagePos.x} y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ cursor: ctrlHeld ? (panStart.current ? 'grabbing' : 'grab') : activeTool === 'select' ? 'default' : nearFirst_ ? 'cell' : 'crosshair' }}
      >
        {state.layerOrder.map(id => {
          const room = state.rooms.find(r => r.id === id)
          if (room) return <ElementLayer key={id} element={room} type="room" isSelected={selectedElement?.id === id} onSelect={() => handleSelect('room', id)} />
          const cave = state.caves.find(c => c.id === id)
          if (cave) return <ElementLayer key={id} element={cave} type="cave" isSelected={selectedElement?.id === id} onSelect={() => handleSelect('cave', id)} />
          const terrain = state.terrain.find(t => t.id === id)
          if (terrain) return <ElementLayer key={id} element={terrain} type="terrain" isSelected={selectedElement?.id === id} onSelect={() => handleSelect('terrain', id)} />
          const item = state.items.find(i => i.id === id)
          if (item) return <ElementLayer key={id} element={item} type="item" isSelected={selectedElement?.id === id} onSelect={() => handleSelect('item', id)} />
          return null
        })}
        <GlobalGridLayer width={width} height={height} scale={scale} stagePos={stagePos} grid={state.globalGrid} />
        <CaveDrawLayer points={cavePoints} mousePos={activeTool === 'cave' && caveDrawMode === 'polygon' ? mousePos : null} />
        <PaintCaveDrawLayer points={activeTool === 'cave' && caveDrawMode === 'paint' ? paintPreview : []} />
        <CaveDrawLayer points={roomPoints} mousePos={activeTool === 'room' && roomDrawMode === 'custom' ? mousePos : null} color="#00aaff" />
        <TerrainDrawLayer
          drawMode={terrainDrawMode}
          preview={activeTool === 'terrain' ? previewRect : null}
          points={activeTool === 'terrain' && terrainDrawMode === 'custom' ? terrainPoints : []}
          mousePos={activeTool === 'terrain' ? mousePos : null}
        />
        <TerrainDrawLayer
          drawMode={roomDrawMode}
          preview={activeTool === 'room' && (roomDrawMode === 'rect' || roomDrawMode === 'ellipse') ? previewRect : null}
          points={[]}
          mousePos={null}
        />
      </Stage>

      {/* Rect preview overlay */}
      {previewRect && previewRect.w > 2 && previewRect.h > 2 && !isEllipseMode && (
        <div style={{
          position: 'absolute',
          left: previewRect.x * scale + stagePos.x,
          top: previewRect.y * scale + stagePos.y,
          width: previewRect.w * scale,
          height: previewRect.h * scale,
          border: '2px dashed #00aaff',
          pointerEvents: 'none',
        }} />
      )}

      {/* Polygon / paint hint */}
      {showHint && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)', color: '#aaa',
          padding: '4px 12px', borderRadius: '4px', fontSize: '12px', pointerEvents: 'none',
        }}>
          {activeTool === 'cave' && caveDrawMode === 'paint'
            ? (isPaintingState ? 'Release to finish cave' : 'Click and drag to paint a cave')
            : activePoints.length === 0
            ? 'Click to place first vertex'
            : nearFirst_
            ? 'Click to close shape'
            : `${activePoints.length / 2} vertices — click near start or double-click to close`}
        </div>
      )}
    </div>
  )
})
