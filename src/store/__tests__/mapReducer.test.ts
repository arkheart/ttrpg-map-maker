import { describe, it, expect } from 'vitest'
import { mapReducer } from '../mapStore'
import type { MapState, MapRoom, MapCave, MapTerrain, MapItem } from '@/types/map'

const emptyState: MapState = {
  rooms: [],
  caves: [],
  terrain: [],
  items: [],
  globalGrid: { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 },
  layerOrder: [],
}

const rectRoom: MapRoom = { id: 'r1', shape: 'rect', x: 10, y: 20, width: 100, height: 80, fill: '#333' }
const cave: MapCave = { id: 'c1', points: [0, 0, 10, 10, 20, 0], fill: '#444' }
const terrain: MapTerrain = { id: 't1', shape: 'rect', x: 0, y: 0, width: 50, height: 50, terrainType: 'forest' }
const item: MapItem = { id: 'i1', x: 5, y: 5, symbol: '🚪' }

describe('mapReducer — ADD actions', () => {
  it('ADD_ROOM appends room and id to layerOrder', () => {
    const state = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    expect(state.rooms).toEqual([rectRoom])
    expect(state.layerOrder).toEqual(['r1'])
  })

  it('ADD_CAVE appends cave and id to layerOrder', () => {
    const state = mapReducer(emptyState, { type: 'ADD_CAVE', payload: cave })
    expect(state.caves).toEqual([cave])
    expect(state.layerOrder).toEqual(['c1'])
  })

  it('ADD_TERRAIN appends terrain and id to layerOrder', () => {
    const state = mapReducer(emptyState, { type: 'ADD_TERRAIN', payload: terrain })
    expect(state.terrain).toEqual([terrain])
    expect(state.layerOrder).toEqual(['t1'])
  })

  it('ADD_ITEM appends item and id to layerOrder', () => {
    const state = mapReducer(emptyState, { type: 'ADD_ITEM', payload: item })
    expect(state.items).toEqual([item])
    expect(state.layerOrder).toEqual(['i1'])
  })

  it('multiple ADDs build layerOrder in insertion order', () => {
    let state = mapReducer(emptyState, { type: 'ADD_TERRAIN', payload: terrain })
    state = mapReducer(state, { type: 'ADD_ROOM', payload: rectRoom })
    state = mapReducer(state, { type: 'ADD_ITEM', payload: item })
    expect(state.layerOrder).toEqual(['t1', 'r1', 'i1'])
  })
})

describe('mapReducer — UPDATE actions', () => {
  it('UPDATE_ROOM merges partial fields', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    const updated = mapReducer(base, { type: 'UPDATE_ROOM', payload: { id: 'r1', x: 99, fill: '#fff' } })
    expect(updated.rooms[0]).toMatchObject({ id: 'r1', x: 99, fill: '#fff', y: 20 })
  })

  it('UPDATE_ROOM ignores unknown id', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    const updated = mapReducer(base, { type: 'UPDATE_ROOM', payload: { id: 'nope', x: 99 } })
    expect(updated.rooms[0].x).toBe(10)
  })

  it('UPDATE_CAVE merges partial fields', () => {
    const base = mapReducer(emptyState, { type: 'ADD_CAVE', payload: cave })
    const updated = mapReducer(base, { type: 'UPDATE_CAVE', payload: { id: 'c1', fill: '#aaa' } })
    expect(updated.caves[0].fill).toBe('#aaa')
    expect(updated.caves[0].points).toEqual(cave.points)
  })

  it('UPDATE_TERRAIN merges partial fields', () => {
    const base = mapReducer(emptyState, { type: 'ADD_TERRAIN', payload: terrain })
    const updated = mapReducer(base, { type: 'UPDATE_TERRAIN', payload: { id: 't1', terrainType: 'water' } })
    expect(updated.terrain[0]).toMatchObject({ id: 't1', terrainType: 'water' })
  })

  it('UPDATE_ITEM merges partial fields', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ITEM', payload: item })
    const updated = mapReducer(base, { type: 'UPDATE_ITEM', payload: { id: 'i1', x: 42, label: 'Door' } })
    expect(updated.items[0]).toMatchObject({ x: 42, label: 'Door', symbol: '🚪' })
  })
})

describe('mapReducer — DELETE_ELEMENT', () => {
  it('removes a room and its layerOrder entry', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    const state = mapReducer(base, { type: 'DELETE_ELEMENT', payload: { id: 'r1' } })
    expect(state.rooms).toHaveLength(0)
    expect(state.layerOrder).not.toContain('r1')
  })

  it('removes a cave', () => {
    const base = mapReducer(emptyState, { type: 'ADD_CAVE', payload: cave })
    const state = mapReducer(base, { type: 'DELETE_ELEMENT', payload: { id: 'c1' } })
    expect(state.caves).toHaveLength(0)
    expect(state.layerOrder).not.toContain('c1')
  })

  it('removes a terrain', () => {
    const base = mapReducer(emptyState, { type: 'ADD_TERRAIN', payload: terrain })
    const state = mapReducer(base, { type: 'DELETE_ELEMENT', payload: { id: 't1' } })
    expect(state.terrain).toHaveLength(0)
  })

  it('removes an item', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ITEM', payload: item })
    const state = mapReducer(base, { type: 'DELETE_ELEMENT', payload: { id: 'i1' } })
    expect(state.items).toHaveLength(0)
  })

  it('does not affect other elements when deleting one', () => {
    let state = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    state = mapReducer(state, { type: 'ADD_ITEM', payload: item })
    state = mapReducer(state, { type: 'DELETE_ELEMENT', payload: { id: 'r1' } })
    expect(state.items).toHaveLength(1)
    expect(state.layerOrder).toEqual(['i1'])
  })
})

describe('mapReducer — SET_GLOBAL_GRID', () => {
  it('merges grid settings', () => {
    const state = mapReducer(emptyState, { type: 'SET_GLOBAL_GRID', payload: { enabled: true, size: 64 } })
    expect(state.globalGrid).toMatchObject({ enabled: true, size: 64, color: '#ffffff', opacity: 0.15 })
  })

  it('does not affect other state', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    const state = mapReducer(base, { type: 'SET_GLOBAL_GRID', payload: { enabled: true } })
    expect(state.rooms).toHaveLength(1)
  })
})

describe('mapReducer — REORDER_ELEMENT', () => {
  function stateWithOrder(): MapState {
    let s = mapReducer(emptyState, { type: 'ADD_TERRAIN', payload: terrain })
    s = mapReducer(s, { type: 'ADD_ROOM', payload: rectRoom })
    s = mapReducer(s, { type: 'ADD_ITEM', payload: item })
    // layerOrder: ['t1', 'r1', 'i1']
    return s
  }

  it('moves element up (toward end)', () => {
    const state = mapReducer(stateWithOrder(), { type: 'REORDER_ELEMENT', payload: { id: 't1', direction: 'up' } })
    expect(state.layerOrder).toEqual(['r1', 't1', 'i1'])
  })

  it('moves element down (toward start)', () => {
    const state = mapReducer(stateWithOrder(), { type: 'REORDER_ELEMENT', payload: { id: 'i1', direction: 'down' } })
    expect(state.layerOrder).toEqual(['t1', 'i1', 'r1'])
  })

  it('does not move past the start', () => {
    const state = mapReducer(stateWithOrder(), { type: 'REORDER_ELEMENT', payload: { id: 't1', direction: 'down' } })
    expect(state.layerOrder).toEqual(['t1', 'r1', 'i1'])
  })

  it('does not move past the end', () => {
    const state = mapReducer(stateWithOrder(), { type: 'REORDER_ELEMENT', payload: { id: 'i1', direction: 'up' } })
    expect(state.layerOrder).toEqual(['t1', 'r1', 'i1'])
  })

  it('returns same state for unknown id', () => {
    const base = stateWithOrder()
    const state = mapReducer(base, { type: 'REORDER_ELEMENT', payload: { id: 'unknown', direction: 'up' } })
    expect(state.layerOrder).toEqual(base.layerOrder)
  })
})

describe('mapReducer — LOAD_STATE', () => {
  it('replaces state entirely', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    const newState: MapState = { ...emptyState, items: [item], layerOrder: ['i1'] }
    const state = mapReducer(base, { type: 'LOAD_STATE', payload: newState })
    expect(state.rooms).toHaveLength(0)
    expect(state.items).toEqual([item])
  })
})

describe('mapReducer — CLEAR_ALL', () => {
  it('resets to initial empty state', () => {
    const base = mapReducer(emptyState, { type: 'ADD_ROOM', payload: rectRoom })
    const state = mapReducer(base, { type: 'CLEAR_ALL' })
    expect(state.rooms).toHaveLength(0)
    expect(state.layerOrder).toHaveLength(0)
  })
})
