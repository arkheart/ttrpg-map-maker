import { useMapState, useMapDispatch } from '@/store/mapStore'
import type { SelectedElement } from '@/types/map'

const TERRAIN_COLORS: { label: string; value: string }[] = [
  { label: 'Grass', value: '#4a7c4e' },
  { label: 'Water', value: '#2b5f8a' },
  { label: 'Stone', value: '#666' },
  { label: 'Sand', value: '#c2a96e' },
  { label: 'Dirt', value: '#8b6340' },
]

const ROOM_COLORS: { label: string; value: string }[] = [
  { label: 'Dark', value: '#3a3a3a' },
  { label: 'Stone', value: '#555' },
  { label: 'Wood', value: '#5c4033' },
  { label: 'Magic', value: '#2d1a4a' },
]

const ITEM_SYMBOLS: { label: string; value: string }[] = [
  { label: 'Door', value: '🚪' },
  { label: 'Chest', value: '📦' },
  { label: 'Trap', value: '⚠' },
  { label: 'Stairs', value: '🔼' },
  { label: 'Torch', value: '🕯' },
  { label: 'Monster', value: '👾' },
  { label: 'NPC', value: '🧙' },
  { label: 'Pillar', value: '🏛' },
]

interface Props {
  selected: SelectedElement
}

export function PropertiesPanel({ selected }: Props) {
  const state = useMapState()
  const dispatch = useMapDispatch()

  const inputStyle = {
    width: '100%',
    padding: '5px 8px',
    background: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    fontSize: '13px',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '11px',
    color: '#aaa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  if (selected.type === 'room') {
    const room = state.rooms.find(r => r.id === selected.id)
    if (!room) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Label</label>
          <input
            style={inputStyle}
            value={room.label ?? ''}
            placeholder="Room name..."
            onChange={e => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, label: e.target.value } })}
          />
        </div>
        <div>
          <label style={labelStyle}>Fill Color</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ROOM_COLORS.map(c => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, fill: c.value } })}
                style={{
                  width: '28px', height: '28px',
                  background: c.value,
                  border: room.fill === c.value ? '2px solid #00aaff' : '2px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            ))}
            <input
              type="color"
              value={room.fill}
              onChange={e => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, fill: e.target.value } })}
              style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (selected.type === 'cave') {
    const cave = state.caves.find(c => c.id === selected.id)
    if (!cave) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Label</label>
          <input
            style={inputStyle}
            value={cave.label ?? ''}
            placeholder="Cave name..."
            onChange={e => dispatch({ type: 'UPDATE_CAVE', payload: { id: cave.id, label: e.target.value } })}
          />
        </div>
      </div>
    )
  }

  if (selected.type === 'terrain') {
    const terrain = state.terrain.find(t => t.id === selected.id)
    if (!terrain) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Terrain Type</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TERRAIN_COLORS.map(c => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, fill: c.value } })}
                style={{
                  padding: '4px 8px',
                  background: c.value,
                  color: '#fff',
                  border: terrain.fill === c.value ? '2px solid #00aaff' : '2px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Label</label>
          <input
            style={inputStyle}
            value={terrain.label ?? ''}
            placeholder="Terrain label..."
            onChange={e => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, label: e.target.value } })}
          />
        </div>
      </div>
    )
  }

  if (selected.type === 'item') {
    const item = state.items.find(i => i.id === selected.id)
    if (!item) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Symbol</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ITEM_SYMBOLS.map(s => (
              <button
                key={s.value}
                title={s.label}
                onClick={() => dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, symbol: s.value } })}
                style={{
                  width: '36px', height: '36px',
                  background: item.symbol === s.value ? '#0066cc' : '#333',
                  border: item.symbol === s.value ? '2px solid #00aaff' : '2px solid #555',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                {s.value}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Label</label>
          <input
            style={inputStyle}
            value={item.label ?? ''}
            placeholder="Item label..."
            onChange={e => dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, label: e.target.value } })}
          />
        </div>
      </div>
    )
  }

  return null
}
