import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMapTool } from '@/hooks/useMapTool';
import { useMapState, useMapDispatch } from '@/store/mapStore';
import { TERRAIN_PALETTE } from '@/types/map';
import { ToolButton } from './ToolButton';
const SHAPE_MODES = [
    { mode: 'rect', label: 'Square', icon: '⬜' },
    { mode: 'ellipse', label: 'Circle', icon: '⭕' },
    { mode: 'custom', label: 'Custom', icon: '✏️' },
];
const CAVE_MODES = [
    { mode: 'polygon', label: 'Polygon', icon: '✏️' },
    { mode: 'paint', label: 'Paint', icon: '🖌️' },
];
const TOOLS = [
    { tool: 'select', label: 'Select', icon: '↖' },
    { tool: 'room', label: 'Room', icon: '⬜' },
    { tool: 'cave', label: 'Cave', icon: '🪨' },
    { tool: 'terrain', label: 'Terrain', icon: '🌿' },
    { tool: 'item', label: 'Item', icon: '📌' },
    { tool: 'erase', label: 'Erase', icon: '✕' },
];
const subRowBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 12px',
    height: '34px',
    borderTop: '1px solid #2e2e2e',
    background: '#1e1e1e',
    flexShrink: 0,
};
const labelStyle = {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginRight: '2px',
};
const divider = _jsx("div", { style: { width: '1px', height: '18px', background: '#333', margin: '0 2px' } });
function ModeBtn({ label, icon, active, onClick }) {
    return (_jsxs("button", { title: label, onClick: onClick, style: {
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 9px',
            background: active ? '#0066cc' : '#2a2a2a',
            color: '#fff',
            border: `1px solid ${active ? '#0088ff' : '#3a3a3a'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: active ? 600 : 400,
        }, children: [_jsx("span", { children: icon }), _jsx("span", { children: label })] }));
}
export function Toolbar({ onExportPng }) {
    const { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode, roomDrawMode, setRoomDrawMode, caveDrawMode, setCaveDrawMode } = useMapTool();
    const dispatch = useMapDispatch();
    const { globalGrid } = useMapState();
    return (_jsxs("div", { style: { background: '#252525', borderBottom: '1px solid #333', flexShrink: 0 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }, children: [TOOLS.map(({ tool, label, icon }) => (_jsx(ToolButton, { icon: icon, label: label, active: activeTool === tool, onClick: () => setActiveTool(tool) }, tool))), _jsx("div", { style: { width: '1px', height: '24px', background: '#444', margin: '0 6px' } }), _jsx("span", { style: { fontSize: '11px', color: '#777' }, children: "Grid" }), _jsx("button", { title: globalGrid.enabled ? 'Disable grid' : 'Enable grid', onClick: () => dispatch({ type: 'SET_GLOBAL_GRID', payload: { enabled: !globalGrid.enabled } }), style: {
                            padding: '3px 9px',
                            background: globalGrid.enabled ? '#0066cc' : '#2a2a2a',
                            color: '#fff',
                            border: `1px solid ${globalGrid.enabled ? '#0088ff' : '#444'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: globalGrid.enabled ? 600 : 400,
                        }, children: globalGrid.enabled ? 'On' : 'Off' }), globalGrid.enabled && (_jsxs(_Fragment, { children: [_jsx("input", { type: "number", min: 4, max: 256, value: globalGrid.size, onChange: e => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 4)
                                    dispatch({ type: 'SET_GLOBAL_GRID', payload: { size: v } }); }, title: "Grid size (px)", style: { width: '48px', padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', fontSize: '12px' } }), _jsx("span", { style: { fontSize: '11px', color: '#555' }, children: "px" }), _jsx("input", { type: "color", value: globalGrid.color ?? '#ffffff', onChange: e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { color: e.target.value } }), title: "Grid color", style: { width: '24px', height: '24px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '3px', background: 'none' } }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: globalGrid.opacity ?? 0.15, onChange: e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { opacity: parseFloat(e.target.value) } }), title: "Grid opacity", style: { width: '70px' } }), _jsxs("span", { style: { fontSize: '11px', color: '#777', minWidth: '26px' }, children: [Math.round((globalGrid.opacity ?? 0.15) * 100), "%"] })] })), _jsx("div", { style: { flex: 1 } }), _jsx("button", { onClick: onExportPng, style: { padding: '5px 12px', background: '#1a3a1a', color: '#8fbc8f', border: '1px solid #3a6a3a', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }, children: "Save PNG" }), _jsx("button", { onClick: () => dispatch({ type: 'CLEAR_ALL' }), style: { padding: '5px 12px', background: '#5a2020', color: '#fff', border: '1px solid #8a3030', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }, children: "Clear All" })] }), _jsxs("div", { style: subRowBase, children: [activeTool === 'cave' && (_jsxs(_Fragment, { children: [_jsx("span", { style: labelStyle, children: "Mode" }), CAVE_MODES.map(({ mode, label, icon }) => (_jsx(ModeBtn, { label: label, icon: icon, active: caveDrawMode === mode, onClick: () => setCaveDrawMode(mode) }, mode)))] })), activeTool === 'room' && (_jsxs(_Fragment, { children: [_jsx("span", { style: labelStyle, children: "Shape" }), SHAPE_MODES.map(({ mode, label, icon }) => (_jsx(ModeBtn, { label: label, icon: icon, active: roomDrawMode === mode, onClick: () => setRoomDrawMode(mode) }, mode)))] })), activeTool === 'terrain' && (_jsxs(_Fragment, { children: [_jsx("span", { style: labelStyle, children: "Shape" }), SHAPE_MODES.map(({ mode, label, icon }) => (_jsx(ModeBtn, { label: label, icon: icon, active: terrainDrawMode === mode, onClick: () => setTerrainDrawMode(mode) }, mode))), divider, _jsx("span", { style: labelStyle, children: "Type" }), Object.entries(TERRAIN_PALETTE).map(([key, def]) => (_jsxs("button", { title: def.label, onClick: () => setActiveTerrainType(key), style: {
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '3px 9px',
                                    background: activeTerrainType === key ? def.fill : '#2a2a2a',
                                    color: '#fff',
                                    border: `1px solid ${activeTerrainType === key ? '#00aaff' : '#3a3a3a'}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: activeTerrainType === key ? 600 : 400,
                                }, children: [_jsx("span", { children: def.icon }), _jsx("span", { children: def.label })] }, key)))] }))] })] }));
}
