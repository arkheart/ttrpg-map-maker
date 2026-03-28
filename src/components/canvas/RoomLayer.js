import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Rect, Ellipse, Line, Text } from 'react-konva';
import { useMapDispatch } from '@/store/mapStore';
import { useMapTool } from '@/hooks/useMapTool';
import { RectGrid, EllipseGrid, PolyGrid } from './ElementGrid';
export function RoomLayer({ rooms, caves, onSelect, selectedId }) {
    const dispatch = useMapDispatch();
    const { activeTool } = useMapTool();
    const draggable = activeTool === 'select';
    return (_jsxs(Layer, { children: [rooms.map(r => {
                const isSelected = selectedId === r.id;
                const stroke = isSelected ? '#00aaff' : '#ccc';
                const strokeWidth = isSelected ? 3 : 2;
                const shared = { draggable, onClick: () => onSelect(r.id) };
                if (r.shape === 'ellipse') {
                    return (_jsxs(_Fragment, { children: [_jsx(Ellipse, { id: r.id, x: r.x, y: r.y, radiusX: r.radiusX, radiusY: r.radiusY, fill: r.fill, stroke: stroke, strokeWidth: strokeWidth, ...shared, onDragEnd: e => {
                                    dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } });
                                } }, r.id), r.grid && _jsx(EllipseGrid, { grid: r.grid, cx: r.x, cy: r.y, radiusX: r.radiusX, radiusY: r.radiusY }, `${r.id}-grid`), r.label && _jsx(Text, { x: r.x - r.radiusX, y: r.y - r.radiusY + 4, text: r.label, fontSize: 13, fill: "#fff", listening: false }, `${r.id}-label`)] }));
                }
                if (r.shape === 'custom') {
                    const xs = r.points.filter((_, i) => i % 2 === 0);
                    const ys = r.points.filter((_, i) => i % 2 !== 0);
                    const minX = Math.min(...xs);
                    const minY = Math.min(...ys);
                    return (_jsxs(_Fragment, { children: [_jsx(Line, { id: r.id, points: r.points, fill: r.fill, stroke: stroke, strokeWidth: strokeWidth, closed: true, ...shared, onDragEnd: e => {
                                    dispatch({ type: 'UPDATE_ROOM', payload: {
                                            id: r.id,
                                            points: r.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()),
                                        } });
                                    e.target.position({ x: 0, y: 0 });
                                } }, r.id), r.grid && _jsx(PolyGrid, { grid: r.grid, points: r.points }, `${r.id}-grid`), r.label && _jsx(Text, { x: minX, y: minY, text: r.label, fontSize: 13, fill: "#fff", listening: false }, `${r.id}-label`)] }));
                }
                // Default: rect
                return (_jsxs(_Fragment, { children: [_jsx(Rect, { id: r.id, x: r.x, y: r.y, width: r.width, height: r.height, fill: r.fill, stroke: stroke, strokeWidth: strokeWidth, ...shared, onDragEnd: e => {
                                dispatch({ type: 'UPDATE_ROOM', payload: { id: r.id, x: e.target.x(), y: e.target.y() } });
                            } }, r.id), r.grid && _jsx(RectGrid, { grid: r.grid, x: r.x, y: r.y, width: r.width, height: r.height }, `${r.id}-grid`), r.label && (_jsx(Text, { x: r.x + r.width / 2, y: r.y + r.height / 2, text: r.label, fontSize: 13, fill: "#fff", offsetX: r.label.length * 3.5, offsetY: 7, listening: false }, `${r.id}-label`))] }));
            }), caves.map(c => {
                const cxs = c.points.filter((_, i) => i % 2 === 0);
                const cys = c.points.filter((_, i) => i % 2 !== 0);
                const ccx = cxs.reduce((a, b) => a + b, 0) / cxs.length;
                const ccy = cys.reduce((a, b) => a + b, 0) / cys.length;
                const spanX = Math.max(...cxs) - Math.min(...cxs);
                return (_jsxs(_Fragment, { children: [_jsx(Line, { id: c.id, points: c.points, fill: c.fill, stroke: selectedId === c.id ? '#00aaff' : '#aaa', strokeWidth: selectedId === c.id ? 3 : 2, closed: true, draggable: draggable, onClick: () => onSelect(c.id), onDragEnd: e => {
                                dispatch({
                                    type: 'UPDATE_CAVE',
                                    payload: { id: c.id, points: c.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) },
                                });
                                e.target.position({ x: 0, y: 0 });
                            } }, c.id), c.grid && _jsx(PolyGrid, { grid: c.grid, points: c.points }, `${c.id}-grid`), c.label && (_jsx(Text, { x: ccx - spanX / 2, y: ccy - 7, width: spanX, text: c.label, fontSize: 13, fill: "#fff", align: "center", listening: false }, `${c.id}-label`))] }));
            })] }));
}
