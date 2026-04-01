import type { MapState, MapRoom, MapCave, MapTerrain, TerrainType } from '@/types/map'

export type GenerationStyle = 'dungeon' | 'cavern' | 'mixed'

export interface GenerateParams {
  mapWidth: number
  mapHeight: number
  roomCount: number
  style: GenerationStyle
  seed: number
  addGrid: boolean
}

// Mulberry32 seeded PRNG — returns values in [0, 1)
function seededRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s += 0x6D2B79F5
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Room { x: number; y: number; w: number; h: number }

// --- Room placement ---

function roomsOverlap(a: Room, b: Room, margin: number): boolean {
  return (
    a.x - margin < b.x + b.w &&
    a.x + a.w + margin > b.x &&
    a.y - margin < b.y + b.h &&
    a.y + a.h + margin > b.y
  )
}

function placeRooms(
  count: number,
  mapW: number,
  mapH: number,
  rng: () => number,
  margin = 20,
): Room[] {
  const minW = 80, maxW = 200
  const minH = 60, maxH = 160
  const placed: Room[] = []
  const attempts = count * 40

  for (let i = 0; i < attempts && placed.length < count; i++) {
    const w = minW + Math.floor(rng() * (maxW - minW + 1))
    const h = minH + Math.floor(rng() * (maxH - minH + 1))
    const x = 50 + Math.floor(rng() * Math.max(1, mapW - w - 50))
    const y = 50 + Math.floor(rng() * Math.max(1, mapH - h - 50))
    const candidate = { x, y, w, h }
    if (!placed.some(p => roomsOverlap(p, candidate, margin))) {
      placed.push(candidate)
    }
  }

  return placed
}

// --- Minimum spanning tree (Prim's) by center distance ---

function centerOf(r: Room): [number, number] {
  return [r.x + r.w / 2, r.y + r.h / 2]
}

function dist2(a: Room, b: Room): number {
  const [ax, ay] = centerOf(a)
  const [bx, by] = centerOf(b)
  return (ax - bx) ** 2 + (ay - by) ** 2
}

function buildMst(rooms: Room[]): [number, number][] {
  if (rooms.length < 2) return []
  const inTree = new Set<number>([0])
  const edges: [number, number][] = []

  while (inTree.size < rooms.length) {
    let bestDist = Infinity
    let bestA = -1, bestB = -1
    for (const a of inTree) {
      for (let b = 0; b < rooms.length; b++) {
        if (inTree.has(b)) continue
        const d = dist2(rooms[a], rooms[b])
        if (d < bestDist) { bestDist = d; bestA = a; bestB = b }
      }
    }
    if (bestB === -1) break
    edges.push([bestA, bestB])
    inTree.add(bestB)
  }

  return edges
}

// --- Corridor generation: wall-to-wall, bend outside both rooms ---

// For two rooms, find the best pair of facing walls and a safe bend point.
// Returns up to 2 rect segments forming an L-shaped corridor.
function wallCorridor(a: Room, b: Room, cw: number, rng: () => number): Room[] {
  const hw = Math.floor(cw / 2)
  const [ax, ay] = centerOf(a)
  const [bx, by] = centerOf(b)

  // Determine relative position to pick corridor orientation
  const dx = bx - ax
  const dy = by - ay
  const segs: Room[] = []

  // Prefer axis with larger separation — with some randomness
  const useHFirst = Math.abs(dx) > Math.abs(dy) ? rng() < 0.7 : rng() < 0.3

  if (useHFirst) {
    // Horizontal segment exits a's left or right wall, vertical segment enters b's top or bottom
    const aWallX = dx > 0 ? a.x + a.w : a.x
    const bWallY = dy > 0 ? b.y        : b.y + b.h
    // Bend X is the center of b, clamped so corridor exits a's wall
    const bendX = bx
    // Horizontal: from a's wall to bend x, at a's center y
    const hx1 = Math.min(aWallX, bendX) - hw
    const hx2 = Math.max(aWallX, bendX) + hw
    if (hx2 - hx1 > 0) segs.push({ x: hx1, y: ay - hw, w: hx2 - hx1, h: cw })
    // Vertical: from bend y (a's center y) to b's wall
    const vy1 = Math.min(ay, bWallY) - hw
    const vy2 = Math.max(ay, bWallY) + hw
    if (vy2 - vy1 > 0) segs.push({ x: bx - hw, y: vy1, w: cw, h: vy2 - vy1 })
  } else {
    // Vertical exits a's top or bottom, horizontal enters b's left or right
    const aWallY = dy > 0 ? a.y + a.h : a.y
    const bWallX = dx > 0 ? b.x        : b.x + b.w
    const bendY = by
    // Vertical: from a's wall to bend y, at a's center x
    const vy1 = Math.min(aWallY, bendY) - hw
    const vy2 = Math.max(aWallY, bendY) + hw
    if (vy2 - vy1 > 0) segs.push({ x: ax - hw, y: vy1, w: cw, h: vy2 - vy1 })
    // Horizontal: from bend x (a's center x) to b's wall
    const hx1 = Math.min(ax, bWallX) - hw
    const hx2 = Math.max(ax, bWallX) + hw
    if (hx2 - hx1 > 0) segs.push({ x: hx1, y: by - hw, w: hx2 - hx1, h: cw })
  }

  return segs
}

// Perturb a room rect into an organic cave-like polygon
// Returns a flat [x0, y0, x1, y1, ...] array for Konva Line
function organicPoly(room: Room, rng: () => number, jitter = 0.14): number[] {
  const { x, y, w, h } = room
  const segs = 3
  const pts: number[] = []
  const jx = w * jitter
  const jy = h * jitter

  // Top edge (left → right)
  for (let i = 0; i <= segs; i++) {
    pts.push(x + (i / segs) * w + (rng() - 0.5) * jx)
    pts.push(y + (rng() - 0.5) * jy)
  }
  // Right edge (top → bottom)
  for (let i = 1; i <= segs; i++) {
    pts.push(x + w + (rng() - 0.5) * jx)
    pts.push(y + (i / segs) * h + (rng() - 0.5) * jy)
  }
  // Bottom edge (right → left)
  for (let i = segs - 1; i >= 0; i--) {
    pts.push(x + (i / segs) * w + (rng() - 0.5) * jx)
    pts.push(y + h + (rng() - 0.5) * jy)
  }
  // Left edge (bottom → top)
  for (let i = segs - 1; i >= 1; i--) {
    pts.push(x + (rng() - 0.5) * jx)
    pts.push(y + (i / segs) * h + (rng() - 0.5) * jy)
  }

  return pts
}

const DUNGEON_ROOM_FILLS = ['#3a3028', '#2e2a24', '#352e28', '#3d3530', '#2a2622']
const DUNGEON_CORR_FILL  = '#1e1c18'
const CAVERN_ROOM_FILLS  = ['#2a2a28', '#222220', '#1e1e1c', '#282826', '#242422']
const CAVERN_CORR_FILL   = '#1a1a18'

export function generateMap(params: GenerateParams): MapState {
  const { mapWidth, mapHeight, roomCount, style, seed, addGrid } = params
  const rng = seededRng(seed)

  const placedRooms = placeRooms(roomCount, mapWidth, mapHeight, rng)
  const mstEdges = buildMst(placedRooms)

  const rooms: MapRoom[]      = []
  const caves: MapCave[]      = []
  const terrain: MapTerrain[] = []
  const layerOrder: string[]  = []

  const CW = 22

  const gridSettings = addGrid
    ? { enabled: true, size: 32, color: '#ffffff' as const, opacity: 0.1 }
    : undefined

  function pick(fills: string[]): string {
    return fills[Math.floor(rng() * fills.length)]
  }

  function uuid(): string { return crypto.randomUUID() }

  if (style === 'dungeon') {
    // Corridors first so they render beneath rooms
    for (const [ai, bi] of mstEdges) {
      for (const seg of wallCorridor(placedRooms[ai], placedRooms[bi], CW, rng)) {
        const id = uuid()
        rooms.push({ id, shape: 'rect', x: seg.x, y: seg.y, width: seg.w, height: seg.h, fill: DUNGEON_CORR_FILL })
        layerOrder.push(id)
      }
    }
    for (const r of placedRooms) {
      const id = uuid()
      rooms.push({
        id, shape: 'rect',
        x: r.x, y: r.y, width: r.w, height: r.h,
        fill: pick(DUNGEON_ROOM_FILLS),
        ...(gridSettings ? { grid: gridSettings } : {}),
      })
      layerOrder.push(id)
    }

  } else if (style === 'cavern') {
    for (const [ai, bi] of mstEdges) {
      for (const seg of wallCorridor(placedRooms[ai], placedRooms[bi], CW + 6, rng)) {
        const id = uuid()
        caves.push({ id, points: organicPoly(seg, rng, 0.08), fill: CAVERN_CORR_FILL })
        layerOrder.push(id)
      }
    }
    for (const r of placedRooms) {
      const id = uuid()
      caves.push({ id, points: organicPoly(r, rng, 0.18), fill: pick(CAVERN_ROOM_FILLS) })
      layerOrder.push(id)
    }

  } else {
    // mixed — rect rooms with terrain patches inside some rooms
    for (const [ai, bi] of mstEdges) {
      for (const seg of wallCorridor(placedRooms[ai], placedRooms[bi], CW, rng)) {
        const id = uuid()
        rooms.push({ id, shape: 'rect', x: seg.x, y: seg.y, width: seg.w, height: seg.h, fill: DUNGEON_CORR_FILL })
        layerOrder.push(id)
      }
    }
    for (const r of placedRooms) {
      const id = uuid()
      rooms.push({
        id, shape: 'rect',
        x: r.x, y: r.y, width: r.w, height: r.h,
        fill: pick(DUNGEON_ROOM_FILLS),
        ...(gridSettings ? { grid: gridSettings } : {}),
      })
      layerOrder.push(id)
    }

    // Scatter water / rough patches inside a subset of rooms
    const PATCH_TYPES: TerrainType[] = ['water', 'rough']
    for (const r of placedRooms) {
      if (rng() > 0.4) continue
      const type = PATCH_TYPES[Math.floor(rng() * PATCH_TYPES.length)]
      const pw = Math.floor(r.w * (0.3 + rng() * 0.35))
      const ph = Math.floor(r.h * (0.3 + rng() * 0.35))
      const px = r.x + Math.floor(rng() * Math.max(1, r.w - pw))
      const py = r.y + Math.floor(rng() * Math.max(1, r.h - ph))
      const id = uuid()
      terrain.push({ id, shape: 'rect', x: px, y: py, width: pw, height: ph, terrainType: type })
      layerOrder.push(id)
    }
  }

  return {
    rooms,
    caves,
    terrain,
    items: [],
    globalGrid: { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 },
    layerOrder,
  }
}
