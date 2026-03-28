import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Line, Circle } from 'react-konva';
export function PaintCaveDrawLayer({ points }) {
    if (points.length < 4)
        return null;
    return (_jsxs(Layer, { listening: false, children: [_jsx(Line, { points: points, stroke: "rgba(45,36,16,0.7)", strokeWidth: 2, lineJoin: "round", lineCap: "round", closed: false }), _jsx(Line, { points: points, fill: "rgba(45,36,16,0.4)", stroke: "#aaa", strokeWidth: 1, closed: true })] }));
}
export function CaveDrawLayer({ points, mousePos, color = '#aaa' }) {
    if (points.length === 0)
        return null;
    // Preview line from last vertex to current mouse position
    const lastX = points[points.length - 2];
    const lastY = points[points.length - 1];
    const previewPoints = mousePos ? [lastX, lastY, mousePos.x, mousePos.y] : [];
    return (_jsxs(Layer, { listening: false, children: [points.length >= 4 && (_jsx(Line, { points: points, fill: "rgba(45, 36, 16, 0.5)", stroke: color, strokeWidth: 2, closed: true })), _jsx(Line, { points: points, stroke: color, strokeWidth: 2, closed: false }), Array.from({ length: points.length / 2 }, (_, i) => (_jsx(Circle, { x: points[i * 2], y: points[i * 2 + 1], radius: i === 0 ? 6 : 4, fill: i === 0 ? '#00aaff' : '#fff', stroke: "#333", strokeWidth: 1 }, i))), previewPoints.length === 4 && (_jsx(Line, { points: previewPoints, stroke: "#00aaff", strokeWidth: 1, dash: [6, 4] }))] }));
}
