import { useState, useEffect, useRef } from 'react'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { MapCanvas, type MapCanvasHandle } from '@/components/canvas/MapCanvas'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapStateContext, MapDispatchContext, useMapReducer, saveState, loadSavedMaps, saveMapToSlot, deleteMapSlot, loadCurrentMapMeta, saveCurrentMapMeta, exportMapToJson, validateAndImportMapJson } from '@/store/mapStore'
import type { SavedMapEntry, ValidationResult } from '@/store/mapStore'
import { MapToolContext, useMapToolState } from '@/hooks/useMapTool'
import type { SelectedElement } from '@/types/map'
import { MapsPanel } from '@/components/maps/MapsPanel'
import { ObjectsPanel } from '@/components/objects/ObjectsPanel'
import { DevMenu } from '@/components/dev/DevMenu'
import { HelpModal } from '@/components/help/HelpModal'
import { GenerateModal } from '@/components/generation/GenerateModal'
import { generateMap } from '@/generation/mapGenerator'
import type { GenerateParams } from '@/generation/mapGenerator'

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
  const [showHelp, setShowHelp] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)

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

  function handleExportMap(entry: SavedMapEntry) {
    exportMapToJson(entry)
  }

  function handleImportMap(json: string): ValidationResult {
    const result = validateAndImportMapJson(json)
    if (result.ok) {
      const entry = saveMapToSlot(result.name, result.state)
      setSavedMaps(loadSavedMaps())
      // Auto-load the imported map
      dispatch({ type: 'LOAD_STATE', payload: result.state })
      setCurrentMapId(entry.id)
      setCurrentMapName(entry.name)
      saveCurrentMapMeta({ id: entry.id, name: entry.name })
      setSelectedElement(null)
    }
    return result
  }

  function handleGenerate(params: GenerateParams) {
    const generated = generateMap(params)
    dispatch({ type: 'LOAD_STATE', payload: generated })
    setCurrentMapId(undefined)
    setCurrentMapName('Untitled Map')
    saveCurrentMapMeta(undefined)
    setSelectedElement(null)
    setShowGenerate(false)
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
              onOpenHelp={() => setShowHelp(true)}
              onGenerate={() => setShowGenerate(true)}
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
                  onExport={handleExportMap}
                  onImport={handleImportMap}
                  onClose={() => setShowMapsPanel(false)}
                />
              )}
            </div>
          </div>
          <DevMenu onClearAll={handleNewMap} />
          {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
          {showGenerate && (
            <GenerateModal
              onGenerate={handleGenerate}
              onClose={() => setShowGenerate(false)}
            />
          )}
        </MapToolContext.Provider>
      </MapDispatchContext.Provider>
    </MapStateContext.Provider>
  )
}
