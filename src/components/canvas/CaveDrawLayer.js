import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Layer, Line, Circle } from 'react-konva';
export function CaveDrawLayer({ points, mousePos }) {
    if (points.length === 0)
        return null;
    // Preview line from last vertex to current mouse position
    const lastX = points[points.length - 2];
    const lastY = points[points.length - 1];
    const previewPoints = mousePos ? [lastX, lastY, mousePos.x, mousePos.y] : [];
    return (_jsxs(Layer, { listening: false, children: [points.length >= 4 && (_jsx(Line, { points: points, fill: "rgba(45, 36, 16, 0.5)", stroke: "#aaa", strokeWidth: 2, closed: true })), _jsx(Line, { points: points, stroke: "#aaa", strokeWidth: 2, closed: false }), Array.from({ length: points.length / 2 }, (_, i) => (_jsx(Circle, { x: points[i * 2], y: points[i * 2 + 1], radius: i === 0 ? 6 : 4, fill: i === 0 ? '#00aaff' : '#fff', stroke: "#333", strokeWidth: 1 }, i))), previewPoints.length === 4 && (_jsx(Line, { points: previewPoints, stroke: "#00aaff", strokeWidth: 1, dash: [6, 4] }))] }));
}
