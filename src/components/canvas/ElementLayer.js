import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Rect, Ellipse, Line, Text, Circle } from 'react-konva';
import { useMapDispatch } from '@/store/mapStore';
import { useMapTool } from '@/hooks/useMapTool';
import { TERRAIN_PALETTE } from '@/types/map';
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid';
const HANDLE_RADIUS = 6;
const HANDLE_FILL = '#fff';
const HANDLE_STROKE = '#0088ff';
// A single draggable handle dot
function Handle({ x, y, onDragEnd }) {
    return (_jsx(Circle, { x: x, y: y, radius: HANDLE_RADIUS, fill: HANDLE_FILL, stroke: HANDLE_STROKE, strokeWidth: 2, draggable: true, onDragEnd: e => {
            onDragEnd(e.target.x() - x, e.target.y() - y);
            e.target.position({ x, y });
        } }));
}
// Handles for rect shapes — 4 corners + 4 edge midpoints
function RectHandles({ x, y, width, height, onUpdate }) {
    const r = HANDLE_RADIUS;
    const handles = [
        // top-left
        { hx: x, hy: y, onDragEnd: (dx, dy) => onUpdate({ x: x + dx, y: y + dy, width: width - dx, height: height - dy }) },
        // top-right
        { hx: x + width, hy: y, onDragEnd: (dx, dy) => onUpdate({ y: y + dy, width: width + dx, height: height - dy }) },
        // bottom-right
        { hx: x + width, hy: y + height, onDragEnd: (dx, dy) => onUpdate({ width: width + dx, height: height + dy }) },
        // bottom-left
        { hx: x, hy: y + height, onDragEnd: (dx, dy) => onUpdate({ x: x + dx, width: width - dx, height: height + dy }) },
        // top-mid
        { hx: x + width / 2, hy: y, onDragEnd: (_dx, dy) => onUpdate({ y: y + dy, height: height - dy }) },
        // right-mid
        { hx: x + width, hy: y + height / 2, onDragEnd: (dx, _dy) => onUpdate({ width: width + dx }) },
        // bottom-mid
        { hx: x + width / 2, hy: y + height, onDragEnd: (_dx, dy) => onUpdate({ height: height + dy }) },
        // left-mid
        { hx: x, hy: y + height / 2, onDragEnd: (dx, _dy) => onUpdate({ x: x + dx, width: width - dx }) },
    ];
    return (_jsx(_Fragment, { children: handles.map((h, i) => (_jsx(Circle, { x: h.hx, y: h.hy, radius: r, fill: HANDLE_FILL, stroke: HANDLE_STROKE, strokeWidth: 2, draggable: true, onDragEnd: e => {
                h.onDragEnd(e.target.x() - h.hx, e.target.y() - h.hy);
                e.target.position({ x: h.hx, y: h.hy });
            } }, i))) }));
}
// Handles for ellipse shapes — top, right, bottom, left
function EllipseHandles({ cx, cy, radiusX, radiusY, onUpdate }) {
    const handles = [
        { hx: cx, hy: cy - radiusY, onDragEnd: (_dx, dy) => onUpdate({ radiusY: Math.max(4, radiusY - dy) }) },
        { hx: cx + radiusX, hy: cy, onDragEnd: (dx, _dy) => onUpdate({ radiusX: Math.max(4, radiusX + dx) }) },
        { hx: cx, hy: cy + radiusY, onDragEnd: (_dx, dy) => onUpdate({ radiusY: Math.max(4, radiusY + dy) }) },
        { hx: cx - radiusX, hy: cy, onDragEnd: (dx, _dy) => onUpdate({ radiusX: Math.max(4, radiusX - dx) }) },
    ];
    return (_jsx(_Fragment, { children: handles.map((h, i) => (_jsx(Circle, { x: h.hx, y: h.hy, radius: HANDLE_RADIUS, fill: HANDLE_FILL, stroke: HANDLE_STROKE, strokeWidth: 2, draggable: true, onDragEnd: e => {
                h.onDragEnd(e.target.x() - h.hx, e.target.y() - h.hy);
                e.target.position({ x: h.hx, y: h.hy });
            } }, i))) }));
}
// Handles for polygon/custom shapes — one handle per vertex
function PolyHandles({ points, onUpdate }) {
    return (_jsx(_Fragment, { children: Array.from({ length: points.length / 2 }, (_, i) => {
            const hx = points[i * 2];
            const hy = points[i * 2 + 1];
            return (_jsx(Circle, { x: hx, y: hy, radius: HANDLE_RADIUS, fill: HANDLE_FILL, stroke: HANDLE_STROKE, strokeWidth: 2, draggable: true, onDragEnd: e => {
                    const newPoints = [...points];
                    newPoints[i * 2] = e.target.x();
                    newPoints[i * 2 + 1] = e.target.y();
                    onUpdate(newPoints);
                    e.target.position({ x: hx, y: hy });
                } }, i));
        }) }));
}
export function ElementLayer({ element, type, isSelected, onSelect }) {
    const dispatch = useMapDispatch();
    const { activeTool } = useMapTool();
    const draggable = activeTool === 'select';
    const editMode = activeTool === 'edit';
    return (_jsxs(Layer, { children: [type === 'terrain' && _jsx(TerrainElement, { t: element, isSelected: isSelected, onSelect: onSelect, draggable: draggable, editMode: editMode, dispatch: dispatch }), type === 'room' && _jsx(RoomElement, { r: element, isSelected: isSelected, onSelect: onSelect, draggable: draggable, editMode: editMode, dispatch: dispatch }), type === 'cave' && _jsx(CaveElement, { c: element, isSelected: isSelected, onSelect: onSelect, draggable: draggable, editMode: editMode, dispatch: dispatch }), type === 'item' && _jsx(ItemElement, { i: element, isSelected: isSelected, onSelect: onSelect, draggable: draggable, dispatch: dispatch })] }));
}
// ── Terrain ───────────────────────────────────────────────────────
function TerrainElement({ t, isSelected, onSelect, draggable, editMode, dispatch }) {
    const def = TERRAIN_PALETTE[t.terrainType];
    const stroke = isSelected ? '#00aaff' : def.stroke;
    const strokeWidth = isSelected ? 2 : 1;
    const shared = { onClick: onSelect, draggable };
    const showHandles = editMode && isSelected;
    if (t.shape === 'rect') {
        return (_jsxs(_Fragment, { children: [_jsx(Rect, { id: t.id, x: t.x, y: t.y, width: t.width, height: t.height, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, ...shared, onDragEnd: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } }) }), t.grid && _jsx(RectGrid, { grid: t.grid, x: t.x, y: t.y, width: t.width, height: t.height }), _jsx(Text, { x: t.x + t.width / 2, y: t.y + t.height / 2 - (t.label ? 12 : 8), text: def.icon, fontSize: 14, align: "center", offsetX: 7, listening: false }), t.label && _jsx(Text, { x: t.x, y: t.y + t.height / 2 + 6, width: t.width, text: t.label, fontSize: 11, fill: "#ddd", align: "center", listening: false }), showHandles && _jsx(RectHandles, { x: t.x, y: t.y, width: t.width, height: t.height, onUpdate: patch => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, ...patch } }) })] }));
    }
    if (t.shape === 'ellipse') {
        return (_jsxs(_Fragment, { children: [_jsx(Ellipse, { id: t.id, x: t.x, y: t.y, radiusX: t.radiusX, radiusY: t.radiusY, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, ...shared, onDragEnd: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } }) }), t.grid && _jsx(EllipseGrid, { grid: t.grid, cx: t.x, cy: t.y, radiusX: t.radiusX, radiusY: t.radiusY }), _jsx(Text, { x: t.x, y: t.y - (t.label ? 12 : 8), text: def.icon, fontSize: 14, align: "center", offsetX: 7, listening: false }), t.label && _jsx(Text, { x: t.x - t.radiusX, y: t.y + 6, width: t.radiusX * 2, text: t.label, fontSize: 11, fill: "#ddd", align: "center", listening: false }), showHandles && _jsx(EllipseHandles, { cx: t.x, cy: t.y, radiusX: t.radiusX, radiusY: t.radiusY, onUpdate: patch => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, ...patch } }) })] }));
    }
    // custom
    const xs = t.points.filter((_, i) => i % 2 === 0);
    const ys = t.points.filter((_, i) => i % 2 !== 0);
    const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
    const spanX = Math.max(...xs) - Math.min(...xs);
    return (_jsxs(_Fragment, { children: [_jsx(Line, { id: t.id, points: t.points, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, closed: true, ...shared, onDragEnd: e => {
                    dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, points: t.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } });
                    e.target.position({ x: 0, y: 0 });
                } }), t.grid && _jsx(PolyGrid, { grid: t.grid, points: t.points }), _jsx(Text, { x: cx, y: cy - (t.label ? 12 : 8), text: def.icon, fontSize: 14, align: "center", offsetX: 7, listening: false }), t.label && _jsx(Text, { x: cx - spanX / 2, y: cy + 6, width: spanX, text: t.label, fontSize: 11, fill: "#ddd", align: "center", listening: false }), showHandles && _jsx(PolyHandles, { points: t.points, onUpdate: pts => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, points: pts } }) })] }));
}
// ── Room ─────────────────────────────────────────────────────────
function RoomElement({ r, isSelected, onSelect, draggable, editMode, dispatch }) {
    const stroke = isSelected ? '#00aaff' : '#ccc';
    const strokeWidth = isSelected ? 3 : 2;
    const shared = { draggable, onClick: onSelect };
    const showHandles = editMode && isSelected;
    if (r.shape === 'ellipse') {
        return (_jsxs(_Fragment, { children: [_jsx(Ellipse, { id: r.id, x: r.x, y: r.y, radiusX: r.radiusX, radiusY: r.radiusY, fill: r.fill, stroke: stroke, strokeWidth: strokeWidth, ...shared, onDragEnd: e => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } }) }), r.grid && _jsx(EllipseGrid, { grid: r.grid, cx: r.x, cy: r.y, radiusX: r.radiusX, radiusY: r.radiusY }), r.label && _jsx(Text, { x: r.x - r.radiusX, y: r.y - r.radiusY + 4, text: r.label, fontSize: 13, fill: "#fff", listening: false }), showHandles && _jsx(EllipseHandles, { cx: r.x, cy: r.y, radiusX: r.radiusX, radiusY: r.radiusY, onUpdate: patch => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, ...patch } }) })] }));
    }
    if (r.shape === 'custom') {
        const xs = r.points.filter((_, i) => i % 2 === 0);
        const ys = r.points.filter((_, i) => i % 2 !== 0);
        return (_jsxs(_Fragment, { children: [_jsx(Line, { id: r.id, points: r.points, fill: r.fill, stroke: stroke, strokeWidth: strokeWidth, closed: true, ...shared, onDragEnd: e => {
                        dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, points: r.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } });
                        e.target.position({ x: 0, y: 0 });
                    } }), r.grid && _jsx(PolyGrid, { grid: r.grid, points: r.points }), r.label && _jsx(Text, { x: Math.min(...xs), y: Math.min(...ys), text: r.label, fontSize: 13, fill: "#fff", listening: false }), showHandles && _jsx(PolyHandles, { points: r.points, onUpdate: pts => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, points: pts } }) })] }));
    }
    // rect
    return (_jsxs(_Fragment, { children: [_jsx(Rect, { id: r.id, x: r.x, y: r.y, width: r.width, height: r.height, fill: r.fill, stroke: stroke, strokeWidth: strokeWidth, ...shared, onDragEnd: e => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } }) }), r.grid && _jsx(RectGrid, { grid: r.grid, x: r.x, y: r.y, width: r.width, height: r.height }), r.label && (_jsx(Text, { x: r.x + r.width / 2, y: r.y + r.height / 2, text: r.label, fontSize: 13, fill: "#fff", offsetX: r.label.length * 3.5, offsetY: 7, listening: false })), showHandles && _jsx(RectHandles, { x: r.x, y: r.y, width: r.width, height: r.height, onUpdate: patch => dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, ...patch } }) })] }));
}
// ── Cave ─────────────────────────────────────────────────────────
function CaveElement({ c, isSelected, onSelect, draggable, editMode, dispatch }) {
    const cxs = c.points.filter((_, i) => i % 2 === 0);
    const cys = c.points.filter((_, i) => i % 2 !== 0);
    const ccx = cxs.reduce((a, b) => a + b, 0) / cxs.length;
    const ccy = cys.reduce((a, b) => a + b, 0) / cys.length;
    const spanX = Math.max(...cxs) - Math.min(...cxs);
    const showHandles = editMode && isSelected;
    return (_jsxs(_Fragment, { children: [_jsx(Line, { id: c.id, points: c.points, fill: c.fill, stroke: isSelected ? '#00aaff' : '#aaa', strokeWidth: isSelected ? 3 : 2, closed: true, draggable: draggable, onClick: onSelect, onDragEnd: e => {
                    dispatch({ type: 'UPDATE_CAVE', payload: { id: c.id, points: c.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) } });
                    e.target.position({ x: 0, y: 0 });
                } }), c.grid && _jsx(PolyGrid, { grid: c.grid, points: c.points }), c.label && _jsx(Text, { x: ccx - spanX / 2, y: ccy - 7, width: spanX, text: c.label, fontSize: 13, fill: "#fff", align: "center", listening: false }), showHandles && _jsx(PolyHandles, { points: c.points, onUpdate: pts => dispatch({ type: 'UPDATE_CAVE', payload: { id: c.id, points: pts } }) })] }));
}
// ── Item ─────────────────────────────────────────────────────────
function ItemElement({ i, isSelected, onSelect, draggable, dispatch }) {
    return (_jsx(Text, { id: i.id, x: i.x, y: i.y, text: i.symbol, fontSize: 24, fill: isSelected ? '#00aaff' : '#fff', draggable: draggable, onClick: onSelect, onDragEnd: e => dispatch({ type: 'UPDATE_ITEM', payload: { id: i.id, x: e.target.x(), y: e.target.y() } }) }));
}
