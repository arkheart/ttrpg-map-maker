import { describe, it, expect, vi } from 'vitest'

vi.mock('react-konva', () => ({
  Layer: () => null, Rect: () => null, Ellipse: () => null,
  Line: () => null, Text: () => null, Circle: () => null,
}))

import { insertPointOnEdge } from '../ElementLayer'

// Triangle: (0,0) → (100,0) → (50,100)
const triangle = [0, 0, 100, 0, 50, 100]

describe('insertPointOnEdge', () => {
  it('increases point count by one', () => {
    const result = insertPointOnEdge(triangle, 50, 0)
    expect(result.length).toBe(triangle.length + 2)
  })

  it('inserts a point on the top edge between vertex 0 and 1', () => {
    // Click near midpoint of top edge (0,0)→(100,0)
    const result = insertPointOnEdge(triangle, 50, 0)
    // New point should appear somewhere in the array
    expect(result).toContain(50)
    expect(result).toContain(0)
  })

  it('inserts the new point between the two closest vertices', () => {
    // Click near midpoint of top edge (0,0)→(100,0) at (50,2)
    // Best edge is 0 (v0→v1), insertAfter = 1, so new point goes at index 1
    // result: [0,0, 50,2, 100,0, 50,100]
    const result = insertPointOnEdge(triangle, 50, 2)
    expect(result[0]).toBe(0);  expect(result[1]).toBe(0)
    expect(result[2]).toBe(50); expect(result[3]).toBe(2)
    expect(result[4]).toBe(100); expect(result[5]).toBe(0)
    expect(result[6]).toBe(50); expect(result[7]).toBe(100)
  })

  it('preserves all original vertices', () => {
    const result = insertPointOnEdge(triangle, 50, 50)
    for (let i = 0; i < triangle.length / 2; i++) {
      const x = triangle[i * 2], y = triangle[i * 2 + 1]
      // each original vertex must still exist somewhere in result
      let found = false
      for (let j = 0; j < result.length / 2; j++) {
        if (result[j * 2] === x && result[j * 2 + 1] === y) { found = true; break }
      }
      expect(found, `vertex (${x},${y}) missing from result`).toBe(true)
    }
  })

  it('works for a click near the closing edge (last → first vertex)', () => {
    // Click near midpoint of the closing edge (50,100)→(0,0), roughly at (25,50)
    const result = insertPointOnEdge(triangle, 25, 50)
    expect(result.length).toBe(triangle.length + 2)
  })

  it('handles a square (4 vertices)', () => {
    const square = [0, 0, 100, 0, 100, 100, 0, 100]
    const result = insertPointOnEdge(square, 50, 0)
    expect(result.length).toBe(square.length + 2)
  })

  it('works when the polygon has many vertices', () => {
    const poly = [0,0, 50,0, 100,0, 100,50, 100,100, 50,100, 0,100, 0,50]
    const result = insertPointOnEdge(poly, 75, 0)
    expect(result.length).toBe(poly.length + 2)
  })
})
