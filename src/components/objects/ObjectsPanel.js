import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMapState, useMapDispatch } from '@/store/mapStore';
import { TERRAIN_PALETTE } from '@/types/map';
const ITEM_SYMBOLS = {
    door: '🚪', chest: '📦', trap: '⚠', stairs: '🔼', torch: '🕯', monster: '👾', npc: '🧑', pillar: '⬛',
};
function getEntryInfo(id, state) {
    const room = state.rooms.find(r => r.id === id);
    if (room) {
        const label = room.label || (room.shape === 'ellipse' ? 'Ellipse Room' : room.shape === 'custom' ? 'Custom Room' : 'Room');
        const icon = room.shape === 'ellipse' ? '⭕' : room.shape === 'custom' ? '✏️' : '⬜';
        return { type: 'room', label, icon };
    }
    const cave = state.caves.find(c => c.id === id);
    if (cave)
        return { type: 'cave', label: cave.label || 'Cave', icon: '🪨' };
    const terrain = state.terrain.find(t => t.id === id);
    if (terrain) {
        const def = TERRAIN_PALETTE[terrain.terrainType];
        return { type: 'terrain', label: terrain.label || def.label, icon: def.icon };
    }
    const item = state.items.find(i => i.id === id);
    if (item)
        return { type: 'item', label: item.label || ITEM_SYMBOLS[item.symbol] || item.symbol || 'Item', icon: ITEM_SYMBOLS[item.symbol] ?? item.symbol ?? '📌' };
    return null;
}
export function ObjectsPanel({ selected, onSelect, onClose }) {
    const state = useMapState();
    const dispatch = useMapDispatch();
    const { layerOrder } = state;
    // Display reversed: top of list = topmost layer (last in layerOrder)
    const reversed = [...layerOrder].reverse();
    function reorder(id, direction) {
        dispatch({ type: 'REORDER_ELEMENT', payload: { id, direction } });
    }
    return (_jsxs("div", { style: {
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: '220px',
            background: '#1e1e1e',
            borderRight: '1px solid #333',
            display: 'flex', flexDirection: 'column',
            zIndex: 100,
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #333', flexShrink: 0 }, children: [_jsx("span", { style: { fontWeight: 600, fontSize: '13px', flex: 1 }, children: "Objects" }), _jsx("button", { onClick: onClose, style: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }, title: "Close", children: "\u2715" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: '6px 4px' }, children: reversed.length === 0 ? (_jsx("div", { style: { fontSize: '11px', color: '#444', textAlign: 'center', marginTop: '32px' }, children: "No objects yet." })) : reversed.map((id, revIdx) => {
                    const info = getEntryInfo(id, state);
                    if (!info)
                        return null;
                    const isSelected = selected?.id === id;
                    const origIdx = layerOrder.length - 1 - revIdx;
                    const isTop = origIdx === layerOrder.length - 1;
                    const isBottom = origIdx === 0;
                    return (_jsxs("div", { style: {
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '4px 4px 4px 10px',
                            background: isSelected ? '#0a2a4a' : 'transparent',
                            borderLeft: isSelected ? '2px solid #0066cc' : '2px solid transparent',
                            borderRadius: '3px',
                            marginBottom: '1px',
                        }, children: [_jsx("span", { style: { fontSize: '13px', flexShrink: 0, width: '20px', textAlign: 'center' }, children: info.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { onClick: () => onSelect({ type: info.type, id }), title: info.label, style: {
                                            fontSize: '12px', color: isSelected ? '#aef' : '#ccc',
                                            cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }, children: info.label }), _jsx("div", { style: { fontSize: '10px', color: '#555', marginTop: '1px' }, children: info.type })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }, children: [_jsx("button", { title: "Move up (render on top)", onClick: () => reorder(id, 'up'), disabled: isTop, style: {
                                            background: 'none', border: 'none',
                                            color: isTop ? '#2a2a2a' : '#666',
                                            cursor: isTop ? 'default' : 'pointer',
                                            fontSize: '9px', padding: '0 3px', lineHeight: 1,
                                        }, children: "\u25B2" }), _jsx("button", { title: "Move down (render below)", onClick: () => reorder(id, 'down'), disabled: isBottom, style: {
                                            background: 'none', border: 'none',
                                            color: isBottom ? '#2a2a2a' : '#666',
                                            cursor: isBottom ? 'default' : 'pointer',
                                            fontSize: '9px', padding: '0 3px', lineHeight: 1,
                                        }, children: "\u25BC" })] })] }, id));
                }) }), _jsx("div", { style: { padding: '8px 10px', borderTop: '1px solid #2a2a2a', fontSize: '10px', color: '#444' }, children: "top of list = drawn on top \u00B7 \u25B2\u25BC to reorder" })] }));
}
