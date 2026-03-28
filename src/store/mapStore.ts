import { createContext, useContext, useReducer, Dispatch } from 'react'
const STORAGE_KEY = 'ttrpg-map-state'

export function loadState(): MapState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as MapState) : undefined
  } catch {
    return undefined
  }
}

export function saveState(state: MapState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage quota exceeded — silently ignore
  }
}
import type { MapState, MapRoom, MapCave, MapTerrain, MapItem, TerrainType } from '@/types/map'

type Action =
  | { type: 'ADD_ROOM'; payload: MapRoom }
  | { type: 'ADD_CAVE'; payload: MapCave }
  | { type: 'ADD_TERRAIN'; payload: MapTerrain }
  | { type: 'ADD_ITEM'; payload: MapItem }
  | { type: 'UPDATE_ROOM'; payload: Partial<MapRoom> & { id: string } }
  | { type: 'UPDATE_CAVE'; payload: Partial<MapCave> & { id: string } }
  | { type: 'UPDATE_TERRAIN'; payload: { id: string; terrainType?: TerrainType; label?: string; x?: number; y?: number; width?: number; height?: number; radiusX?: number; radiusY?: number; points?: number[] } }
  | { type: 'UPDATE_ITEM'; payload: Partial<MapItem> & { id: string } }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'CLEAR_ALL' }

const initialState: MapState = {
  rooms: [],
  caves: [],
  terrain: [],
  items: [],
}

function mapReducer(state: MapState, action: Action): MapState {
  switch (action.type) {
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] }
    case 'ADD_CAVE':
      return { ...state, caves: [...state.caves, action.payload] }
    case 'ADD_TERRAIN':
      return { ...state, terrain: [...state.terrain, action.payload] }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] }
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      }
    case 'UPDATE_CAVE':
      return {
        ...state,
        caves: state.caves.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      }
    case 'UPDATE_TERRAIN':
      return {
        ...state,
        terrain: state.terrain.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i
        ),
      }
    case 'DELETE_ELEMENT':
      return {
        rooms: state.rooms.filter(r => r.id !== action.payload.id),
        caves: state.caves.filter(c => c.id !== action.payload.id),
        terrain: state.terrain.filter(t => t.id !== action.payload.id),
        items: state.items.filter(i => i.id !== action.payload.id),
      }
    case 'CLEAR_ALL':
      localStorage.removeItem('ttrpg-map-state')
      return initialState
    default:
      return state
  }
}

export const MapStateContext = createContext<MapState>(initialState)
export const MapDispatchContext = createContext<Dispatch<Action>>(() => {})

export function useMapState() {
  return useContext(MapStateContext)
}

export function useMapDispatch() {
  return useContext(MapDispatchContext)
}

export function useMapReducer() {
  return useReducer(mapReducer, undefined, () => loadState() ?? initialState)
}
