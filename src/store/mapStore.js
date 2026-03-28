import { createContext, useContext, useReducer } from 'react';
const STORAGE_KEY = 'ttrpg-map-state';
const MAPS_KEY = 'ttrpg-saved-maps';
function migrateState(parsed) {
    if (!parsed.globalGrid) {
        parsed.globalGrid = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 };
    }
    if (parsed.rooms) {
        parsed.rooms = parsed.rooms.map((r) => ('shape' in r ? r : { ...r, shape: 'rect' }));
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
};
function mapReducer(state, action) {
    switch (action.type) {
        case 'ADD_ROOM':
            return { ...state, rooms: [...state.rooms, action.payload] };
        case 'ADD_CAVE':
            return { ...state, caves: [...state.caves, action.payload] };
        case 'ADD_TERRAIN':
            return { ...state, terrain: [...state.terrain, action.payload] };
        case 'ADD_ITEM':
            return { ...state, items: [...state.items, action.payload] };
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
            };
        case 'SET_GLOBAL_GRID':
            return { ...state, globalGrid: { ...state.globalGrid, ...action.payload } };
        case 'LOAD_STATE':
            return action.payload;
        case 'CLEAR_ALL':
            localStorage.removeItem('ttrpg-map-state');
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
