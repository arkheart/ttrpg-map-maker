import { useRef, useState, useEffect } from 'react'
import { Stage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import { TerrainLayer } from './TerrainLayer'
import { TerrainDrawLayer } from './TerrainDrawLayer'
import { RoomLayer } from './RoomLayer'
import { ItemLayer } from './ItemLayer'
import { CaveDrawLayer } from './CaveDrawLayer'
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

interface DragStart { startX: number; startY: number }

interface Props {
  selectedElement: SelectedElement | null
  onSelect: (el: SelectedElement | null) => void
}

export function MapCanvas({ selectedElement, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const { width, height } = useCanvasSize(containerRef)
  const state = useMapState()
  const dispatch = useMapDispatch()
  const { activeTool, activeTerrainType, terrainDrawMode } = useMapTool()

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

  // Drag-draw state (room, terrain rect/ellipse)
  const [dragStart, setDragStart] = useState<DragStart | null>(null)
  const [previewRect, setPreviewRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  // Polygon state (cave + terrain custom)
  const [cavePoints, setCavePoints] = useState<number[]>([])
  const [terrainPoints, setTerrainPoints] = useState<number[]>([])
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

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

  const commitCave = (points: number[]) => {
    if (points.length < 6) return
    dispatch({ type: 'ADD_CAVE', payload: { id: crypto.randomUUID(), points, fill: CAVE_FILL } })
    setCavePoints([])
    setMousePos(null)
  }

  const commitTerrainCustom = (points: number[]) => {
    if (points.length < 6) return
    dispatch({ type: 'ADD_TERRAIN', payload: { id: crypto.randomUUID(), shape: 'custom', points, terrainType: activeTerrainType } })
    setTerrainPoints([])
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

    if (activeTool === 'cave' || (activeTool === 'terrain' && terrainDrawMode === 'custom')) {
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
    if (activeTool === 'cave') {
      if (isNearFirst(cavePoints, pos.x, pos.y)) commitCave(cavePoints)
      else setCavePoints(prev => [...prev, pos.x, pos.y])
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
    if (activeTool === 'cave' && cavePoints.length >= 6) {
      commitCave(cavePoints.slice(0, -2))
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

    const isDragTool =
      activeTool === 'room' ||
      (activeTool === 'terrain' && (terrainDrawMode === 'rect' || terrainDrawMode === 'ellipse'))
    if (!isDragTool) return
    if (e.target !== e.target.getStage()) return

    const pos = getPos(e)
    setDragStart({ startX: pos.x, startY: pos.y })
    setPreviewRect({ x: pos.x, y: pos.y, w: 0, h: 0 })
  }

  const handleMouseUp = (_e: KonvaEventObject<MouseEvent>) => {
    if (panStart.current) { panStart.current = null; return }
    if (!dragStart || !previewRect) return
    const { x, y, w, h } = previewRect

    if (w >= 5 && h >= 5) {
      const id = crypto.randomUUID()
      if (activeTool === 'room') {
        dispatch({ type: 'ADD_ROOM', payload: { id, x, y, width: w, height: h, fill: ROOM_FILL } })
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

  const nearFirstCave = activeTool === 'cave' && mousePos ? isNearFirst(cavePoints, mousePos.x, mousePos.y) : false
  const nearFirstTerrain = activeTool === 'terrain' && terrainDrawMode === 'custom' && mousePos ? isNearFirst(terrainPoints, mousePos.x, mousePos.y) : false
  const showHint = activeTool === 'cave' || (activeTool === 'terrain' && terrainDrawMode === 'custom')
  const activePoints = activeTool === 'cave' ? cavePoints : terrainPoints
  const nearFirst_ = nearFirstCave || nearFirstTerrain

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
        <TerrainLayer
          terrain={state.terrain}
          onSelect={id => handleSelect('terrain', id)}
          selectedId={selectedElement?.type === 'terrain' ? selectedElement.id : null}
        />
        <RoomLayer
          rooms={state.rooms}
          caves={state.caves}
          onSelect={id => handleSelect(state.rooms.some(r => r.id === id) ? 'room' : 'cave', id)}
          selectedId={selectedElement?.type === 'room' || selectedElement?.type === 'cave' ? selectedElement.id : null}
        />
        <ItemLayer
          items={state.items}
          onSelect={id => handleSelect('item', id)}
          selectedId={selectedElement?.type === 'item' ? selectedElement.id : null}
        />
        <GlobalGridLayer width={width} height={height} scale={scale} stagePos={stagePos} grid={state.globalGrid} />
        <CaveDrawLayer points={cavePoints} mousePos={activeTool === 'cave' ? mousePos : null} />
        <TerrainDrawLayer
          drawMode={terrainDrawMode}
          preview={activeTool === 'terrain' ? previewRect : null}
          points={activeTool === 'terrain' && terrainDrawMode === 'custom' ? terrainPoints : []}
          mousePos={activeTool === 'terrain' ? mousePos : null}
        />
      </Stage>

      {/* Rect preview overlay (room + terrain rect) */}
      {previewRect && previewRect.w > 2 && previewRect.h > 2 && terrainDrawMode !== 'ellipse' && (
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

      {/* Polygon hint */}
      {showHint && (
        <div style={{
          position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)', color: '#aaa',
          padding: '4px 12px', borderRadius: '4px', fontSize: '12px', pointerEvents: 'none',
        }}>
          {activePoints.length === 0
            ? 'Click to place first vertex'
            : nearFirst_
            ? 'Click to close shape'
            : `${activePoints.length / 2} vertices — click near start or double-click to close`}
        </div>
      )}
    </div>
  )
}
