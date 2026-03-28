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
                return (_jsxs(_Fragment, { children: [_jsx(Rect, { id: t.id, x: t.x, y: t.y, width: t.width, height: t.height, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, ...sharedHandlers, onDragEnd: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } }) }, t.id), t.grid && _jsx(RectGrid, { grid: t.grid, x: t.x, y: t.y, width: t.width, height: t.height }, `${t.id}-grid`), _jsx(Text, { x: t.x + 4, y: t.y + 4, text: def.icon, fontSize: 14, listening: false }, `${t.id}-i`), t.label && _jsx(Text, { x: t.x + 4, y: t.y + 22, text: t.label, fontSize: 11, fill: "#ddd", listening: false }, `${t.id}-l`)] }));
            }
            if (t.shape === 'ellipse') {
                return (_jsxs(_Fragment, { children: [_jsx(Ellipse, { id: t.id, x: t.x, y: t.y, radiusX: t.radiusX, radiusY: t.radiusY, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, ...sharedHandlers, onDragEnd: e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: t.id, x: e.target.x(), y: e.target.y() } }) }, t.id), t.grid && _jsx(EllipseGrid, { grid: t.grid, cx: t.x, cy: t.y, radiusX: t.radiusX, radiusY: t.radiusY }, `${t.id}-grid`), _jsx(Text, { x: t.x - 8, y: t.y - 10, text: def.icon, fontSize: 14, listening: false }, `${t.id}-i`), t.label && _jsx(Text, { x: t.x - t.radiusX, y: t.y - t.radiusY + 4, text: t.label, fontSize: 11, fill: "#ddd", listening: false }, `${t.id}-l`)] }));
            }
            if (t.shape === 'custom') {
                // Bounding box top-left for icon/label placement
                const xs = t.points.filter((_, i) => i % 2 === 0);
                const ys = t.points.filter((_, i) => i % 2 !== 0);
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                return (_jsxs(_Fragment, { children: [_jsx(Line, { id: t.id, points: t.points, fill: def.fill, stroke: stroke, strokeWidth: strokeWidth, closed: true, ...sharedHandlers, onDragEnd: e => {
                                dispatch({ type: 'UPDATE_TERRAIN', payload: {
                                        id: t.id,
                                        points: t.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()),
                                    } });
                                e.target.position({ x: 0, y: 0 });
                            } }, t.id), t.grid && _jsx(PolyGrid, { grid: t.grid, points: t.points }, `${t.id}-grid`), _jsx(Text, { x: minX + 4, y: minY + 4, text: def.icon, fontSize: 14, listening: false }, `${t.id}-i`), t.label && _jsx(Text, { x: minX + 4, y: minY + 22, text: t.label, fontSize: 11, fill: "#ddd", listening: false }, `${t.id}-l`)] }));
            }
            return null;
        }) }));
}
