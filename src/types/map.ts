export type ToolType = 'select' | 'room' | 'cave' | 'terrain' | 'item' | 'erase'

export interface MapRoom {
  id: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  label?: string
}

export interface MapCave {
  id: string
  // Flat array [x0, y0, x1, y1, ...] for Konva Line
  points: number[]
  fill: string
  label?: string
}

export interface MapTerrain {
  id: string
  x: number
  y: number
  width: number
  height: number
  fill: string
  label?: string
}

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
}

export interface SelectedElement {
  type: 'room' | 'cave' | 'terrain' | 'item'
  id: string
}
