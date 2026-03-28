import { jsx as _jsx } from "react/jsx-runtime";
import { Group, Line } from 'react-konva';
/** Grid clipped to a rectangle (rooms, terrain rects) */
export function RectGrid({ grid, x, y, width, height }) {
    if (!grid.enabled || grid.size < 4)
        return null;
    const color = grid.color ?? '#ffffff';
    const opacity = grid.opacity ?? 0.2;
    const size = grid.size;
    const lines = [];
    for (let dx = 0; dx <= width; dx += size) {
        lines.push(_jsx(Line, { points: [x + dx, y, x + dx, y + height], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `v-${dx}`));
    }
    for (let dy = 0; dy <= height; dy += size) {
        lines.push(_jsx(Line, { points: [x, y + dy, x + width, y + dy], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `h-${dy}`));
    }
    return (_jsx(Group, { clipX: x, clipY: y, clipWidth: width, clipHeight: height, listening: false, children: lines }));
}
/** Grid clipped to an arbitrary polygon (caves, custom terrain) */
export function PolyGrid({ grid, points }) {
    if (!grid.enabled || grid.size < 4 || points.length < 6)
        return null;
    const color = grid.color ?? '#ffffff';
    const opacity = grid.opacity ?? 0.2;
    const size = grid.size;
    const xs = points.filter((_, i) => i % 2 === 0);
    const ys = points.filter((_, i) => i % 2 !== 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    const lines = [];
    for (let dx = 0; dx <= width; dx += size) {
        lines.push(_jsx(Line, { points: [minX + dx, minY, minX + dx, maxY], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `v-${dx}`));
    }
    for (let dy = 0; dy <= height; dy += size) {
        lines.push(_jsx(Line, { points: [minX, minY + dy, maxX, minY + dy], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `h-${dy}`));
    }
    const pairs = [];
    for (let i = 0; i < points.length; i += 2) {
        pairs.push([points[i], points[i + 1]]);
    }
    return (_jsx(Group, { clipFunc: (ctx) => {
            ctx.beginPath();
            ctx.moveTo(pairs[0][0], pairs[0][1]);
            for (let i = 1; i < pairs.length; i++) {
                ctx.lineTo(pairs[i][0], pairs[i][1]);
            }
            ctx.closePath();
        }, listening: false, children: lines }));
}
/** Grid clipped to an ellipse */
export function EllipseGrid({ grid, cx, cy, radiusX, radiusY }) {
    if (!grid.enabled || grid.size < 4)
        return null;
    const color = grid.color ?? '#ffffff';
    const opacity = grid.opacity ?? 0.2;
    const size = grid.size;
    const lines = [];
    for (let dx = 0; dx <= radiusX * 2; dx += size) {
        lines.push(_jsx(Line, { points: [cx - radiusX + dx, cy - radiusY, cx - radiusX + dx, cy + radiusY], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `v-${dx}`));
    }
    for (let dy = 0; dy <= radiusY * 2; dy += size) {
        lines.push(_jsx(Line, { points: [cx - radiusX, cy - radiusY + dy, cx + radiusX, cy - radiusY + dy], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `h-${dy}`));
    }
    return (_jsx(Group, { clipFunc: (ctx) => {
            ctx.beginPath();
            ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.closePath();
        }, listening: false, children: lines }));
}
