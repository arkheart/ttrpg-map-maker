import { jsx as _jsx } from "react/jsx-runtime";
import { Layer, Line } from 'react-konva';
export function GlobalGridLayer({ width, height, scale, stagePos, grid }) {
    if (!grid.enabled || grid.size < 4)
        return null;
    const color = grid.color ?? '#ffffff';
    const opacity = grid.opacity ?? 0.15;
    const size = grid.size;
    // Compute the visible world-space bounds
    const left = -stagePos.x / scale;
    const top = -stagePos.y / scale;
    const right = left + width / scale;
    const bottom = top + height / scale;
    // Snap start positions to the nearest grid line
    const startX = Math.floor(left / size) * size;
    const startY = Math.floor(top / size) * size;
    const lines = [];
    for (let x = startX; x <= right; x += size) {
        lines.push(_jsx(Line, { points: [x, top, x, bottom], stroke: color, strokeWidth: 0.5 / scale, opacity: opacity, listening: false }, `gv-${x}`));
    }
    for (let y = startY; y <= bottom; y += size) {
        lines.push(_jsx(Line, { points: [left, y, right, y], stroke: color, strokeWidth: 0.5 / scale, opacity: opacity, listening: false }, `gh-${y}`));
    }
    return _jsx(Layer, { listening: false, children: lines });
}
