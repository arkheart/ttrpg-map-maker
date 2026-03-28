import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { MapCanvas } from '@/components/canvas/MapCanvas';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MapStateContext, MapDispatchContext, useMapReducer, saveState } from '@/store/mapStore';
import { MapToolContext, useMapToolState } from '@/hooks/useMapTool';
export default function App() {
    const [state, dispatch] = useMapReducer();
    const toolState = useMapToolState();
    const [selectedElement, setSelectedElement] = useState(null);
    const canvasRef = useRef(null);
    useEffect(() => {
        saveState(state);
    }, [state]);
    return (_jsx(MapStateContext.Provider, { value: state, children: _jsx(MapDispatchContext.Provider, { value: dispatch, children: _jsx(MapToolContext.Provider, { value: toolState, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a1a', color: '#fff' }, children: [_jsx(Toolbar, { onExportPng: () => canvasRef.current?.exportPng() }), _jsxs("div", { style: { display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }, children: [_jsx(MapCanvas, { ref: canvasRef, selectedElement: selectedElement, onSelect: setSelectedElement }), _jsx(Sidebar, { selected: selectedElement })] })] }) }) }) }));
}
