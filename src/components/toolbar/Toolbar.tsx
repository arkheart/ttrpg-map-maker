import { useMapTool } from '@/hooks/useMapTool'
import { useMapState, useMapDispatch } from '@/store/mapStore'
import type { ToolType, TerrainType, TerrainDrawMode, RoomDrawMode } from '@/types/map'
import { TERRAIN_PALETTE } from '@/types/map'
import { ToolButton } from './ToolButton'

const SHAPE_MODES: { mode: string; label: string; icon: string }[] = [
  { mode: 'rect',    label: 'Square', icon: '⬜' },
  { mode: 'ellipse', label: 'Circle', icon: '⭕' },
  { mode: 'custom',  label: 'Custom', icon: '✏️' },
]

const TOOLS: { tool: ToolType; label: string; icon: string }[] = [
  { tool: 'select',  label: 'Select',  icon: '↖'  },
  { tool: 'room',    label: 'Room',    icon: '⬜'  },
  { tool: 'cave',    label: 'Cave',    icon: '🪨'  },
  { tool: 'terrain', label: 'Terrain', icon: '🌿'  },
  { tool: 'item',    label: 'Item',    icon: '📌'  },
  { tool: 'erase',   label: 'Erase',   icon: '✕'  },
]

const subRowBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0 12px',
  height: '34px',
  borderTop: '1px solid #2e2e2e',
  background: '#1e1e1e',
  flexShrink: 0,
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginRight: '2px',
}

const divider = <div style={{ width: '1px', height: '18px', background: '#333', margin: '0 2px' }} />

function ModeBtn({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '3px 9px',
        background: active ? '#0066cc' : '#2a2a2a',
        color: '#fff',
        border: `1px solid ${active ? '#0088ff' : '#3a3a3a'}`,
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
      }}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  )
}

export function Toolbar() {
  const { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode, roomDrawMode, setRoomDrawMode } = useMapTool()
  const dispatch = useMapDispatch()
  const { globalGrid } = useMapState()

  return (
    <div style={{ background: '#252525', borderBottom: '1px solid #333', flexShrink: 0 }}>

      {/* ── Main bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>

        {/* Tools */}
        {TOOLS.map(({ tool, label, icon }) => (
          <ToolButton key={tool} icon={icon} label={label} active={activeTool === tool} onClick={() => setActiveTool(tool)} />
        ))}

        <div style={{ width: '1px', height: '24px', background: '#444', margin: '0 6px' }} />

        {/* Grid toggle */}
        <span style={{ fontSize: '11px', color: '#777' }}>Grid</span>
        <button
          title={globalGrid.enabled ? 'Disable grid' : 'Enable grid'}
          onClick={() => dispatch({ type: 'SET_GLOBAL_GRID', payload: { enabled: !globalGrid.enabled } })}
          style={{
            padding: '3px 9px',
            background: globalGrid.enabled ? '#0066cc' : '#2a2a2a',
            color: '#fff',
            border: `1px solid ${globalGrid.enabled ? '#0088ff' : '#444'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: globalGrid.enabled ? 600 : 400,
          }}
        >
          {globalGrid.enabled ? 'On' : 'Off'}
        </button>

        {globalGrid.enabled && (
          <>
            <input
              type="number" min={4} max={256} value={globalGrid.size}
              onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 4) dispatch({ type: 'SET_GLOBAL_GRID', payload: { size: v } }) }}
              title="Grid size (px)"
              style={{ width: '48px', padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', fontSize: '12px' }}
            />
            <span style={{ fontSize: '11px', color: '#555' }}>px</span>
            <input
              type="color" value={globalGrid.color ?? '#ffffff'}
              onChange={e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { color: e.target.value } })}
              title="Grid color"
              style={{ width: '24px', height: '24px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '3px', background: 'none' }}
            />
            <input
              type="range" min={0} max={1} step={0.05} value={globalGrid.opacity ?? 0.15}
              onChange={e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { opacity: parseFloat(e.target.value) } })}
              title="Grid opacity"
              style={{ width: '70px' }}
            />
            <span style={{ fontSize: '11px', color: '#777', minWidth: '26px' }}>
              {Math.round((globalGrid.opacity ?? 0.15) * 100)}%
            </span>
          </>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
          style={{ padding: '5px 12px', background: '#5a2020', color: '#fff', border: '1px solid #8a3030', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Clear All
        </button>
      </div>

      {/* ── Secondary bar (always present, fixed height) ── */}
      <div style={subRowBase}>
        {activeTool === 'room' && (
          <>
            <span style={labelStyle}>Shape</span>
            {SHAPE_MODES.map(({ mode, label, icon }) => (
              <ModeBtn key={mode} label={label} icon={icon} active={roomDrawMode === mode} onClick={() => setRoomDrawMode(mode as RoomDrawMode)} />
            ))}
          </>
        )}

        {activeTool === 'terrain' && (
          <>
            <span style={labelStyle}>Shape</span>
            {SHAPE_MODES.map(({ mode, label, icon }) => (
              <ModeBtn key={mode} label={label} icon={icon} active={terrainDrawMode === mode} onClick={() => setTerrainDrawMode(mode as TerrainDrawMode)} />
            ))}
            {divider}
            <span style={labelStyle}>Type</span>
            {(Object.entries(TERRAIN_PALETTE) as [TerrainType, typeof TERRAIN_PALETTE[TerrainType]][]).map(([key, def]) => (
              <button
                key={key}
                title={def.label}
                onClick={() => setActiveTerrainType(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 9px',
                  background: activeTerrainType === key ? def.fill : '#2a2a2a',
                  color: '#fff',
                  border: `1px solid ${activeTerrainType === key ? '#00aaff' : '#3a3a3a'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: activeTerrainType === key ? 600 : 400,
                }}
              >
                <span>{def.icon}</span><span>{def.label}</span>
              </button>
            ))}
          </>
        )}
      </div>

    </div>
  )
}
