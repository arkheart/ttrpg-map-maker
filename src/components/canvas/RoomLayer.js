import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Rect, Line, Text } from 'react-konva';
import { useMapDispatch } from '@/store/mapStore';
import { useMapTool } from '@/hooks/useMapTool';
import { RectGrid, PolyGrid } from './ElementGrid';
export function RoomLayer({ rooms, caves, onSelect, selectedId }) {
    const dispatch = useMapDispatch();
    const { activeTool } = useMapTool();
    return (_jsxs(Layer, { children: [rooms.map(r => (_jsxs(_Fragment, { children: [_jsx(Rect, { id: r.id, x: r.x, y: r.y, width: r.width, height: r.height, fill: r.fill, stroke: selectedId === r.id ? '#00aaff' : '#ccc', strokeWidth: selectedId === r.id ? 3 : 2, draggable: activeTool === 'select', onClick: () => onSelect(r.id), onDragEnd: e => {
                            dispatch({
                                type: 'UPDATE_ROOM',
                                payload: { id: r.id, x: e.target.x(), y: e.target.y() },
                            });
                        } }, r.id), r.grid && _jsx(RectGrid, { grid: r.grid, x: r.x, y: r.y, width: r.width, height: r.height }, `${r.id}-grid`), r.label && (_jsx(Text, { x: r.x + r.width / 2, y: r.y + r.height / 2, text: r.label, fontSize: 13, fill: "#fff", offsetX: r.label.length * 3.5, offsetY: 7, listening: false }, `${r.id}-label`))] }))), caves.map(c => (_jsxs(_Fragment, { children: [_jsx(Line, { id: c.id, points: c.points, fill: c.fill, stroke: selectedId === c.id ? '#00aaff' : '#aaa', strokeWidth: selectedId === c.id ? 3 : 2, closed: true, draggable: activeTool === 'select', onClick: () => onSelect(c.id), onDragEnd: e => {
                            dispatch({
                                type: 'UPDATE_CAVE',
                                payload: { id: c.id, points: c.points.map((p, i) => i % 2 === 0 ? p + e.target.x() : p + e.target.y()) },
                            });
                            e.target.position({ x: 0, y: 0 });
                        } }, c.id), c.grid && _jsx(PolyGrid, { grid: c.grid, points: c.points }, `${c.id}-grid`), c.label && (_jsx(Text, { x: c.points[0], y: c.points[1], text: c.label, fontSize: 13, fill: "#fff", listening: false }, `${c.id}-label`))] })))] }));
}
