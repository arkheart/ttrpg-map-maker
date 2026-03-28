import { useState, useRef, useEffect } from 'react'
import { useMapTool } from '@/hooks/useMapTool'
import { useMapState, useMapDispatch } from '@/store/mapStore'
import type { ToolType, TerrainType, TerrainDrawMode, RoomDrawMode, CaveDrawMode } from '@/types/map'
import { TERRAIN_PALETTE } from '@/types/map'
import { ToolButton } from './ToolButton'

const SHAPE_MODES: { mode: string; label: string; icon: string }[] = [
  { mode: 'rect',    label: 'Square', icon: '⬜' },
  { mode: 'ellipse', label: 'Circle', icon: '⭕' },
  { mode: 'custom',  label: 'Custom', icon: '✏️' },
]

const CAVE_MODES: { mode: CaveDrawMode; label: string; icon: string }[] = [
  { mode: 'polygon', label: 'Polygon', icon: '✏️' },
  { mode: 'paint',   label: 'Paint',   icon: '🖌️' },
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

interface ToolbarProps {
  onExportPng?: () => void
  onSaveMap?: (name: string) => void
  onNewMap?: () => void
  onOpenMaps?: () => void
  currentMapName?: string
  currentMapId?: string
}

export function Toolbar({ onExportPng, onSaveMap, onNewMap, onOpenMaps, currentMapName, currentMapId }: ToolbarProps) {
  const { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode, roomDrawMode, setRoomDrawMode, caveDrawMode, setCaveDrawMode } = useMapTool()
  const dispatch = useMapDispatch()
  const { globalGrid } = useMapState()
  const [showFirstSaveDialog, setShowFirstSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [renamingInline, setRenamingInline] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const saveInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showFirstSaveDialog) {
      setSaveName(currentMapName ?? 'Untitled Map')
      setTimeout(() => saveInputRef.current?.select(), 0)
    }
  }, [showFirstSaveDialog, currentMapName])

  useEffect(() => {
    if (renamingInline) {
      setRenameValue(currentMapName ?? 'Untitled Map')
      setTimeout(() => renameInputRef.current?.select(), 0)
    }
  }, [renamingInline, currentMapName])

  function handleSaveClick() {
    if (currentMapId) {
      // Already saved — just overwrite
      onSaveMap?.(currentMapName ?? 'Untitled Map')
    } else {
      // New map — prompt for a name first
      setShowFirstSaveDialog(true)
    }
  }

  function handleFirstSaveSubmit() {
    const name = saveName.trim() || 'Untitled Map'
    onSaveMap?.(name)
    setShowFirstSaveDialog(false)
  }

  function handleRenameSubmit() {
    const name = renameValue.trim() || 'Untitled Map'
    onSaveMap?.(name)
    setRenamingInline(false)
  }

  return (
    <div style={{ background: '#252525', borderBottom: '1px solid #333', flexShrink: 0, position: 'relative' }}>

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

        {/* Current map name — click to rename */}
        {renamingInline ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenamingInline(false) }}
            onBlur={handleRenameSubmit}
            style={{ padding: '3px 6px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', fontSize: '12px', width: '120px' }}
          />
        ) : (
          <span
            title="Click to rename"
            onClick={() => setRenamingInline(true)}
            style={{ fontSize: '12px', color: '#888', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'text', borderBottom: '1px dashed #444', paddingBottom: '1px' }}
          >
            {currentMapName}
          </span>
        )}

        <div style={{ width: '1px', height: '20px', background: '#444', margin: '0 4px' }} />

        <button
          onClick={handleSaveClick}
          title={currentMapId ? `Save "${currentMapName}"` : 'Save map (choose a name)'}
          style={{ padding: '5px 12px', background: '#1a3040', color: '#7ac', border: '1px solid #2a5070', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Save Map
        </button>

        <button
          onClick={onOpenMaps}
          style={{ padding: '5px 12px', background: '#2a2a2a', color: '#aaa', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Maps
        </button>

        <button
          onClick={onNewMap}
          style={{ padding: '5px 12px', background: '#2a2a1a', color: '#cc9', border: '1px solid #554', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          New Map
        </button>

        <div style={{ width: '1px', height: '20px', background: '#444', margin: '0 4px' }} />

        <button
          onClick={onExportPng}
          style={{ padding: '5px 12px', background: '#1a3a1a', color: '#8fbc8f', border: '1px solid #3a6a3a', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Save PNG
        </button>

        <button
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
          style={{ padding: '5px 12px', background: '#5a2020', color: '#fff', border: '1px solid #8a3030', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
        >
          Clear All
        </button>
      </div>

      {/* First-save dialog (new unsaved map) */}
      {showFirstSaveDialog && (
        <div style={{
          position: 'absolute', top: '44px', right: '8px', zIndex: 200,
          background: '#252525', border: '1px solid #444', borderRadius: '6px',
          padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', width: '220px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize: '12px', color: '#aaa' }}>Name this map:</span>
          <input
            ref={saveInputRef}
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleFirstSaveSubmit(); if (e.key === 'Escape') setShowFirstSaveDialog(false) }}
            style={{ padding: '5px 8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', fontSize: '13px' }}
            placeholder="Map name"
          />
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowFirstSaveDialog(false)}
              style={{ padding: '4px 10px', background: '#2a2a2a', color: '#888', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleFirstSaveSubmit}
              style={{ padding: '4px 10px', background: '#1a3040', color: '#7ac', border: '1px solid #2a5070', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* ── Secondary bar (always present, fixed height) ── */}
      <div style={subRowBase}>
        {activeTool === 'cave' && (
          <>
            <span style={labelStyle}>Mode</span>
            {CAVE_MODES.map(({ mode, label, icon }) => (
              <ModeBtn key={mode} label={label} icon={icon} active={caveDrawMode === mode} onClick={() => setCaveDrawMode(mode)} />
            ))}
          </>
        )}

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
