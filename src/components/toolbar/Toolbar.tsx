import { useMapTool } from '@/hooks/useMapTool'
import { useMapDispatch } from '@/store/mapStore'
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
