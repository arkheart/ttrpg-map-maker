import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { MapCanvas } from '@/components/canvas/MapCanvas';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MapStateContext, MapDispatchContext, useMapReducer, saveState, loadSavedMaps, saveMapToSlot, deleteMapSlot, loadCurrentMapMeta, saveCurrentMapMeta } from '@/store/mapStore';
import { MapToolContext, useMapToolState } from '@/hooks/useMapTool';
import { MapsPanel } from '@/components/maps/MapsPanel';
import { ObjectsPanel } from '@/components/objects/ObjectsPanel';
import { DevMenu } from '@/components/dev/DevMenu';
export default function App() {
    const [state, dispatch] = useMapReducer();
    const toolState = useMapToolState();
    const [selectedElement, setSelectedElement] = useState(null);
    const canvasRef = useRef(null);
    const [savedMaps, setSavedMaps] = useState(() => loadSavedMaps());
    const [currentMapId, setCurrentMapId] = useState(() => loadCurrentMapMeta()?.id);
    const [currentMapName, setCurrentMapName] = useState(() => loadCurrentMapMeta()?.name ?? 'Untitled Map');
    const [showMapsPanel, setShowMapsPanel] = useState(false);
    const [showObjectsPanel, setShowObjectsPanel] = useState(false);
    useEffect(() => {
        saveState(state);
        if (currentMapId) {
            saveMapToSlot(currentMapName, state, currentMapId);
            setSavedMaps(loadSavedMaps());
        }
    }, [state]);
    function handleSaveMap(name) {
        const entry = saveMapToSlot(name, state, currentMapId);
        setCurrentMapId(entry.id);
        setCurrentMapName(entry.name);
        saveCurrentMapMeta({ id: entry.id, name: entry.name });
        setSavedMaps(loadSavedMaps());
    }
    function handleLoadMap(entry) {
        dispatch({ type: 'LOAD_STATE', payload: entry.state });
        setCurrentMapId(entry.id);
        setCurrentMapName(entry.name);
        saveCurrentMapMeta({ id: entry.id, name: entry.name });
        setSelectedElement(null);
        setShowMapsPanel(false);
    }
    function handleDeleteMap(id) {
        deleteMapSlot(id);
        setSavedMaps(loadSavedMaps());
        if (currentMapId === id) {
            setCurrentMapId(undefined);
            setCurrentMapName('Untitled Map');
            saveCurrentMapMeta(undefined);
        }
    }
    function handleNewMap() {
        dispatch({ type: 'CLEAR_ALL' });
        setCurrentMapId(undefined);
        setCurrentMapName('Untitled Map');
        saveCurrentMapMeta(undefined);
        setSelectedElement(null);
        setShowMapsPanel(false);
    }
    return (_jsx(MapStateContext.Provider, { value: state, children: _jsx(MapDispatchContext.Provider, { value: dispatch, children: _jsxs(MapToolContext.Provider, { value: toolState, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a1a', color: '#fff' }, children: [_jsx(Toolbar, { onExportPng: () => canvasRef.current?.exportPng(), onSaveMap: handleSaveMap, onNewMap: handleNewMap, onOpenMaps: () => setShowMapsPanel(v => !v), onOpenObjects: () => setShowObjectsPanel(v => !v), currentMapName: currentMapName, currentMapId: currentMapId }), _jsxs("div", { style: { display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }, children: [_jsx(MapCanvas, { ref: canvasRef, selectedElement: selectedElement, onSelect: setSelectedElement }), _jsx(Sidebar, { selected: selectedElement }), showObjectsPanel && (_jsx(ObjectsPanel, { selected: selectedElement, onSelect: setSelectedElement, onClose: () => setShowObjectsPanel(false) })), showMapsPanel && (_jsx(MapsPanel, { maps: savedMaps, currentMapId: currentMapId, onLoad: handleLoadMap, onDelete: handleDeleteMap, onClose: () => setShowMapsPanel(false) }))] })] }), _jsx(DevMenu, { onClearAll: handleNewMap })] }) }) }));
}
