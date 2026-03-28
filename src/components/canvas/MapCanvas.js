import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Stage } from 'react-konva';
import { TerrainLayer } from './TerrainLayer';
import { TerrainDrawLayer } from './TerrainDrawLayer';
import { RoomLayer } from './RoomLayer';
import { ItemLayer } from './ItemLayer';
import { CaveDrawLayer } from './CaveDrawLayer';
import { GlobalGridLayer } from './GlobalGridLayer';
import { useMapState, useMapDispatch } from '@/store/mapStore';
import { useMapTool } from '@/hooks/useMapTool';
import { useCanvasSize } from '@/hooks/useCanvasSize';
const ROOM_FILL = '#3a3a3a';
const CAVE_FILL = '#2d2410';
const CLOSE_THRESHOLD = 12;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.1;
const ITEM_SYMBOLS = {
    door: '🚪', chest: '📦', trap: '⚠', stairs: '🔼', torch: '🕯', monster: '👾',
};
const EXPORT_PADDING = 40;
const EXPORT_PIXEL_RATIO = 2;

function computeMapBounds(state) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of state.rooms) {
        minX = Math.min(minX, r.x); minY = Math.min(minY, r.y);
        maxX = Math.max(maxX, r.x + r.width); maxY = Math.max(maxY, r.y + r.height);
    }
    for (const c of state.caves) {
        for (let i = 0; i < c.points.length; i += 2) {
            minX = Math.min(minX, c.points[i]); maxX = Math.max(maxX, c.points[i]);
            minY = Math.min(minY, c.points[i + 1]); maxY = Math.max(maxY, c.points[i + 1]);
        }
    }
    for (const t of state.terrain) {
        if (t.shape === 'rect') {
            minX = Math.min(minX, t.x); minY = Math.min(minY, t.y);
            maxX = Math.max(maxX, t.x + t.width); maxY = Math.max(maxY, t.y + t.height);
        } else if (t.shape === 'ellipse') {
            minX = Math.min(minX, t.x - t.radiusX); minY = Math.min(minY, t.y - t.radiusY);
            maxX = Math.max(maxX, t.x + t.radiusX); maxY = Math.max(maxY, t.y + t.radiusY);
        } else if (t.shape === 'custom') {
            for (let i = 0; i < t.points.length; i += 2) {
                minX = Math.min(minX, t.points[i]); maxX = Math.max(maxX, t.points[i]);
                minY = Math.min(minY, t.points[i + 1]); maxY = Math.max(maxY, t.points[i + 1]);
            }
        }
    }
    for (const item of state.items) {
        minX = Math.min(minX, item.x); minY = Math.min(minY, item.y);
        maxX = Math.max(maxX, item.x + 24); maxY = Math.max(maxY, item.y + 24);
    }
    if (!isFinite(minX)) return null;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export const MapCanvas = forwardRef(function MapCanvas({ selectedElement, onSelect }, ref) {
    const containerRef = useRef(null);
    const stageRef = useRef(null);
    const { width, height } = useCanvasSize(containerRef);
    const state = useMapState();
    const dispatch = useMapDispatch();
    const { activeTool, activeTerrainType, terrainDrawMode } = useMapTool();
    // Viewport state
    const [scale, setScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    // Drag-draw state (room, terrain rect/ellipse)
    const [dragStart, setDragStart] = useState(null);
    const [previewRect, setPreviewRect] = useState(null);
    // Polygon state (cave + terrain custom)
    const [cavePoints, setCavePoints] = useState([]);
    const [terrainPoints, setTerrainPoints] = useState([]);
    const [mousePos, setMousePos] = useState(null);
    const getPos = (e) => {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        return {
            x: (pointer.x - stage.x()) / stage.scaleX(),
            y: (pointer.y - stage.y()) / stage.scaleY(),
        };
    };
    const isNearFirst = (points, x, y) => points.length >= 4 && Math.hypot(x - points[0], y - points[1]) < CLOSE_THRESHOLD;
    // ── Commit helpers ─────────────────────────────────────────────
    const commitCave = (points) => {
        if (points.length < 6)
            return;
        dispatch({ type: 'ADD_CAVE', payload: { id: crypto.randomUUID(), points, fill: CAVE_FILL } });
        setCavePoints([]);
        setMousePos(null);
    };
    const commitTerrainCustom = (points) => {
        if (points.length < 6)
            return;
        dispatch({ type: 'ADD_TERRAIN', payload: { id: crypto.randomUUID(), shape: 'custom', points, terrainType: activeTerrainType } });
        setTerrainPoints([]);
        setMousePos(null);
    };
    // ── Mouse move ─────────────────────────────────────────────────
    const handleMouseMove = (e) => {
        const pos = getPos(e);
        if (activeTool === 'cave' || (activeTool === 'terrain' && terrainDrawMode === 'custom')) {
            setMousePos(pos);
            return;
        }
        if (dragStart) {
            setPreviewRect({
                x: Math.min(dragStart.startX, pos.x),
                y: Math.min(dragStart.startY, pos.y),
                w: Math.abs(pos.x - dragStart.startX),
                h: Math.abs(pos.y - dragStart.startY),
            });
        }
    };
    const handleMouseLeave = () => setMousePos(null);
    // ── Ctrl+Scroll zoom ───────────────────────────────────────────
    const handleWheel = (e) => {
        if (!e.evt.ctrlKey)
            return;
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage)
            return;
        const pointer = stage.getPointerPosition();
        const oldScale = stage.scaleX();
        const direction = e.evt.deltaY < 0 ? 1 : -1;
        const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldScale * (direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP)));
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        setScale(newScale);
        setStagePos(newPos);
    };
    // ── Click ──────────────────────────────────────────────────────
    const handleClick = (e) => {
        const pos = getPos(e);
        const onStage = e.target === e.target.getStage();
        // Cave polygon
        if (activeTool === 'cave') {
            if (isNearFirst(cavePoints, pos.x, pos.y))
                commitCave(cavePoints);
            else
                setCavePoints(prev => [...prev, pos.x, pos.y]);
            return;
        }
        // Terrain custom polygon
        if (activeTool === 'terrain' && terrainDrawMode === 'custom') {
            if (isNearFirst(terrainPoints, pos.x, pos.y))
                commitTerrainCustom(terrainPoints);
            else
                setTerrainPoints(prev => [...prev, pos.x, pos.y]);
            return;
        }
        if (activeTool === 'select' && onStage) {
            onSelect(null);
            return;
        }
        if (activeTool === 'erase' && !onStage) {
            const id = e.target.id();
            if (id)
                dispatch({ type: 'DELETE_ELEMENT', payload: { id } });
            return;
        }
        if (activeTool === 'item') {
            dispatch({ type: 'ADD_ITEM', payload: { id: crypto.randomUUID(), x: pos.x - 12, y: pos.y - 12, symbol: ITEM_SYMBOLS['door'] } });
            return;
        }
    };
    const handleDblClick = (_e) => {
        if (activeTool === 'cave' && cavePoints.length >= 6) {
            commitCave(cavePoints.slice(0, -2));
        }
        if (activeTool === 'terrain' && terrainDrawMode === 'custom' && terrainPoints.length >= 6) {
            commitTerrainCustom(terrainPoints.slice(0, -2));
        }
    };
    // ── Mouse down / up (drag tools) ───────────────────────────────
    const handleMouseDown = (e) => {
        const isDragTool = activeTool === 'room' ||
            (activeTool === 'terrain' && (terrainDrawMode === 'rect' || terrainDrawMode === 'ellipse'));
        if (!isDragTool)
            return;
        if (e.target !== e.target.getStage())
            return;
        const pos = getPos(e);
        setDragStart({ startX: pos.x, startY: pos.y });
        setPreviewRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    };
    const handleMouseUp = (_e) => {
        if (!dragStart || !previewRect)
            return;
        const { x, y, w, h } = previewRect;
        if (w >= 5 && h >= 5) {
            const id = crypto.randomUUID();
            if (activeTool === 'room') {
                dispatch({ type: 'ADD_ROOM', payload: { id, x, y, width: w, height: h, fill: ROOM_FILL } });
            }
            else if (activeTool === 'terrain' && terrainDrawMode === 'rect') {
                dispatch({ type: 'ADD_TERRAIN', payload: { id, shape: 'rect', x, y, width: w, height: h, terrainType: activeTerrainType } });
            }
            else if (activeTool === 'terrain' && terrainDrawMode === 'ellipse') {
                dispatch({ type: 'ADD_TERRAIN', payload: { id, shape: 'ellipse', x: x + w / 2, y: y + h / 2, radiusX: w / 2, radiusY: h / 2, terrainType: activeTerrainType } });
            }
        }
        setDragStart(null);
        setPreviewRect(null);
    };
    // ── Select / erase via layer callbacks ─────────────────────────
    const handleSelect = (type, id) => {
        if (activeTool === 'erase')
            dispatch({ type: 'DELETE_ELEMENT', payload: { id } });
        else if (activeTool === 'select')
            onSelect({ type, id });
    };
    const exportPng = () => {
        const stage = stageRef.current;
        if (!stage) return;
        const bounds = computeMapBounds(state);
        if (!bounds) { alert('Nothing to export — draw something first!'); return; }
        const x = bounds.x - EXPORT_PADDING;
        const y = bounds.y - EXPORT_PADDING;
        const width = bounds.width + EXPORT_PADDING * 2;
        const height = bounds.height + EXPORT_PADDING * 2;
        const dataURL = stage.toDataURL({ x, y, width, height, pixelRatio: EXPORT_PIXEL_RATIO });
        const link = document.createElement('a');
        link.download = 'map.png';
        link.href = dataURL;
        link.click();
    };

    useImperativeHandle(ref, () => ({ exportPng }));

    const nearFirstCave = activeTool === 'cave' && mousePos ? isNearFirst(cavePoints, mousePos.x, mousePos.y) : false;
    const nearFirstTerrain = activeTool === 'terrain' && terrainDrawMode === 'custom' && mousePos ? isNearFirst(terrainPoints, mousePos.x, mousePos.y) : false;
    const showHint = activeTool === 'cave' || (activeTool === 'terrain' && terrainDrawMode === 'custom');
    const activePoints = activeTool === 'cave' ? cavePoints : terrainPoints;
    const nearFirst_ = nearFirstCave || nearFirstTerrain;
    return (_jsxs("div", { ref: containerRef, style: { flex: 1, background: '#1a1a1a', overflow: 'hidden', position: 'relative', minWidth: 0, minHeight: 0 }, children: [_jsxs(Stage, { ref: stageRef, width: width, height: height, scaleX: scale, scaleY: scale, x: stagePos.x, y: stagePos.y, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onClick: handleClick, onDblClick: handleDblClick, onMouseLeave: handleMouseLeave, onWheel: handleWheel, style: { cursor: activeTool === 'select' ? 'default' : nearFirst_ ? 'cell' : 'crosshair' }, children: [_jsx(TerrainLayer, { terrain: state.terrain, onSelect: id => handleSelect('terrain', id), selectedId: selectedElement?.type === 'terrain' ? selectedElement.id : null }), _jsx(RoomLayer, { rooms: state.rooms, caves: state.caves, onSelect: id => handleSelect(state.rooms.some(r => r.id === id) ? 'room' : 'cave', id), selectedId: selectedElement?.type === 'room' || selectedElement?.type === 'cave' ? selectedElement.id : null }), _jsx(ItemLayer, { items: state.items, onSelect: id => handleSelect('item', id), selectedId: selectedElement?.type === 'item' ? selectedElement.id : null }), _jsx(GlobalGridLayer, { width: width, height: height, grid: state.globalGrid }), _jsx(CaveDrawLayer, { points: cavePoints, mousePos: activeTool === 'cave' ? mousePos : null }), _jsx(TerrainDrawLayer, { drawMode: terrainDrawMode, preview: activeTool === 'terrain' ? previewRect : null, points: activeTool === 'terrain' && terrainDrawMode === 'custom' ? terrainPoints : [], mousePos: activeTool === 'terrain' ? mousePos : null })] }), previewRect && previewRect.w > 2 && previewRect.h > 2 && terrainDrawMode !== 'ellipse' && (_jsx("div", { style: {
                    position: 'absolute',
                    left: previewRect.x * scale + stagePos.x,
                    top: previewRect.y * scale + stagePos.y,
                    width: previewRect.w * scale,
                    height: previewRect.h * scale,
                    border: '2px dashed #00aaff',
                    pointerEvents: 'none',
                } })), showHint && (_jsx("div", { style: {
                    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.7)', color: '#aaa',
                    padding: '4px 12px', borderRadius: '4px', fontSize: '12px', pointerEvents: 'none',
                }, children: activePoints.length === 0
                    ? 'Click to place first vertex'
                    : nearFirst_
                        ? 'Click to close shape'
                        : `${activePoints.length / 2} vertices — click near start or double-click to close` })),
] }));
});
