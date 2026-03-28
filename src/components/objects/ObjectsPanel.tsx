import { useMapState, useMapDispatch } from '@/store/mapStore'
import { TERRAIN_PALETTE } from '@/types/map'
import type { SelectedElement } from '@/types/map'

interface Props {
  selected: SelectedElement | null
  onSelect: (el: SelectedElement) => void
  onClose: () => void
}

const ITEM_SYMBOLS: Record<string, string> = {
  door: '🚪', chest: '📦', trap: '⚠', stairs: '🔼', torch: '🕯', monster: '👾', npc: '🧑', pillar: '⬛',
}

function getEntryInfo(id: string, state: ReturnType<typeof useMapState>): {
  type: SelectedElement['type']
  label: string
  icon: string
} | null {
  const room = state.rooms.find(r => r.id === id)
  if (room) {
    const label = room.label || (room.shape === 'ellipse' ? 'Ellipse Room' : room.shape === 'custom' ? 'Custom Room' : 'Room')
    const icon = room.shape === 'ellipse' ? '⭕' : room.shape === 'custom' ? '✏️' : '⬜'
    return { type: 'room', label, icon }
  }
  const cave = state.caves.find(c => c.id === id)
  if (cave) return { type: 'cave', label: cave.label || 'Cave', icon: '🪨' }

  const terrain = state.terrain.find(t => t.id === id)
  if (terrain) {
    const def = TERRAIN_PALETTE[terrain.terrainType]
    return { type: 'terrain', label: terrain.label || def.label, icon: def.icon }
  }
  const item = state.items.find(i => i.id === id)
  if (item) return { type: 'item', label: item.label || ITEM_SYMBOLS[item.symbol] || item.symbol || 'Item', icon: ITEM_SYMBOLS[item.symbol] ?? item.symbol ?? '📌' }

  return null
}

export function ObjectsPanel({ selected, onSelect, onClose }: Props) {
  const state = useMapState()
  const dispatch = useMapDispatch()
  const { layerOrder } = state

  // Display reversed: top of list = topmost layer (last in layerOrder)
  const reversed = [...layerOrder].reverse()

  function reorder(id: string, direction: 'up' | 'down') {
    dispatch({ type: 'REORDER_ELEMENT', payload: { id, direction } })
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0,
      width: '220px',
      background: '#1e1e1e',
      borderRight: '1px solid #333',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #333', flexShrink: 0 }}>
        <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>Objects</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
          title="Close"
        >✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
        {reversed.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#444', textAlign: 'center', marginTop: '32px' }}>No objects yet.</div>
        ) : reversed.map((id, revIdx) => {
          const info = getEntryInfo(id, state)
          if (!info) return null
          const isSelected = selected?.id === id
          const origIdx = layerOrder.length - 1 - revIdx
          const isTop = origIdx === layerOrder.length - 1
          const isBottom = origIdx === 0

          return (
            <div
              key={id}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 4px 4px 10px',
                background: isSelected ? '#0a2a4a' : 'transparent',
                borderLeft: isSelected ? '2px solid #0066cc' : '2px solid transparent',
                borderRadius: '3px',
                marginBottom: '1px',
              }}
            >
              <span style={{ fontSize: '13px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{info.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  onClick={() => onSelect({ type: info.type, id })}
                  title={info.label}
                  style={{
                    fontSize: '12px', color: isSelected ? '#aef' : '#ccc',
                    cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {info.label}
                </div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>{info.type}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                <button
                  title="Move up (render on top)"
                  onClick={() => reorder(id, 'up')}
                  disabled={isTop}
                  style={{
                    background: 'none', border: 'none',
                    color: isTop ? '#2a2a2a' : '#666',
                    cursor: isTop ? 'default' : 'pointer',
                    fontSize: '9px', padding: '0 3px', lineHeight: 1,
                  }}
                >▲</button>
                <button
                  title="Move down (render below)"
                  onClick={() => reorder(id, 'down')}
                  disabled={isBottom}
                  style={{
                    background: 'none', border: 'none',
                    color: isBottom ? '#2a2a2a' : '#666',
                    cursor: isBottom ? 'default' : 'pointer',
                    fontSize: '9px', padding: '0 3px', lineHeight: 1,
                  }}
                >▼</button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '8px 10px', borderTop: '1px solid #2a2a2a', fontSize: '10px', color: '#444' }}>
        top of list = drawn on top · ▲▼ to reorder
      </div>
    </div>
  )
}
