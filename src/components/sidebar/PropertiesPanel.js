import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMapState, useMapDispatch } from '@/store/mapStore';
import { TERRAIN_PALETTE } from '@/types/map';
const ROOM_COLORS = [
    { label: 'Dark', value: '#3a3a3a' },
    { label: 'Stone', value: '#555' },
    { label: 'Wood', value: '#5c4033' },
    { label: 'Magic', value: '#2d1a4a' },
];
const ITEM_SYMBOLS = [
    { label: 'Door', value: '🚪' },
    { label: 'Chest', value: '📦' },
    { label: 'Trap', value: '⚠' },
    { label: 'Stairs', value: '🔼' },
    { label: 'Torch', value: '🕯' },
    { label: 'Monster', value: '👾' },
    { label: 'NPC', value: '🧙' },
    { label: 'Pillar', value: '🏛' },
];
const DEFAULT_GRID = { enabled: true, size: 32, color: '#ffffff', opacity: 0.2 };
function GridSection({ grid, onChange, labelStyle, inputStyle }) {
    const enabled = grid?.enabled ?? false;
    return (_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Grid" }), _jsx("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: enabled ? '8px' : 0 }, children: _jsx("button", { onClick: () => onChange(enabled ? { ...(grid ?? DEFAULT_GRID), enabled: false } : { ...(grid ?? DEFAULT_GRID), enabled: true }), style: {
                        padding: '4px 12px',
                        background: enabled ? '#0066cc' : '#2a2a2a',
                        color: '#fff',
                        border: `1px solid ${enabled ? '#0088ff' : '#555'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                    }, children: enabled ? 'Enabled' : 'Disabled' }) }), enabled && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: { ...labelStyle, marginBottom: 0, width: '60px' }, children: "Size" }), _jsx("input", { type: "number", min: 4, max: 256, value: grid?.size ?? 32, onChange: e => {
                                    const v = parseInt(e.target.value, 10);
                                    if (!isNaN(v) && v >= 4)
                                        onChange({ ...(grid ?? DEFAULT_GRID), size: v });
                                }, style: { ...inputStyle, width: '70px' } }), _jsx("span", { style: { fontSize: '11px', color: '#666' }, children: "px" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: { ...labelStyle, marginBottom: 0, width: '60px' }, children: "Color" }), _jsx("input", { type: "color", value: grid?.color ?? '#ffffff', onChange: e => onChange({ ...(grid ?? DEFAULT_GRID), color: e.target.value }), style: { width: '36px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'none' } })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("label", { style: { ...labelStyle, marginBottom: 0, width: '60px' }, children: "Opacity" }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: grid?.opacity ?? 0.2, onChange: e => onChange({ ...(grid ?? DEFAULT_GRID), opacity: parseFloat(e.target.value) }), style: { flex: 1 } }), _jsxs("span", { style: { fontSize: '11px', color: '#888', width: '28px', textAlign: 'right' }, children: [Math.round((grid?.opacity ?? 0.2) * 100), "%"] })] })] }))] }));
}
export function PropertiesPanel({ selected }) {
    const state = useMapState();
    const dispatch = useMapDispatch();
    const inputStyle = {
        width: '100%',
        padding: '5px 8px',
        background: '#333',
        color: '#fff',
        border: '1px solid #555',
        borderRadius: '4px',
        fontSize: '13px',
        boxSizing: 'border-box',
    };
    const labelStyle = {
        display: 'block',
        marginBottom: '4px',
        fontSize: '11px',
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };
    if (selected.type === 'room') {
        const room = state.rooms.find(r => r.id === selected.id);
        if (!room)
            return null;
        return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Label" }), _jsx("input", { style: inputStyle, value: room.label ?? '', placeholder: "Room name...", onChange: e => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, label: e.target.value } }) })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Fill Color" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }, children: [ROOM_COLORS.map(c => (_jsx("button", { title: c.label, onClick: () => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, fill: c.value } }), style: {
                                        width: '28px', height: '28px',
                                        background: c.value,
                                        border: room.fill === c.value ? '2px solid #00aaff' : '2px solid #555',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    } }, c.value))), _jsx("input", { type: "color", value: room.fill, onChange: e => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, fill: e.target.value } }), style: { width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px' } })] })] }), _jsx(GridSection, { grid: room.grid, onChange: g => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, grid: g } }), labelStyle: labelStyle, inputStyle: inputStyle })] }));
    }
    if (selected.type === 'cave') {
        const cave = state.caves.find(c => c.id === selected.id);
        if (!cave)
            return null;
        return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Label" }), _jsx("input", { style: inputStyle, value: cave.label ?? '', placeholder: "Cave name...", onChange: e => dispatch({ type: 'UPDATE_CAVE', payload: { id: cave.id, label: e.target.value } }) })] }), _jsx(GridSection, { grid: cave.grid, onChange: g => dispatch({ type: 'UPDATE_CAVE', payload: { id: cave.id, grid: g } }), labelStyle: labelStyle, inputStyle: inputStyle })] }));
    }
    if (selected.type === 'terrain') {
        const terrain = state.terrain.find(t => t.id === selected.id);
        if (!terrain)
            return null;
        return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Terrain Type" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: Object.entries(TERRAIN_PALETTE).map(([key, def]) => (_jsxs("button", { onClick: () => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, terrainType: key } }), style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '5px 8px',
                                    background: terrain.terrainType === key ? def.fill : '#2a2a2a',
                                    color: '#fff',
                                    border: `1px solid ${terrain.terrainType === key ? '#00aaff' : '#444'}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    textAlign: 'left',
                                }, children: [_jsx("span", { children: def.icon }), _jsx("span", { children: def.label })] }, key))) })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Label" }), _jsx("input", { style: inputStyle, value: terrain.label ?? '', placeholder: "Terrain label...", onChange: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, label: e.target.value } }) })] }), _jsx(GridSection, { grid: terrain.grid, onChange: g => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, grid: g ?? undefined } }), labelStyle: labelStyle, inputStyle: inputStyle })] }));
    }
    if (selected.type === 'item') {
        const item = state.items.find(i => i.id === selected.id);
        if (!item)
            return null;
        return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Symbol" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }, children: ITEM_SYMBOLS.map(s => (_jsx("button", { title: s.label, onClick: () => dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, symbol: s.value } }), style: {
                                    width: '36px', height: '36px',
                                    background: item.symbol === s.value ? '#0066cc' : '#333',
                                    border: item.symbol === s.value ? '2px solid #00aaff' : '2px solid #555',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                }, children: s.value }, s.value))) })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Label" }), _jsx("input", { style: inputStyle, value: item.label ?? '', placeholder: "Item label...", onChange: e => dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, label: e.target.value } }) })] })] }));
    }
    return null;
}
