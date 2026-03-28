import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Rect, Ellipse, Line, Text } from 'react-konva';
import { TERRAIN_PALETTE } from '@/types/map';
import { useMapDispatch } from '@/store/mapStore';
import { useMapTool } from '@/hooks/useMapTool';
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid';
export function TerrainLayer({ terrain, onSelect, selectedId }) {
    const dispatch = useMapDispatch();
    const { activeTool } = useMapTool();
    const draggable = activeTool === 'select';
    const selected = (id) => selectedId === id;
    return (_jsx(Layer, { children: terrain.map(t => {
            const def = TERRAIN_PALETTE[t.terrainType];
            const stroke = selected(t.id) ? '#00aaff' : def.stroke;
            const strokeWidth = selected(t.id) ? 2 : 1;
            const sharedHandlers = {
                onClick: () => onSelect(t.id),
                draggable,
            };
            if (t.shape === 'rect') {
                return (_jsxs(_Fragment, { children: [_jsx(Rect, { id: t.id, x: t.x, y: t.y, width: t.width, height: t.height, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, ...sharedHandlers, onDragEnd: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } }) }, t.id), t.grid && _jsx(RectGrid, { grid: t.grid, x: t.x, y: t.y, width: t.width, height: t.height }, `${t.id}-grid`), _jsx(Text, { x: t.x + t.width / 2, y: t.y + t.height / 2 - (t.label ? 12 : 8), text: def.icon, fontSize: 14, align: "center", offsetX: 7, listening: false }, `${t.id}-i`), t.label && _jsx(Text, { x: t.x, y: t.y + t.height / 2 + 6, width: t.width, text: t.label, fontSize: 11, fill: "#ddd", align: "center", listening: false }, `${t.id}-l`)] }));
            }
            if (t.shape === 'ellipse') {
                return (_jsxs(_Fragment, { children: [_jsx(Ellipse, { id: t.id, x: t.x, y: t.y, radiusX: t.radiusX, radiusY: t.radiusY, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, ...sharedHandlers, onDragEnd: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } }) }, t.id), t.grid && _jsx(EllipseGrid, { grid: t.grid, cx: t.x, cy: t.y, radiusX: t.radiusX, radiusY: t.radiusY }, `${t.id}-grid`), _jsx(Text, { x: t.x, y: t.y - (t.label ? 12 : 8), text: def.icon, fontSize: 14, align: "center", offsetX: 7, listening: false }, `${t.id}-i`), t.label && _jsx(Text, { x: t.x - t.radiusX, y: t.y + 6, width: t.radiusX * 2, text: t.label, fontSize: 11, fill: "#ddd", align: "center", listening: false }, `${t.id}-l`)] }));
            }
            if (t.shape === 'custom') {
                const xs = t.points.filter((_, i) => i % 2 === 0);
                const ys = t.points.filter((_, i) => i % 2 !== 0);
                const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
                const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
                const spanX = Math.max(...xs) - Math.min(...xs);
                return (_jsxs(_Fragment, { children: [_jsx(Line, { id: t.id, points: t.points, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, closed: true, ...sharedHandlers, onDragEnd: e => {
                                dispatch({ type: 'UPDATE_TERRAIN', payload: {
                                        id: t.id,
                                        points: t.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()),
                                    } });
                                e.target.position({ x: 0, y: 0 });
                            } }, t.id), t.grid && _jsx(PolyGrid, { grid: t.grid, points: t.points }, `${t.id}-grid`), _jsx(Text, { x: cx, y: cy - (t.label ? 12 : 8), text: def.icon, fontSize: 14, align: "center", offsetX: 7, listening: false }, `${t.id}-i`), t.label && _jsx(Text, { x: cx - spanX / 2, y: cy + 6, width: spanX, text: t.label, fontSize: 11, fill: "#ddd", align: "center", listening: false }, `${t.id}-l`)] }));
            }
            return null;
        }) }));
}
