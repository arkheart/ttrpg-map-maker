import { useMapState, useMapDispatch } from '@/store/mapStore'
import type { SelectedElement, TerrainType, GridSettings } from '@/types/map'
import { TERRAIN_PALETTE } from '@/types/map'

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

const DEFAULT_GRID: GridSettings = { enabled: true, size: 32, color: '#ffffff', opacity: 0.2 }

interface GridSectionProps {
  grid: GridSettings | undefined
  onChange: (g: GridSettings | undefined) => void
  labelStyle: React.CSSProperties
  inputStyle: React.CSSProperties
}

function GridSection({ grid, onChange, labelStyle, inputStyle }: GridSectionProps) {
  const enabled = grid?.enabled ?? false
  return (
    <div>
      <label style={labelStyle}>Grid</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: enabled ? '8px' : 0 }}>
        <button
          onClick={() => onChange(enabled ? { ...(grid ?? DEFAULT_GRID), enabled: false } : { ...(grid ?? DEFAULT_GRID), enabled: true })}
          style={{
            padding: '4px 12px',
            background: enabled ? '#0066cc' : '#2a2a2a',
            color: '#fff',
            border: `1px solid ${enabled ? '#0088ff' : '#555'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>
      {enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0, width: '60px' }}>Size</label>
            <input
              type="number"
              min={4}
              max={256}
              value={grid?.size ?? 32}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 4) onChange({ ...(grid ?? DEFAULT_GRID), size: v })
              }}
              style={{ ...inputStyle, width: '70px' }}
            />
            <span style={{ fontSize: '11px', color: '#666' }}>px</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0, width: '60px' }}>Color</label>
            <input
              type="color"
              value={grid?.color ?? '#ffffff'}
              onChange={e => onChange({ ...(grid ?? DEFAULT_GRID), color: e.target.value })}
              style={{ width: '36px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0, width: '60px' }}>Opacity</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={grid?.opacity ?? 0.2}
              onChange={e => onChange({ ...(grid ?? DEFAULT_GRID), opacity: parseFloat(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '11px', color: '#888', width: '28px', textAlign: 'right' }}>
              {Math.round((grid?.opacity ?? 0.2) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

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
        <GridSection
          grid={room.grid}
          onChange={g => dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, grid: g } })}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />
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
        <GridSection
          grid={cave.grid}
          onChange={g => dispatch({ type: 'UPDATE_CAVE', payload: { id: cave.id, grid: g } })}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(Object.entries(TERRAIN_PALETTE) as [TerrainType, typeof TERRAIN_PALETTE[TerrainType]][]).map(([key, def]) => (
              <button
                key={key}
                onClick={() => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, terrainType: key } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 8px',
                  background: terrain.terrainType === key ? def.fill : '#2a2a2a',
                  color: '#fff',
                  border: `1px solid ${terrain.terrainType === key ? '#00aaff' : '#444'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                }}
              >
                <span>{def.icon}</span>
                <span>{def.label}</span>
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
        <GridSection
          grid={terrain.grid}
          onChange={g => dispatch({ type: 'UPDATE_TERRAIN', payload: { id: terrain.id, grid: g ?? undefined } })}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />
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
