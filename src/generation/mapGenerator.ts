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

interface BspRect { x: number; y: number; w: number; h: number }
interface Room    { x: number; y: number; w: number; h: number }

interface BspNode {
  rect: BspRect
  left?: BspNode
  right?: BspNode
  room?: Room
}

const MIN_NODE = 120 // minimum node side length before refusing to split

function splitNode(node: BspNode, depth: number, maxDepth: number, rng: () => number): void {
  const { rect: r } = node
  const canH = r.h >= MIN_NODE * 2
  const canV = r.w >= MIN_NODE * 2

  if (depth >= maxDepth || (!canH && !canV)) {
    // Leaf — carve a room inside this node with padding
    const pad = Math.min(15, Math.min(r.w, r.h) * 0.12)
    const iw = Math.max(40, r.w - pad * 2)
    const ih = Math.max(40, r.h - pad * 2)
    const minRW = Math.min(60, iw)
    const minRH = Math.min(60, ih)
    const rw = minRW + Math.floor(rng() * Math.max(1, iw - minRW + 1))
    const rh = minRH + Math.floor(rng() * Math.max(1, ih - minRH + 1))
    node.room = {
      x: r.x + pad + Math.floor(rng() * Math.max(1, iw - rw + 1)),
      y: r.y + pad + Math.floor(rng() * Math.max(1, ih - rh + 1)),
      w: rw,
      h: rh,
    }
    return
  }

  // Prefer splitting the longer axis, with some randomness
  let splitH: boolean
  if (!canH)       splitH = false
  else if (!canV)  splitH = true
  else             splitH = r.h > r.w ? rng() < 0.65 : rng() < 0.35

  if (splitH) {
    const at = MIN_NODE + Math.floor(rng() * (r.h - MIN_NODE * 2 + 1))
    node.left  = { rect: { x: r.x, y: r.y,      w: r.w, h: at } }
    node.right = { rect: { x: r.x, y: r.y + at, w: r.w, h: r.h - at } }
  } else {
    const at = MIN_NODE + Math.floor(rng() * (r.w - MIN_NODE * 2 + 1))
    node.left  = { rect: { x: r.x,      y: r.y, w: at,      h: r.h } }
    node.right = { rect: { x: r.x + at, y: r.y, w: r.w - at, h: r.h } }
  }

  splitNode(node.left,  depth + 1, maxDepth, rng)
  splitNode(node.right, depth + 1, maxDepth, rng)
}

function getLeaves(node: BspNode): BspNode[] {
  if (!node.left && !node.right) return [node]
  return [
    ...(node.left  ? getLeaves(node.left)  : []),
    ...(node.right ? getLeaves(node.right) : []),
  ]
}

// Connect the rightmost leaf of the left subtree to the leftmost leaf of the right subtree.
// This produces exactly one corridor per BSP split, connecting rooms that are spatially adjacent.
function rightmostLeaf(node: BspNode): BspNode {
  if (!node.right) return node
  return rightmostLeaf(node.right)
}

function leftmostLeaf(node: BspNode): BspNode {
  if (!node.left) return node
  return leftmostLeaf(node.left)
}

// Walk the BSP tree collecting one connection per split
function collectConnections(node: BspNode, out: [Room, Room][]): void {
  if (!node.left || !node.right) return
  const a = rightmostLeaf(node.left).room
  const b = leftmostLeaf(node.right).room
  if (a && b) out.push([a, b])
  collectConnections(node.left, out)
  collectConnections(node.right, out)
}

function center(r: Room): [number, number] {
  return [r.x + r.w / 2, r.y + r.h / 2]
}

// Two-segment L-shaped corridor between room centres — returns up to 2 rects
function lCorridor(a: Room, b: Room, cw: number, rng: () => number): Room[] {
  const [ax, ay] = center(a)
  const [bx, by] = center(b)
  const hw = Math.floor(cw / 2)
  const segs: Room[] = []

  if (rng() < 0.5) {
    // Horizontal then vertical
    const x = Math.min(ax, bx) - hw
    const w = Math.abs(bx - ax) + cw
    if (w > 0) segs.push({ x, y: ay - hw, w, h: cw })
    const y = Math.min(ay, by) - hw
    const h = Math.abs(by - ay) + cw
    if (h > 0) segs.push({ x: bx - hw, y, w: cw, h })
  } else {
    // Vertical then horizontal
    const y = Math.min(ay, by) - hw
    const h = Math.abs(by - ay) + cw
    if (h > 0) segs.push({ x: ax - hw, y, w: cw, h })
    const x = Math.min(ax, bx) - hw
    const w = Math.abs(bx - ax) + cw
    if (w > 0) segs.push({ x, y: by - hw, w, h: cw })
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

const DUNGEON_ROOM_FILLS  = ['#3a3028', '#2e2a24', '#352e28', '#3d3530', '#2a2622']
const DUNGEON_CORR_FILL   = '#1e1c18'
const CAVERN_ROOM_FILLS   = ['#2a2a28', '#222220', '#1e1e1c', '#282826', '#242422']
const CAVERN_CORR_FILL    = '#1a1a18'

export function generateMap(params: GenerateParams): MapState {
  const { mapWidth, mapHeight, roomCount, style, seed, addGrid } = params
  const rng = seededRng(seed)

  // BSP depth: 2^depth ≈ roomCount
  const maxDepth = Math.max(2, Math.round(Math.log2(Math.max(4, roomCount))))

  // Generate slightly offset from origin so the map is visible on load
  const root: BspNode = { rect: { x: 50, y: 50, w: mapWidth, h: mapHeight } }
  splitNode(root, 0, maxDepth, rng)

  const leaves = getLeaves(root)
  const connections: [Room, Room][] = []
  collectConnections(root, connections)

  const rooms: MapRoom[]     = []
  const caves: MapCave[]     = []
  const terrain: MapTerrain[] = []
  const layerOrder: string[] = []

  const CW = 22 // corridor width in pixels

  const gridSettings = addGrid
    ? { enabled: true, size: 32, color: '#ffffff' as const, opacity: 0.1 }
    : undefined

  function pick(fills: string[]): string {
    return fills[Math.floor(rng() * fills.length)]
  }

  function uuid(): string { return crypto.randomUUID() }

  if (style === 'dungeon') {
    // Corridors first so they render beneath rooms
    for (const [a, b] of connections) {
      for (const seg of lCorridor(a, b, CW, rng)) {
        const id = uuid()
        rooms.push({ id, shape: 'rect', x: seg.x, y: seg.y, width: seg.w, height: seg.h, fill: DUNGEON_CORR_FILL })
        layerOrder.push(id)
      }
    }
    for (const leaf of leaves) {
      if (!leaf.room) continue
      const id = uuid()
      const r = leaf.room
      rooms.push({
        id, shape: 'rect',
        x: r.x, y: r.y, width: r.w, height: r.h,
        fill: pick(DUNGEON_ROOM_FILLS),
        ...(gridSettings ? { grid: gridSettings } : {}),
      })
      layerOrder.push(id)
    }

  } else if (style === 'cavern') {
    // Corridor caves first
    for (const [a, b] of connections) {
      for (const seg of lCorridor(a, b, CW + 6, rng)) {
        const id = uuid()
        caves.push({ id, points: organicPoly(seg, rng, 0.08), fill: CAVERN_CORR_FILL })
        layerOrder.push(id)
      }
    }
    // Room caves on top
    for (const leaf of leaves) {
      if (!leaf.room) continue
      const id = uuid()
      caves.push({ id, points: organicPoly(leaf.room, rng, 0.18), fill: pick(CAVERN_ROOM_FILLS) })
      layerOrder.push(id)
    }

  } else {
    // mixed — rect rooms with terrain patches inside some rooms
    for (const [a, b] of connections) {
      for (const seg of lCorridor(a, b, CW, rng)) {
        const id = uuid()
        rooms.push({ id, shape: 'rect', x: seg.x, y: seg.y, width: seg.w, height: seg.h, fill: DUNGEON_CORR_FILL })
        layerOrder.push(id)
      }
    }
    for (const leaf of leaves) {
      if (!leaf.room) continue
      const id = uuid()
      const r = leaf.room
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
    for (const leaf of leaves) {
      if (!leaf.room || rng() > 0.4) continue
      const r = leaf.room
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
