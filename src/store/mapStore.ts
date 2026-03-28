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

export function migrateState(raw: MapState): MapState {
  const parsed = { ...raw }
  if (!parsed.globalGrid) {
    parsed.globalGrid = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 }
  }
  const rooms = parsed.rooms ?? []
  parsed.rooms = rooms.map((r: MapRoom) => ('shape' in r ? r : { ...r, shape: 'rect' as const }))
  const caves = parsed.caves ?? []
  parsed.caves = caves
  const terrain = parsed.terrain ?? []
  parsed.terrain = terrain
  const items = parsed.items ?? []
  parsed.items = items
  if (!parsed.layerOrder) {
    // Build order from existing arrays: terrain first, then rooms, caves, items
    parsed.layerOrder = [
      ...terrain.map(t => t.id),
      ...rooms.map(r => r.id),
      ...caves.map(c => c.id),
      ...items.map(i => i.id),
    ]
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

export function exportMapToJson(entry: SavedMapEntry): void {
  const json = JSON.stringify(entry.state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entry.name}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export type ValidationResult =
  | { ok: true; state: MapState; name: string }
  | { ok: false; error: string }

export function validateAndImportMapJson(json: string): ValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Invalid JSON file.' }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'File must be a JSON object.' }
  }

  const obj = parsed as Record<string, unknown>

  // Detect if this is a full SavedMapEntry or just a MapState
  let rawState: unknown
  let name = 'Imported Map'

  if ('state' in obj && 'name' in obj) {
    // Full SavedMapEntry
    rawState = obj.state
    name = typeof obj.name === 'string' ? obj.name : 'Imported Map'
  } else if ('rooms' in obj || 'caves' in obj || 'terrain' in obj || 'items' in obj) {
    // Bare MapState
    rawState = obj
  } else {
    return { ok: false, error: 'Unrecognized format: missing rooms, caves, terrain, or items.' }
  }

  if (typeof rawState !== 'object' || rawState === null || Array.isArray(rawState)) {
    return { ok: false, error: 'Map state must be an object.' }
  }

  const s = rawState as Record<string, unknown>

  if (!Array.isArray(s.rooms)) return { ok: false, error: 'Missing or invalid "rooms" array.' }
  if (!Array.isArray(s.caves)) return { ok: false, error: 'Missing or invalid "caves" array.' }
  if (!Array.isArray(s.terrain)) return { ok: false, error: 'Missing or invalid "terrain" array.' }
  if (!Array.isArray(s.items)) return { ok: false, error: 'Missing or invalid "items" array.' }

  const validTerrainTypes = new Set(['forest', 'grass', 'mountain', 'rough', 'water', 'sand', 'swamp', 'snow'])

  for (const room of s.rooms as unknown[]) {
    if (typeof room !== 'object' || room === null) return { ok: false, error: 'Invalid room entry.' }
    const r = room as Record<string, unknown>
    if (typeof r.id !== 'string') return { ok: false, error: 'Room missing string id.' }
    if (!['rect', 'ellipse', 'custom'].includes(r.shape as string)) return { ok: false, error: `Room "${r.id}" has invalid shape.` }
  }

  for (const cave of s.caves as unknown[]) {
    if (typeof cave !== 'object' || cave === null) return { ok: false, error: 'Invalid cave entry.' }
    const c = cave as Record<string, unknown>
    if (typeof c.id !== 'string') return { ok: false, error: 'Cave missing string id.' }
    if (!Array.isArray(c.points)) return { ok: false, error: `Cave "${c.id}" missing points array.` }
  }

  for (const t of s.terrain as unknown[]) {
    if (typeof t !== 'object' || t === null) return { ok: false, error: 'Invalid terrain entry.' }
    const tr = t as Record<string, unknown>
    if (typeof tr.id !== 'string') return { ok: false, error: 'Terrain missing string id.' }
    if (!validTerrainTypes.has(tr.terrainType as string)) return { ok: false, error: `Terrain "${tr.id}" has invalid terrainType.` }
  }

  for (const item of s.items as unknown[]) {
    if (typeof item !== 'object' || item === null) return { ok: false, error: 'Invalid item entry.' }
    const it = item as Record<string, unknown>
    if (typeof it.id !== 'string') return { ok: false, error: 'Item missing string id.' }
    if (typeof it.x !== 'number' || typeof it.y !== 'number') return { ok: false, error: `Item "${it.id}" missing x/y coordinates.` }
  }

  const state = migrateState(rawState as MapState)
  return { ok: true, state, name }
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
  | { type: 'REORDER_ELEMENT'; payload: { id: string; direction: 'up' | 'down' } }
  | { type: 'LOAD_STATE'; payload: MapState }
  | { type: 'CLEAR_ALL' }

const DEFAULT_GLOBAL_GRID: GridSettings = { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 }

const initialState: MapState = {
  rooms: [],
  caves: [],
  terrain: [],
  items: [],
  globalGrid: DEFAULT_GLOBAL_GRID,
  layerOrder: [],
}

export function mapReducer(state: MapState, action: Action): MapState {
  switch (action.type) {
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload], layerOrder: [...state.layerOrder, action.payload.id] }
    case 'ADD_CAVE':
      return { ...state, caves: [...state.caves, action.payload], layerOrder: [...state.layerOrder, action.payload.id] }
    case 'ADD_TERRAIN':
      return { ...state, terrain: [...state.terrain, action.payload], layerOrder: [...state.layerOrder, action.payload.id] }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload], layerOrder: [...state.layerOrder, action.payload.id] }
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
        layerOrder: state.layerOrder.filter(id => id !== action.payload.id),
      }
    case 'SET_GLOBAL_GRID':
      return { ...state, globalGrid: { ...state.globalGrid, ...action.payload } }
    case 'REORDER_ELEMENT': {
      const { id, direction } = action.payload
      const order = [...state.layerOrder]
      const idx = order.indexOf(id)
      if (idx === -1) return state
      const next = direction === 'up' ? idx + 1 : idx - 1
      if (next < 0 || next >= order.length) return state
      ;[order[idx], order[next]] = [order[next], order[idx]]
      return { ...state, layerOrder: order }
    }
    case 'LOAD_STATE':
      return action.payload
    case 'CLEAR_ALL':
      localStorage.removeItem(STORAGE_KEY)
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
