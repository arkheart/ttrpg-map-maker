import { describe, it, expect, beforeEach } from 'vitest'
import {
  migrateState,
  loadState,
  saveState,
  loadSavedMaps,
  saveMapToSlot,
  deleteMapSlot,
  loadCurrentMapMeta,
  saveCurrentMapMeta,
} from '../mapStore'
import type { MapState } from '@/types/map'

const baseState: MapState = {
  rooms: [],
  caves: [],
  terrain: [],
  items: [],
  globalGrid: { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 },
  layerOrder: [],
}

beforeEach(() => {
  localStorage.clear()
})

// ── migrateState ──────────────────────────────────────────────────────────────

describe('migrateState', () => {
  it('adds default globalGrid when missing', () => {
    const partial = { ...baseState, globalGrid: undefined } as unknown as MapState
    const result = migrateState(partial)
    expect(result.globalGrid).toEqual({ enabled: false, size: 32, color: '#ffffff', opacity: 0.15 })
  })

  it('preserves existing globalGrid', () => {
    const state = { ...baseState, globalGrid: { enabled: true, size: 64, color: '#000', opacity: 0.5 } }
    expect(migrateState(state).globalGrid).toEqual({ enabled: true, size: 64, color: '#000', opacity: 0.5 })
  })

  it('adds default layerOrder when missing', () => {
    const partial = {
      ...baseState,
      terrain: [{ id: 't1', shape: 'rect' as const, x: 0, y: 0, width: 10, height: 10, terrainType: 'grass' as const }],
      rooms: [{ id: 'r1', shape: 'rect' as const, x: 0, y: 0, width: 10, height: 10, fill: '#fff' }],
      layerOrder: undefined,
    } as unknown as MapState
    const result = migrateState(partial)
    expect(result.layerOrder).toEqual(['t1', 'r1'])
  })

  it('adds shape field to rooms that lack it', () => {
    const partial = {
      ...baseState,
      rooms: [{ id: 'r1', x: 0, y: 0, width: 10, height: 10, fill: '#fff' }],
      layerOrder: ['r1'],
    } as unknown as MapState
    const result = migrateState(partial)
    expect((result.rooms[0] as { shape: string }).shape).toBe('rect')
  })
})

// ── loadState / saveState ─────────────────────────────────────────────────────

describe('loadState / saveState', () => {
  it('returns undefined when localStorage is empty', () => {
    expect(loadState()).toBeUndefined()
  })

  it('round-trips state through localStorage', () => {
    saveState(baseState)
    const loaded = loadState()
    expect(loaded).toMatchObject(baseState)
  })

  it('returns undefined on invalid JSON', () => {
    localStorage.setItem('ttrpg-map-state', '{bad json')
    expect(loadState()).toBeUndefined()
  })
})

// ── saveMapToSlot / loadSavedMaps / deleteMapSlot ─────────────────────────────

describe('saveMapToSlot / loadSavedMaps / deleteMapSlot', () => {
  it('loadSavedMaps returns empty array when nothing saved', () => {
    expect(loadSavedMaps()).toEqual([])
  })

  it('saves a map and retrieves it', () => {
    const entry = saveMapToSlot('My Map', baseState)
    const maps = loadSavedMaps()
    expect(maps).toHaveLength(1)
    expect(maps[0].name).toBe('My Map')
    expect(maps[0].id).toBe(entry.id)
  })

  it('prepends new maps (most recent first)', () => {
    saveMapToSlot('First', baseState)
    saveMapToSlot('Second', baseState)
    const maps = loadSavedMaps()
    expect(maps[0].name).toBe('Second')
    expect(maps[1].name).toBe('First')
  })

  it('updates existing map when same id passed', () => {
    const entry = saveMapToSlot('Original', baseState)
    saveMapToSlot('Updated', baseState, entry.id)
    const maps = loadSavedMaps()
    expect(maps).toHaveLength(1)
    expect(maps[0].name).toBe('Updated')
    expect(maps[0].id).toBe(entry.id)
  })

  it('deleteMapSlot removes the correct map', () => {
    const a = saveMapToSlot('A', baseState)
    const b = saveMapToSlot('B', baseState)
    deleteMapSlot(a.id)
    const maps = loadSavedMaps()
    expect(maps).toHaveLength(1)
    expect(maps[0].id).toBe(b.id)
  })

  it('deleteMapSlot is a no-op for unknown id', () => {
    saveMapToSlot('X', baseState)
    deleteMapSlot('does-not-exist')
    expect(loadSavedMaps()).toHaveLength(1)
  })
})

// ── loadCurrentMapMeta / saveCurrentMapMeta ───────────────────────────────────

describe('loadCurrentMapMeta / saveCurrentMapMeta', () => {
  it('returns undefined when nothing stored', () => {
    expect(loadCurrentMapMeta()).toBeUndefined()
  })

  it('round-trips meta', () => {
    saveCurrentMapMeta({ id: 'abc', name: 'Test Map' })
    expect(loadCurrentMapMeta()).toEqual({ id: 'abc', name: 'Test Map' })
  })

  it('clears meta when undefined passed', () => {
    saveCurrentMapMeta({ id: 'abc', name: 'Test Map' })
    saveCurrentMapMeta(undefined)
    expect(loadCurrentMapMeta()).toBeUndefined()
  })
})
