import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMapTool } from '@/hooks/useMapTool';
import { useMapState, useMapDispatch } from '@/store/mapStore';
import { TERRAIN_PALETTE } from '@/types/map';
import { ToolButton } from './ToolButton';
const DRAW_MODES = [
    { mode: 'rect', label: 'Square', icon: '⬜' },
    { mode: 'ellipse', label: 'Circle', icon: '⭕' },
    { mode: 'custom', label: 'Custom', icon: '✏️' },
];
const TOOLS = [
    { tool: 'select', label: 'Select', icon: '↖' },
    { tool: 'room', label: 'Room', icon: '⬜' },
    { tool: 'cave', label: 'Cave', icon: '🪨' },
    { tool: 'terrain', label: 'Terrain', icon: '🌿' },
    { tool: 'item', label: 'Item', icon: '📌' },
    { tool: 'erase', label: 'Erase', icon: '✕' },
];
export function Toolbar({ onExportPng }) {
    const { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode } = useMapTool();
    const dispatch = useMapDispatch();
    const { globalGrid } = useMapState();
    return (_jsxs("div", { style: { background: '#252525', borderBottom: '1px solid #333' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px' }, children: [TOOLS.map(({ tool, label, icon }) => (_jsx(ToolButton, { icon: icon, label: label, active: activeTool === tool, onClick: () => setActiveTool(tool) }, tool))), _jsx("div", { style: { flex: 1 } }), _jsx("button", { onClick: onExportPng, style: {
                            padding: '6px 14px',
                            background: '#1a3a1a',
                            color: '#8fbc8f',
                            border: '1px solid #3a6a3a',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }, children: "Save PNG" }), _jsx("button", { onClick: () => dispatch({ type: 'CLEAR_ALL' }), style: {
                            padding: '6px 14px',
                            background: '#5a2020',
                            color: '#fff',
                            border: '1px solid #8a3030',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }, children: "Clear All" })] }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px 8px',
                    borderTop: '1px solid #333',
                }, children: [_jsx("span", { style: { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }, children: "Grid:" }), _jsxs("button", { title: globalGrid.enabled ? 'Disable global grid' : 'Enable global grid', onClick: () => dispatch({ type: 'SET_GLOBAL_GRID', payload: { enabled: !globalGrid.enabled } }), style: {
                            padding: '4px 10px',
                            background: globalGrid.enabled ? '#0066cc' : '#2a2a2a',
                            color: '#fff',
                            border: `1px solid ${globalGrid.enabled ? '#0088ff' : '#444'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: globalGrid.enabled ? 600 : 400,
                        }, children: ["# ", globalGrid.enabled ? 'On' : 'Off'] }), globalGrid.enabled && (_jsxs(_Fragment, { children: [_jsx("input", { type: "number", min: 4, max: 256, value: globalGrid.size, onChange: e => {
                                    const v = parseInt(e.target.value, 10);
                                    if (!isNaN(v) && v >= 4)
                                        dispatch({ type: 'SET_GLOBAL_GRID', payload: { size: v } });
                                }, title: "Grid cell size in pixels", style: {
                                    width: '54px',
                                    padding: '4px 6px',
                                    background: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                } }), _jsx("span", { style: { fontSize: '11px', color: '#666' }, children: "px" }), _jsx("div", { style: { width: '1px', height: '20px', background: '#444', margin: '0 4px' } }), _jsx("input", { type: "color", value: globalGrid.color ?? '#ffffff', onChange: e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { color: e.target.value } }), title: "Grid color", style: { width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'none' } }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: globalGrid.opacity ?? 0.15, onChange: e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { opacity: parseFloat(e.target.value) } }), title: "Grid opacity", style: { width: '80px' } }), _jsxs("span", { style: { fontSize: '11px', color: '#888', minWidth: '28px' }, children: [Math.round((globalGrid.opacity ?? 0.15) * 100), "%"] })] }))] }), activeTool === 'terrain' && (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px 8px',
                    borderTop: '1px solid #333',
                    flexWrap: 'wrap',
                }, children: [_jsx("span", { style: { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }, children: "Shape:" }), DRAW_MODES.map(({ mode, label, icon }) => (_jsxs("button", { title: label, onClick: () => setTerrainDrawMode(mode), style: {
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px',
                            background: terrainDrawMode === mode ? '#0066cc' : '#2a2a2a',
                            color: '#fff',
                            border: `1px solid ${terrainDrawMode === mode ? '#0088ff' : '#444'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: terrainDrawMode === mode ? 600 : 400,
                        }, children: [_jsx("span", { children: icon }), _jsx("span", { children: label })] }, mode))), _jsx("div", { style: { width: '1px', height: '20px', background: '#444', margin: '0 4px' } }), _jsx("span", { style: { fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }, children: "Type:" }), Object.entries(TERRAIN_PALETTE).map(([key, def]) => (_jsxs("button", { title: def.label, onClick: () => setActiveTerrainType(key), style: {
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px',
                            background: activeTerrainType === key ? def.fill : '#2a2a2a',
                            color: '#fff',
                            border: `1px solid ${activeTerrainType === key ? '#00aaff' : '#444'}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: activeTerrainType === key ? 600 : 400,
                        }, children: [_jsx("span", { children: def.icon }), _jsx("span", { children: def.label })] }, key)))] }))] }));
}
