import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Ellipse, Line, Circle } from 'react-konva';
const CLOSE_THRESHOLD = 12;
export function TerrainDrawLayer({ drawMode, preview, points, mousePos }) {
    const isNearFirst = mousePos && points.length >= 4
        ? Math.hypot(mousePos.x - points[0], mousePos.y - points[1]) < CLOSE_THRESHOLD
        : false;
    return (_jsxs(Layer, { listening: false, children: [drawMode === 'ellipse' && preview && preview.w > 2 && preview.h > 2 && (_jsx(Ellipse, { x: preview.x + preview.w / 2, y: preview.y + preview.h / 2, radiusX: preview.w / 2, radiusY: preview.h / 2, fill: "rgba(74,124,78,0.3)", stroke: "#00aaff", strokeWidth: 2, dash: [6, 4] })), drawMode === 'custom' && points.length >= 4 && (_jsx(Line, { points: points, fill: "rgba(74,124,78,0.3)", stroke: "#aaa", strokeWidth: 2, closed: true })), drawMode === 'custom' && points.length >= 2 && (_jsx(Line, { points: points, stroke: "#aaa", strokeWidth: 2, closed: false })), drawMode === 'custom' && Array.from({ length: points.length / 2 }, (_, i) => (_jsx(Circle, { x: points[i * 2], y: points[i * 2 + 1], radius: i === 0 ? 6 : 4, fill: i === 0 ? (isNearFirst ? '#00ff88' : '#00aaff') : '#fff', stroke: "#333", strokeWidth: 1 }, i))), drawMode === 'custom' && points.length >= 2 && mousePos && (_jsx(Line, { points: [points[points.length - 2], points[points.length - 1], mousePos.x, mousePos.y], stroke: "#00aaff", strokeWidth: 1, dash: [6, 4] }))] }));
}
