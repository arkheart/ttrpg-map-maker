import { useState, useEffect } from 'react'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { MapCanvas } from '@/components/canvas/MapCanvas'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapStateContext, MapDispatchContext, useMapReducer, saveState } from '@/store/mapStore'
import { MapToolContext, useMapToolState } from '@/hooks/useMapTool'
import type { SelectedElement } from '@/types/map'

export default function App() {
  const [state, dispatch] = useMapReducer()
  const toolState = useMapToolState()
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>
        <MapToolContext.Provider value={toolState}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a1a', color: '#fff' }}>
            <Toolbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
              <MapCanvas selectedElement={selectedElement} onSelect={setSelectedElement} />
              <Sidebar selected={selectedElement} />
            </div>
          </div>
        </MapToolContext.Provider>
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  )
}
