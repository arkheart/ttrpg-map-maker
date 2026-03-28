import { createContext, useContext, useReducer, Dispatch } from 'react'
const STORAGE_KEY = 'ttrpg-map-state'
const MAPS_KEY = 'ttrpg-saved-maps'
const CURRENT_MAP_KEY = 'ttrpg-current-map'

export interface SavedMapEntry {
  id: string
  name: string
  savedAt: number
  state: MapState
}

function migrateState(parsed: MapState): MapState {
  if (!parsed.globalGrid) {
    parsed.globalGrid = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 }
  }
  if (parsed.rooms) {
    parsed.rooms = parsed.rooms.map((r: MapRoom) => ('shape' in r ? r : { ...r, shape: 'rect' as const }))
  }
  return parsed
}

export function loadState(): MapState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return migrateState(JSON.parse(raw) as MapState)
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

export function loadSavedMaps(): SavedMapEntry[] {
  try {
    const raw = localStorage.getItem(MAPS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedMapEntry[]
  } catch {
    return []
  }
}

export interface CurrentMapMeta { id: string; name: string }

export function loadCurrentMapMeta(): CurrentMapMeta | undefined {
  try {
    const raw = localStorage.getItem(CURRENT_MAP_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

export function saveCurrentMapMeta(meta: CurrentMapMeta | undefined) {
  if (meta) {
    localStorage.setItem(CURRENT_MAP_KEY, JSON.stringify(meta))
  } else {
    localStorage.removeItem(CURRENT_MAP_KEY)
  }
}

export function saveMapToSlot(name: string, state: MapState, existingId?: string): SavedMapEntry {
  const maps = loadSavedMaps()
  const id = existingId ?? crypto.randomUUID()
  const entry: SavedMapEntry = { id, name, savedAt: Date.now(), state }
  const idx = maps.findIndex(m => m.id === id)
  if (idx >= 0) {
    maps[idx] = entry
  } else {
    maps.unshift(entry)
  }
  try {
    localStorage.setItem(MAPS_KEY, JSON.stringify(maps))
  } catch {
    // storage quota exceeded
  }
  return entry
}

export function deleteMapSlot(id: string) {
  const maps = loadSavedMaps().filter(m => m.id !== id)
  try {
    localStorage.setItem(MAPS_KEY, JSON.stringify(maps))
  } catch {}
}
import type { MapState, MapRoom, MapCave, MapTerrain, MapItem, TerrainType, GridSettings } from '@/types/map'

type Action =
  | { type: 'ADD_ROOM'; payload: MapRoom }
  | { type: 'ADD_CAVE'; payload: MapCave }
  | { type: 'ADD_TERRAIN'; payload: MapTerrain }
  | { type: 'ADD_ITEM'; payload: MapItem }
  | { type: 'UPDATE_ROOM'; payload: { id: string; x?: number; y?: number; width?: number; height?: number; radiusX?: number; radiusY?: number; points?: number[]; fill?: string; label?: string; grid?: GridSettings | null } }
  | { type: 'UPDATE_CAVE'; payload: Partial<MapCave> & { id: string } }
  | { type: 'UPDATE_TERRAIN'; payload: { id: string; terrainType?: TerrainType; label?: string; x?: number; y?: number; width?: number; height?: number; radiusX?: number; radiusY?: number; points?: number[]; grid?: GridSettings | null } }
  | { type: 'UPDATE_ITEM'; payload: Partial<MapItem> & { id: string } }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'SET_GLOBAL_GRID'; payload: Partial<GridSettings> }
  | { type: 'LOAD_STATE'; payload: MapState }
  | { type: 'CLEAR_ALL' }

const DEFAULT_GLOBAL_GRID: GridSettings = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 }

const initialState: MapState = {
  rooms: [],
  caves: [],
  terrain: [],
  items: [],
  globalGrid: DEFAULT_GLOBAL_GRID,
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
        ...state,
        rooms: state.rooms.filter(r => r.id !== action.payload.id),
        caves: state.caves.filter(c => c.id !== action.payload.id),
        terrain: state.terrain.filter(t => t.id !== action.payload.id),
        items: state.items.filter(i => i.id !== action.payload.id),
      }
    case 'SET_GLOBAL_GRID':
      return { ...state, globalGrid: { ...state.globalGrid, ...action.payload } }
    case 'LOAD_STATE':
      return action.payload
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
