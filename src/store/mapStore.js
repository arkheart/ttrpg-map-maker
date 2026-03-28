import { createContext, useContext, useReducer } from 'react';
const STORAGE_KEY = 'ttrpg-map-state';
export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return undefined;
        const parsed = JSON.parse(raw);
        // Migrate old saves that lack globalGrid
        if (!parsed.globalGrid) {
            parsed.globalGrid = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 };
        }
        // Migrate old rooms that lack shape field
        if (parsed.rooms) {
            parsed.rooms = parsed.rooms.map((r) => ('shape' in r ? r : { ...r, shape: 'rect' }));
        }
        return parsed;
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
