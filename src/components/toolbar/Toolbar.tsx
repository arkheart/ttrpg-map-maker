import { useMapTool } from '@/hooks/useMapTool'
import { useMapState, useMapDispatch } from '@/store/mapStore'
import type { ToolType, TerrainType, TerrainDrawMode } from '@/types/map'
import { TERRAIN_PALETTE } from '@/types/map'
import { ToolButton } from './ToolButton'

const DRAW_MODES: { mode: TerrainDrawMode; label: string; icon: string }[] = [
  { mode: 'rect',    label: 'Square',  icon: '⬜' },
  { mode: 'ellipse', label: 'Circle',  icon: '⭕' },
  { mode: 'custom',  label: 'Custom',  icon: '✏️' },
]

const TOOLS: { tool: ToolType; label: string; icon: string }[] = [
  { tool: 'select',  label: 'Select',  icon: '↖'  },
  { tool: 'room',    label: 'Room',    icon: '⬜'  },
  { tool: 'cave',    label: 'Cave',    icon: '🪨'  },
  { tool: 'terrain', label: 'Terrain', icon: '🌿'  },
  { tool: 'item',    label: 'Item',    icon: '📌'  },
  { tool: 'erase',   label: 'Erase',   icon: '✕'  },
]

export function Toolbar() {
  const { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode } = useMapTool()
  const dispatch = useMapDispatch()
  const { globalGrid } = useMapState()

  return (
    <div style={{ background: '#252525', borderBottom: '1px solid #333' }}>
      {/* Main tool row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px' }}>
        {TOOLS.map(({ tool, label, icon }) => (
          <ToolButton
            key={tool}
            icon={icon}
            label={label}
            active={activeTool === tool}
            onClick={() => setActiveTool(tool)}
          />
        ))}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
          style={{
            padding: '6px 14px',
            background: '#5a2020',
            color: '#fff',
            border: '1px solid #8a3030',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Clear All
        </button>
      </div>

      {/* Global grid sub-row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px 8px',
        borderTop: '1px solid #333',
      }}>
        <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grid:</span>
        <button
          title={globalGrid.enabled ? 'Disable global grid' : 'Enable global grid'}
          onClick={() => dispatch({ type: 'SET_GLOBAL_GRID', payload: { enabled: !globalGrid.enabled } })}
          style={{
            padding: '4px 10px',
            background: globalGrid.enabled ? '#0066cc' : '#2a2a2a',
            color: '#fff',
            border: `1px solid ${globalGrid.enabled ? '#0088ff' : '#444'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: globalGrid.enabled ? 600 : 400,
          }}
        >
          # {globalGrid.enabled ? 'On' : 'Off'}
        </button>
        {globalGrid.enabled && (
          <>
            <input
              type="number"
              min={4}
              max={256}
              value={globalGrid.size}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 4) dispatch({ type: 'SET_GLOBAL_GRID', payload: { size: v } })
              }}
              title="Grid cell size in pixels"
              style={{
                width: '54px',
                padding: '4px 6px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <span style={{ fontSize: '11px', color: '#666' }}>px</span>
            <div style={{ width: '1px', height: '20px', background: '#444', margin: '0 4px' }} />
            <input
              type="color"
              value={globalGrid.color ?? '#ffffff'}
              onChange={e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { color: e.target.value } })}
              title="Grid color"
              style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'none' }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={globalGrid.opacity ?? 0.15}
              onChange={e => dispatch({ type: 'SET_GLOBAL_GRID', payload: { opacity: parseFloat(e.target.value) } })}
              title="Grid opacity"
              style={{ width: '80px' }}
            />
            <span style={{ fontSize: '11px', color: '#888', minWidth: '28px' }}>
              {Math.round((globalGrid.opacity ?? 0.15) * 100)}%
            </span>
          </>
        )}
      </div>

      {/* Terrain palette sub-row */}
      {activeTool === 'terrain' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px 8px',
          borderTop: '1px solid #333',
          flexWrap: 'wrap',
        }}>
          {/* Draw mode */}
          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shape:</span>
          {DRAW_MODES.map(({ mode, label, icon }) => (
            <button
              key={mode}
              title={label}
              onClick={() => setTerrainDrawMode(mode)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px',
                background: terrainDrawMode === mode ? '#0066cc' : '#2a2a2a',
                color: '#fff',
                border: `1px solid ${terrainDrawMode === mode ? '#0088ff' : '#444'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: terrainDrawMode === mode ? 600 : 400,
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}

          <div style={{ width: '1px', height: '20px', background: '#444', margin: '0 4px' }} />

          {/* Terrain type */}
          <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type:</span>
          {(Object.entries(TERRAIN_PALETTE) as [TerrainType, typeof TERRAIN_PALETTE[TerrainType]][]).map(([key, def]) => (
            <button
              key={key}
              title={def.label}
              onClick={() => setActiveTerrainType(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px',
                background: activeTerrainType === key ? def.fill : '#2a2a2a',
                color: '#fff',
                border: `1px solid ${activeTerrainType === key ? '#00aaff' : '#444'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeTerrainType === key ? 600 : 400,
              }}
            >
              <span>{def.icon}</span>
              <span>{def.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
