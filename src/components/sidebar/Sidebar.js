import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PropertiesPanel } from './PropertiesPanel';
export function Sidebar({ selected }) {
    return (_jsxs("div", { style: {
            width: '220px',
            minWidth: '220px',
            background: '#252525',
            borderLeft: '1px solid #333',
            padding: '16px 12px',
            overflowY: 'auto',
        }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }, children: "Properties" }), selected ? (_jsx(PropertiesPanel, { selected: selected })) : (_jsxs("div", { style: { fontSize: '12px', color: '#555', lineHeight: 1.6 }, children: [_jsx("p", { children: "Select an element on the canvas to edit its properties." }), _jsx("hr", { style: { border: 'none', borderTop: '1px solid #333', margin: '12px 0' } }), _jsx("p", { children: _jsx("strong", { style: { color: '#777' }, children: "Tools" }) }), _jsx("p", { children: "\u2196 Select \u2014 move elements" }), _jsx("p", { children: "\u2B1C Room \u2014 draw dungeon rooms" }), _jsx("p", { children: "\uD83E\uDEA8 Cave \u2014 draw cave shapes" }), _jsx("p", { children: "\uD83C\uDF3F Terrain \u2014 draw terrain (pick type in toolbar)" }), _jsx("p", { children: "\uD83D\uDCCC Item \u2014 place map items" }), _jsx("p", { children: "\u2715 Erase \u2014 click to remove" })] }))] }));
}
