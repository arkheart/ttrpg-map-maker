import { type ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MapStateContext, MapDispatchContext } from '@/store/mapStore'
import { MapToolContext } from '@/hooks/useMapTool'
import type { MapState } from '@/types/map'

export const emptyMapState: MapState = {
  rooms: [],
  caves: [],
  terrain: [],
  items: [],
  globalGrid: { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 },
  layerOrder: [],
}

interface RenderWithContextOptions {
  mapState?: Partial<MapState>
  dispatch?: (...args: unknown[]) => void
  toolState?: Partial<typeof defaultToolState>
}

const defaultToolState = {
  activeTool: 'select' as const,
  setActiveTool: () => {},
  activeTerrainType: 'grass' as const,
  setActiveTerrainType: () => {},
  terrainDrawMode: 'rect' as const,
  setTerrainDrawMode: () => {},
  roomDrawMode: 'rect' as const,
  setRoomDrawMode: () => {},
  caveDrawMode: 'polygon' as const,
  setCaveDrawMode: () => {},
}

export function renderWithContext(
  ui: ReactNode,
  { mapState, dispatch = () => {}, toolState }: RenderWithContextOptions = {}
) {
  const state: MapState = { ...emptyMapState, ...mapState }
  const tool = { ...defaultToolState, ...toolState }

  return render(
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch as never}>
        <MapToolContext.Provider value={tool}>
          {ui}
        </MapToolContext.Provider>
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  )
}
