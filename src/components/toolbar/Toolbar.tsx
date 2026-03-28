import { useMapTool } from '@/hooks/useMapTool'
import { useMapDispatch } from '@/store/mapStore'
import type { ToolType } from '@/types/map'
import { ToolButton } from './ToolButton'

const TOOLS: { tool: ToolType; label: string; icon: string }[] = [
  { tool: 'select', label: 'Select', icon: '↖' },
  { tool: 'room', label: 'Room', icon: '⬜' },
  { tool: 'cave', label: 'Cave', icon: '🪨' },
  { tool: 'terrain', label: 'Terrain', icon: '🌿' },
  { tool: 'item', label: 'Item', icon: '📌' },
  { tool: 'erase', label: 'Erase', icon: '✕' },
]

export function Toolbar() {
  const { activeTool, setActiveTool } = useMapTool()
  const dispatch = useMapDispatch()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '8px 12px',
      background: '#252525',
      borderBottom: '1px solid #333',
    }}>
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
  )
}
