import { createContext, useContext, useState } from 'react'
import type { ToolType } from '@/types/map'

interface MapToolContext {
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void
}

export const MapToolContext = createContext<MapToolContext>({
  activeTool: 'select',
  setActiveTool: () => {},
})

export function useMapToolState(): MapToolContext {
  const [activeTool, setActiveTool] = useState<ToolType>('select')
  return { activeTool, setActiveTool }
}

export function useMapTool() {
  return useContext(MapToolContext)
}
