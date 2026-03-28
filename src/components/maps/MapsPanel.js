import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
export function MapsPanel({ maps, currentMapId, onLoad, onDelete, onClose }) {
    return (_jsxs("div", { style: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '280px',
            background: '#1e1e1e',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #333' }, children: [_jsx("span", { style: { fontWeight: 600, fontSize: '13px', flex: 1 }, children: "Saved Maps" }), _jsx("button", { onClick: onClose, style: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }, title: "Close", children: "\u2715" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: '8px' }, children: maps.length === 0 ? (_jsxs("div", { style: { color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '32px' }, children: ["No saved maps yet.", _jsx("br", {}), "Use \"Save Map\" to save the current map."] })) : (maps.map(entry => (_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        marginBottom: '4px',
                        background: entry.id === currentMapId ? '#0a2a4a' : '#252525',
                        border: `1px solid ${entry.id === currentMapId ? '#0066cc' : '#333'}`,
                        borderRadius: '6px',
                    }, children: [_jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontSize: '13px', fontWeight: 500, color: '#eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: entry.name }), _jsx("div", { style: { fontSize: '10px', color: '#555', marginTop: '2px' }, children: formatDate(entry.savedAt) }), _jsxs("div", { style: { fontSize: '10px', color: '#444', marginTop: '1px' }, children: [entry.state.rooms.length, "R \u00B7 ", entry.state.caves.length, "C \u00B7 ", entry.state.terrain.length, "T \u00B7 ", entry.state.items.length, "I"] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }, children: [_jsx("button", { onClick: () => onLoad(entry), title: "Load this map", style: {
                                        padding: '3px 8px',
                                        background: entry.id === currentMapId ? '#0055aa' : '#2a3a2a',
                                        color: '#aef',
                                        border: '1px solid #336',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                    }, children: "Load" }), _jsx("button", { onClick: () => onDelete(entry.id), title: "Delete this map", style: {
                                        padding: '3px 8px',
                                        background: '#2a1515',
                                        color: '#c66',
                                        border: '1px solid #522',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                    }, children: "Delete" })] })] }, entry.id)))) })] }));
}
