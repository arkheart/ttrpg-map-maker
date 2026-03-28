export type ToolType = 'select' | 'room' | 'cave' | 'terrain' | 'item' | 'erase'

export type CaveDrawMode = 'polygon' | 'paint'

export type RoomDrawMode = 'rect' | 'ellipse' | 'custom'

export type TerrainType = 'forest' | 'grass' | 'mountain' | 'rough' | 'water' | 'sand' | 'swamp' | 'snow'

export interface TerrainDef {
  label: string
  fill: string
  stroke: string
  icon: string
}

export const TERRAIN_PALETTE: Record<TerrainType, TerrainDef> = {
  forest:   { label: 'Forest',        fill: '#1e3d1e', stroke: '#2d5a2d', icon: '🌲' },
  grass:    { label: 'Grass',         fill: '#4a7c4e', stroke: '#5a9c5e', icon: '🌿' },
  mountain: { label: 'Mountain',      fill: '#5a5a5a', stroke: '#888',    icon: '⛰' },
  rough:    { label: 'Rough Terrain', fill: '#6b5a3a', stroke: '#8b7a5a', icon: '🪨' },
  water:    { label: 'Water',         fill: '#1a3a5c', stroke: '#2b5f8a', icon: '🌊' },
  sand:     { label: 'Sand',          fill: '#c2a96e', stroke: '#d4bb80', icon: '🏜' },
  swamp:    { label: 'Swamp',         fill: '#2d3d1a', stroke: '#4a6030', icon: '🌾' },
  snow:     { label: 'Snow',          fill: '#ccd8e0', stroke: '#a0b8c8', icon: '❄' },
}

export interface GridSettings {
  enabled: boolean
  size: number   // pixels per cell
  color?: string // default '#ffffff'
  opacity?: number // default 0.15
}

export type MapRoom =
  | { id: string; shape: 'rect';    x: number; y: number; width: number; height: number; fill: string; label?: string; grid?: GridSettings }
  | { id: string; shape: 'ellipse'; x: number; y: number; radiusX: number; radiusY: number; fill: string; label?: string; grid?: GridSettings }
  | { id: string; shape: 'custom';  points: number[]; fill: string; label?: string; grid?: GridSettings }

export interface MapCave {
  id: string
  // Flat array [x0, y0, x1, y1, ...] for Konva Line
  points: number[]
  fill: string
  label?: string
  grid?: GridSettings
}

export type TerrainDrawMode = 'rect' | 'ellipse' | 'custom'

export type MapTerrain =
  | { id: string; shape: 'rect';    x: number; y: number; width: number; height: number; terrainType: TerrainType; label?: string; grid?: GridSettings }
  | { id: string; shape: 'ellipse'; x: number; y: number; radiusX: number; radiusY: number; terrainType: TerrainType; label?: string; grid?: GridSettings }
  | { id: string; shape: 'custom';  points: number[]; terrainType: TerrainType; label?: string; grid?: GridSettings }

export interface MapItem {
  id: string
  x: number
  y: number
  symbol: string
  label?: string
}

export interface MapState {
  rooms: MapRoom[]
  caves: MapCave[]
  terrain: MapTerrain[]
  items: MapItem[]
  globalGrid: GridSettings
  layerOrder: string[] // IDs bottom→top render order
}

export interface SelectedElement {
  type: 'room' | 'cave' | 'terrain' | 'item'
  id: string
}
