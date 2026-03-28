import { createContext, useContext, useReducer } from 'react';
const STORAGE_KEY = 'ttrpg-map-state';
const MAPS_KEY = 'ttrpg-saved-maps';
const CURRENT_MAP_KEY = 'ttrpg-current-map';
export function migrateState(raw) {
    const parsed = { ...raw };
    if (!parsed.globalGrid) {
        parsed.globalGrid = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 };
    }
    const rooms = parsed.rooms ?? [];
    parsed.rooms = rooms.map((r) => ('shape' in r ? r : { ...r, shape: 'rect' }));
    const caves = parsed.caves ?? [];
    parsed.caves = caves;
    const terrain = parsed.terrain ?? [];
    parsed.terrain = terrain;
    const items = parsed.items ?? [];
    parsed.items = items;
    if (!parsed.layerOrder) {
        // Build order from existing arrays: terrain first, then rooms, caves, items
        parsed.layerOrder = [
            ...terrain.map(t => t.id),
            ...rooms.map(r => r.id),
            ...caves.map(c => c.id),
            ...items.map(i => i.id),
        ];
    }
    return parsed;
}
export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return undefined;
        return migrateState(JSON.parse(raw));
    }
    catch {
        return undefined;
    }
}
export function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    catch {
        // storage quota exceeded — silently ignore
    }
}
export function loadSavedMaps() {
    try {
        const raw = localStorage.getItem(MAPS_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
export function loadCurrentMapMeta() {
    try {
        const raw = localStorage.getItem(CURRENT_MAP_KEY);
        return raw ? JSON.parse(raw) : undefined;
    }
    catch {
        return undefined;
    }
}
export function saveCurrentMapMeta(meta) {
    if (meta) {
        localStorage.setItem(CURRENT_MAP_KEY, JSON.stringify(meta));
    }
    else {
        localStorage.removeItem(CURRENT_MAP_KEY);
    }
}
export function saveMapToSlot(name, state, existingId) {
    const maps = loadSavedMaps();
    const id = existingId ?? crypto.randomUUID();
    const entry = { id, name, savedAt: Date.now(), state };
    const idx = maps.findIndex(m => m.id === id);
    if (idx >= 0) {
        maps[idx] = entry;
    }
    else {
        maps.unshift(entry);
    }
    try {
        localStorage.setItem(MAPS_KEY, JSON.stringify(maps));
    }
    catch {
        // storage quota exceeded
    }
    return entry;
}
export function deleteMapSlot(id) {
    const maps = loadSavedMaps().filter(m => m.id !== id);
    try {
        localStorage.setItem(MAPS_KEY, JSON.stringify(maps));
    }
    catch { }
}
const DEFAULT_GLOBAL_GRID = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 };
const initialState = {
    rooms: [],
    caves: [],
    terrain: [],
    items: [],
    globalGrid: DEFAULT_GLOBAL_GRID,
    layerOrder: [],
};
export function mapReducer(state, action) {
    switch (action.type) {
        case 'ADD_ROOM':
            return { ...state, rooms: [...state.rooms, action.payload], layerOrder: [...state.layerOrder, action.payload.id] };
        case 'ADD_CAVE':
            return { ...state, caves: [...state.caves, action.payload], layerOrder: [...state.layerOrder, action.payload.id] };
        case 'ADD_TERRAIN':
            return { ...state, terrain: [...state.terrain, action.payload], layerOrder: [...state.layerOrder, action.payload.id] };
        case 'ADD_ITEM':
            return { ...state, items: [...state.items, action.payload], layerOrder: [...state.layerOrder, action.payload.id] };
        case 'UPDATE_ROOM':
            return {
                ...state,
                rooms: state.rooms.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r),
            };
        case 'UPDATE_CAVE':
            return {
                ...state,
                caves: state.caves.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c),
            };
        case 'UPDATE_TERRAIN':
            return {
                ...state,
                terrain: state.terrain.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t),
            };
        case 'UPDATE_ITEM':
            return {
                ...state,
                items: state.items.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i),
            };
        case 'DELETE_ELEMENT':
            return {
                ...state,
                rooms: state.rooms.filter(r => r.id !== action.payload.id),
                caves: state.caves.filter(c => c.id !== action.payload.id),
                terrain: state.terrain.filter(t => t.id !== action.payload.id),
                items: state.items.filter(i => i.id !== action.payload.id),
                layerOrder: state.layerOrder.filter(id => id !== action.payload.id),
            };
        case 'SET_GLOBAL_GRID':
            return { ...state, globalGrid: { ...state.globalGrid, ...action.payload } };
        case 'REORDER_ELEMENT': {
            const { id, direction } = action.payload;
            const order = [...state.layerOrder];
            const idx = order.indexOf(id);
            if (idx === -1)
                return state;
            const next = direction === 'up' ? idx + 1 : idx - 1;
            if (next < 0 || next >= order.length)
                return state;
            [order[idx], order[next]] = [order[next], order[idx]];
            return { ...state, layerOrder: order };
        }
        case 'LOAD_STATE':
            return action.payload;
        case 'CLEAR_ALL':
            localStorage.removeItem(STORAGE_KEY);
            return initialState;
        default:
            return state;
    }
}
export const MapStateContext = createContext(initialState);
export const MapDispatchContext = createContext(() => { });
export function useMapState() {
    return useContext(MapStateContext);
}
export function useMapDispatch() {
    return useContext(MapDispatchContext);
}
export function useMapReducer() {
    return useReducer(mapReducer, undefined, () => loadState() ?? initialState);
}
