import { createContext, useContext, useState } from 'react'
import type { ToolType, TerrainType, TerrainDrawMode, RoomDrawMode } from '@/types/map'

interface MapToolContext {
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
  activeTerrainType: TerrainType
  setActiveTerrainType: (t: TerrainType) => void
  terrainDrawMode: TerrainDrawMode
  setTerrainDrawMode: (m: TerrainDrawMode) => void
  roomDrawMode: RoomDrawMode
  setRoomDrawMode: (m: RoomDrawMode) => void
}

export const MapToolContext = createContext<MapToolContext>({
  activeTool: 'select',
  setActiveTool: () => {},
  activeTerrainType: 'grass',
  setActiveTerrainType: () => {},
  terrainDrawMode: 'rect',
  setTerrainDrawMode: () => {},
  roomDrawMode: 'rect',
  setRoomDrawMode: () => {},
})

export function useMapToolState(): MapToolContext {
  const [activeTool, setActiveTool] = useState<ToolType>('select')
  const [activeTerrainType, setActiveTerrainType] = useState<TerrainType>('grass')
  const [terrainDrawMode, setTerrainDrawMode] = useState<TerrainDrawMode>('rect')
  const [roomDrawMode, setRoomDrawMode] = useState<RoomDrawMode>('rect')
  return { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode, roomDrawMode, setRoomDrawMode }
}

export function useMapTool() {
  return useContext(MapToolContext)
}
