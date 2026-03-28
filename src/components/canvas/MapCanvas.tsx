import { useRef, useState } from 'react'
import { Stage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { TerrainLayer } from './TerrainLayer'
import { RoomLayer } from './RoomLayer'
import { ItemLayer } from './ItemLayer'
import { useMapState, useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'
import { useCanvasSize } from '@/hooks/useCanvasSize'
import type { SelectedElement } from '@/types/map'

const TERRAIN_COLORS: Record<string, string> = {
  grass: '#4a7c4e',
  water: '#2b5f8a',
  stone: '#666',
  sand: '#c2a96e',
  dirt: '#8b6340',
}

const ROOM_FILL = '#3a3a3a'
const CAVE_FILL = '#2d2410'

const ITEM_SYMBOLS: Record<string, string> = {
  door: '🚪',
  chest: '📦',
  trap: '⚠',
  stairs: '🔼',
  torch: '🕯',
  monster: '👾',
}

interface DrawState {
  startX: number
  startY: number
}

interface Props {
  selectedElement: SelectedElement | null
  onSelect: (el: SelectedElement | null) => void
}

export function MapCanvas({ selectedElement, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height } = useCanvasSize(containerRef)
  const state = useMapState()
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()

  const [drawing, setDrawing] = useState<DrawState | null>(null)
  const [previewRect, setPreviewRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const getPos = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()!
    const pos = stage.getPointerPosition()!
    return pos
  }

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select' || activeTool === 'erase' || activeTool === 'item') return
    if (e.target !== e.target.getStage()) return // only on empty canvas

    const pos = getPos(e)
    setDrawing({ startX: pos.x, startY: pos.y })
    setPreviewRect({ x: pos.x, y: pos.y, w: 0, h: 0 })
  }

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!drawing) return
    const pos = getPos(e)
    setPreviewRect({
      x: Math.min(drawing.startX, pos.x),
      y: Math.min(drawing.startY, pos.y),
      w: Math.abs(pos.x - drawing.startX),
      h: Math.abs(pos.y - drawing.startY),
    })
  }

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (!drawing || !previewRect) return
    const { x, y, w, h } = previewRect

    if (w < 5 || h < 5) {
      setDrawing(null)
      setPreviewRect(null)
      return
    }

    const id = crypto.randomUUID()

    if (activeTool === 'room') {
      dispatch({ type: 'ADD_ROOM', payload: { id, x, y, width: w, height: h, fill: ROOM_FILL } })
    } else if (activeTool === 'cave') {
      // Approximate cave shape as a rough polygon around the drawn rect
      const cx = x + w / 2
      const cy = y + h / 2
      const rx = w / 2
      const ry = h / 2
      const points = [
        cx - rx * 0.6, cy - ry,
        cx + rx * 0.3, cy - ry * 0.9,
        cx + rx, cy - ry * 0.3,
        cx + rx * 0.8, cy + ry * 0.5,
        cx, cy + ry,
        cx - rx * 0.7, cy + ry * 0.8,
        cx - rx, cy + ry * 0.2,
        cx - rx * 0.9, cy - ry * 0.5,
      ]
      dispatch({ type: 'ADD_CAVE', payload: { id, points, fill: CAVE_FILL } })
    } else if (activeTool === 'terrain') {
      dispatch({ type: 'ADD_TERRAIN', payload: { id, x, y, width: w, height: h, fill: TERRAIN_COLORS['grass'] } })
    }

    setDrawing(null)
    setPreviewRect(null)
  }

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select' && e.target === e.target.getStage()) {
      onSelect(null)
    }
    if (activeTool === 'erase' && e.target !== e.target.getStage()) {
      const id = e.target.id()
      if (id) dispatch({ type: 'DELETE_ELEMENT', payload: { id } })
    }
    if (activeTool === 'item') {
      const pos = getPos(e)
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: crypto.randomUUID(),
          x: pos.x - 12,
          y: pos.y - 12,
          symbol: ITEM_SYMBOLS['door'],
        },
      })
    }
  }

  const handleSelect = (type: SelectedElement['type'], id: string) => {
    if (activeTool === 'erase') {
      dispatch({ type: 'DELETE_ELEMENT', payload: { id } })
    } else if (activeTool === 'select') {
      onSelect({ type, id })
    }
  }

  return (
    <div ref={containerRef} style={{ flex: 1, background: '#1a1a1a', overflow: 'hidden' }}>
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
        style={{ cursor: activeTool === 'erase' ? 'crosshair' : activeTool === 'select' ? 'default' : 'crosshair' }}
      >
        <TerrainLayer
          terrain={state.terrain}
          onSelect={id => handleSelect('terrain', id)}
          selectedId={selectedElement?.type === 'terrain' ? selectedElement.id : null}
        />
        <RoomLayer
          rooms={state.rooms}
          caves={state.caves}
          onSelect={id => {
            const isRoom = state.rooms.some(r => r.id === id)
            handleSelect(isRoom ? 'room' : 'cave', id)
          }}
          selectedId={
            selectedElement?.type === 'room' || selectedElement?.type === 'cave'
              ? selectedElement.id
              : null
          }
        />
        <ItemLayer
          items={state.items}
          onSelect={id => handleSelect('item', id)}
          selectedId={selectedElement?.type === 'item' ? selectedElement.id : null}
        />
      </Stage>
      {previewRect && previewRect.w > 2 && previewRect.h > 2 && (
        <div
          style={{
            position: 'absolute',
            left: previewRect.x,
            top: previewRect.y,
            width: previewRect.w,
            height: previewRect.h,
            border: '2px dashed #00aaff',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
