import { useState, useEffect, useRef } from 'react'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { MapCanvas, type MapCanvasHandle } from '@/components/canvas/MapCanvas'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapStateContext, MapDispatchContext, useMapReducer, saveState, loadSavedMaps, saveMapToSlot, deleteMapSlot, loadCurrentMapMeta, saveCurrentMapMeta } from '@/store/mapStore'
import type { SavedMapEntry } from '@/store/mapStore'
import { MapToolContext, useMapToolState } from '@/hooks/useMapTool'
import type { SelectedElement } from '@/types/map'
import { MapsPanel } from '@/components/maps/MapsPanel'
import { ObjectsPanel } from '@/components/objects/ObjectsPanel'

export default function App() {
  const [state, dispatch] = useMapReducer()
  const toolState = useMapToolState()
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const canvasRef = useRef<MapCanvasHandle>(null)
  const [savedMaps, setSavedMaps] = useState<SavedMapEntry[]>(() => loadSavedMaps())
  const [currentMapId, setCurrentMapId] = useState<string | undefined>(() => loadCurrentMapMeta()?.id)
  const [currentMapName, setCurrentMapName] = useState<string>(() => loadCurrentMapMeta()?.name ?? 'Untitled Map')
  const [showMapsPanel, setShowMapsPanel] = useState(false)
  const [showObjectsPanel, setShowObjectsPanel] = useState(false)

  useEffect(() => {
    saveState(state)
    if (currentMapId) {
      saveMapToSlot(currentMapName, state, currentMapId)
      setSavedMaps(loadSavedMaps())
    }
  }, [state])

  function handleSaveMap(name: string) {
    const entry = saveMapToSlot(name, state, currentMapId)
    setCurrentMapId(entry.id)
    setCurrentMapName(entry.name)
    saveCurrentMapMeta({ id: entry.id, name: entry.name })
    setSavedMaps(loadSavedMaps())
  }

  function handleLoadMap(entry: SavedMapEntry) {
    dispatch({ type: 'LOAD_STATE', payload: entry.state })
    setCurrentMapId(entry.id)
    setCurrentMapName(entry.name)
    saveCurrentMapMeta({ id: entry.id, name: entry.name })
    setSelectedElement(null)
    setShowMapsPanel(false)
  }

  function handleDeleteMap(id: string) {
    deleteMapSlot(id)
    setSavedMaps(loadSavedMaps())
    if (currentMapId === id) {
      setCurrentMapId(undefined)
      setCurrentMapName('Untitled Map')
      saveCurrentMapMeta(undefined)
    }
  }

  function handleNewMap() {
    dispatch({ type: 'CLEAR_ALL' })
    setCurrentMapId(undefined)
    setCurrentMapName('Untitled Map')
    saveCurrentMapMeta(undefined)
    setSelectedElement(null)
    setShowMapsPanel(false)
  }

  return (
    <MapStateContext.Provider value={state}>
      <MapDispatchContext.Provider value={dispatch}>
        <MapToolContext.Provider value={toolState}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a1a', color: '#fff' }}>
            <Toolbar
              onExportPng={() => canvasRef.current?.exportPng()}
              onSaveMap={handleSaveMap}
              onNewMap={handleNewMap}
              onOpenMaps={() => setShowMapsPanel(v => !v)}
            onOpenObjects={() => setShowObjectsPanel(v => !v)}
              currentMapName={currentMapName}
              currentMapId={currentMapId}
            />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
              <MapCanvas ref={canvasRef} selectedElement={selectedElement} onSelect={setSelectedElement} />
              <Sidebar selected={selectedElement} />
              {showObjectsPanel && (
                <ObjectsPanel
                  selected={selectedElement}
                  onSelect={setSelectedElement}
                  onClose={() => setShowObjectsPanel(false)}
                />
              )}
              {showMapsPanel && (
                <MapsPanel
                  maps={savedMaps}
                  currentMapId={currentMapId}
                  onLoad={handleLoadMap}
                  onDelete={handleDeleteMap}
                  onClose={() => setShowMapsPanel(false)}
                />
              )}
            </div>
          </div>
        </MapToolContext.Provider>
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  )
}
