import type { SavedMapEntry } from '@/store/mapStore'

interface MapsPanelProps {
  maps: SavedMapEntry[]
  currentMapId: string | undefined
  onLoad: (entry: SavedMapEntry) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function MapsPanel({ maps, currentMapId, onLoad, onDelete, onClose }: MapsPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '280px',
        background: '#1e1e1e',
        borderLeft: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #333' }}>
        <span style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>Saved Maps</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
          title="Close"
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {maps.length === 0 ? (
          <div style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '32px' }}>
            No saved maps yet.<br />Use "Save Map" to save the current map.
          </div>
        ) : (
          maps.map(entry => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                marginBottom: '4px',
                background: entry.id === currentMapId ? '#0a2a4a' : '#252525',
                border: `1px solid ${entry.id === currentMapId ? '#0066cc' : '#333'}`,
                borderRadius: '6px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.name}
                </div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
                  {formatDate(entry.savedAt)}
                </div>
                <div style={{ fontSize: '10px', color: '#444', marginTop: '1px' }}>
                  {entry.state.rooms.length}R · {entry.state.caves.length}C · {entry.state.terrain.length}T · {entry.state.items.length}I
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                <button
                  onClick={() => onLoad(entry)}
                  title="Load this map"
                  style={{
                    padding: '3px 8px',
                    background: entry.id === currentMapId ? '#0055aa' : '#2a3a2a',
                    color: '#aef',
                    border: '1px solid #336',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  title="Delete this map"
                  style={{
                    padding: '3px 8px',
                    background: '#2a1515',
                    color: '#c66',
                    border: '1px solid #522',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
