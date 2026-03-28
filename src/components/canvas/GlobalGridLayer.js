import { jsx as _jsx } from "react/jsx-runtime";
import { Layer, Line } from 'react-konva';
export function GlobalGridLayer({ width, height, grid }) {
    if (!grid.enabled || grid.size < 4)
        return null;
    const color = grid.color ?? '#ffffff';
    const opacity = grid.opacity ?? 0.15;
    const size = grid.size;
    const lines = [];
    // Vertical lines
    for (let x = 0; x <= width; x += size) {
        lines.push(_jsx(Line, { points: [x, 0, x, height], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `gv-${x}`));
    }
    // Horizontal lines
    for (let y = 0; y <= height; y += size) {
        lines.push(_jsx(Line, { points: [0, y, width, y], stroke: color, strokeWidth: 0.5, opacity: opacity, listening: false }, `gh-${y}`));
    }
    return _jsx(Layer, { listening: false, children: lines });
}
