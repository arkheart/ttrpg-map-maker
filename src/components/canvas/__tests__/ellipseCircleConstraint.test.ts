import { describe, it, expect } from 'vitest'

// Mirrors the constraint logic in MapCanvas handleMouseMove
function computePreviewRect(
  startX: number, startY: number,
  mouseX: number, mouseY: number,
  altKey: boolean,
) {
  const rawW = Math.abs(mouseX - startX)
  const rawH = Math.abs(mouseY - startY)
  const w = altKey ? Math.min(rawW, rawH) : rawW
  const h = altKey ? Math.min(rawW, rawH) : rawH
  return {
    x: Math.min(startX, startX + (mouseX > startX ? w : -w)),
    y: Math.min(startY, startY + (mouseY > startY ? h : -h)),
    w,
    h,
  }
}

describe('ellipse circle constraint (alt key)', () => {
  it('without alt: w and h follow raw mouse delta', () => {
    const rect = computePreviewRect(0, 0, 80, 40, false)
    expect(rect.w).toBe(80)
    expect(rect.h).toBe(40)
  })

  it('with alt: w and h are both clamped to the smaller dimension', () => {
    const rect = computePreviewRect(0, 0, 80, 40, true)
    expect(rect.w).toBe(40)
    expect(rect.h).toBe(40)
  })

  it('with alt: produces a square bounding box so radiusX === radiusY', () => {
    const rect = computePreviewRect(10, 10, 90, 50, true)
    expect(rect.w).toBe(rect.h)
  })

  it('with alt: uses smaller dimension when height is larger', () => {
    const rect = computePreviewRect(0, 0, 30, 100, true)
    expect(rect.w).toBe(30)
    expect(rect.h).toBe(30)
  })

  it('with alt: uses smaller dimension when width is larger', () => {
    const rect = computePreviewRect(0, 0, 120, 60, true)
    expect(rect.w).toBe(60)
    expect(rect.h).toBe(60)
  })

  it('with alt: equal dimensions stay equal', () => {
    const rect = computePreviewRect(0, 0, 50, 50, true)
    expect(rect.w).toBe(50)
    expect(rect.h).toBe(50)
  })

  it('with alt: x position anchors correctly when dragging right', () => {
    const rect = computePreviewRect(10, 10, 60, 40, true)
    // side = min(50, 30) = 30, dragging right so x = 10
    expect(rect.x).toBe(10)
    expect(rect.y).toBe(10)
  })

  it('with alt: x/y anchor correctly when dragging left and up', () => {
    const rect = computePreviewRect(100, 100, 40, 20, true)
    // rawW=60, rawH=80, min=60, dragging left so x = 100 - 60 = 40
    expect(rect.w).toBe(60)
    expect(rect.h).toBe(60)
    expect(rect.x).toBe(40)
    expect(rect.y).toBe(40)
  })
})
