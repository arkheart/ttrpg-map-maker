import { PropertiesPanel } from './PropertiesPanel'
import type { SelectedElement } from '@/types/map'

interface Props {
  selected: SelectedElement | null
}

export function Sidebar({ selected }: Props) {
  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      background: '#252525',
      borderLeft: '1px solid #333',
      padding: '16px 12px',
      overflowY: 'auto',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
        Properties
      </div>

      {selected ? (
        <PropertiesPanel selected={selected} />
      ) : (
        <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
          <p>Select an element on the canvas to edit its properties.</p>
          <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '12px 0' }} />
          <p><strong style={{ color: '#777' }}>Tools</strong></p>
          <p>↖ Select — move elements</p>
          <p>⬜ Room — draw dungeon rooms</p>
          <p>🪨 Cave — draw cave shapes</p>
          <p>🌿 Terrain — draw terrain (pick type in toolbar)</p>
          <p>📌 Item — place map items</p>
          <p>✕ Erase — click to remove</p>
        </div>
      )}
    </div>
  )
}
