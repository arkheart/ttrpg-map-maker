import type { CSSProperties } from 'react'

interface HelpModalProps {
  onClose: () => void
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const panel: CSSProperties = {
  background: '#1e1e1e',
  border: '1px solid #3a3a3a',
  borderRadius: '8px',
  width: '680px',
  maxWidth: '95vw',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
  overflow: 'hidden',
}

const header: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: '1px solid #333',
  flexShrink: 0,
}

const body: CSSProperties = {
  overflowY: 'auto',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const sectionTitle: CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#5599cc',
  marginBottom: '8px',
}

const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px',
}

const th: CSSProperties = {
  textAlign: 'left',
  padding: '4px 8px',
  color: '#666',
  borderBottom: '1px solid #2a2a2a',
  fontWeight: 600,
  fontSize: '11px',
}

const td: CSSProperties = {
  padding: '5px 8px',
  color: '#ccc',
  borderBottom: '1px solid #222',
  verticalAlign: 'top',
}

const kbd: CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  background: '#2a2a2a',
  border: '1px solid #555',
  borderRadius: '3px',
  fontSize: '11px',
  color: '#ddd',
  fontFamily: 'monospace',
  lineHeight: '1.6',
}

const badge: CSSProperties = {
  display: 'inline-block',
  padding: '1px 7px',
  background: '#222',
  border: '1px solid #3a3a3a',
  borderRadius: '3px',
  fontSize: '12px',
  color: '#aaa',
  marginRight: '4px',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={sectionTitle}>{title}</div>
      {children}
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <span style={kbd}>{children}</span>
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={badge}>{children}</span>
}

export function HelpModal({ onClose }: HelpModalProps) {
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div style={overlay} onClick={handleOverlayClick}>
      <div style={panel}>
        <div style={header}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#ddd' }}>Help &amp; Controls</span>
          <button
            onClick={onClose}
            title="Close"
            style={{
              background: 'none', border: 'none', color: '#888', cursor: 'pointer',
              fontSize: '18px', lineHeight: 1, padding: '2px 6px', borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <div style={body}>

          <Section title="Tools">
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Icon</th>
                  <th style={th}>Tool</th>
                  <th style={th}>How to use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>↖</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Select</td>
                  <td style={td}>Click an element to select it. Drag to move it around the canvas.</td>
                </tr>
                <tr>
                  <td style={td}>⬡</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Edit</td>
                  <td style={td}>
                    Drag the handles on a selected element to resize or reshape it.<br />
                    <Kbd>Alt</Kbd> + click an edge to <strong>insert</strong> a new vertex.<br />
                    <Kbd>Alt</Kbd> + click an existing handle to <strong>remove</strong> that vertex (min 3 required).
                  </td>
                </tr>
                <tr>
                  <td style={td}>⬜</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Room</td>
                  <td style={td}>
                    Draw dungeon rooms. Choose a shape in the sub-toolbar:<br />
                    <Badge>⬜ Square</Badge> drag to create a rectangle.<br />
                    <Badge>⭕ Circle</Badge> drag to create an ellipse (<Kbd>Alt</Kbd> to snap to a perfect circle).<br />
                    <Badge>✏️ Custom</Badge> click to place vertices; double-click or click near the first point to close.
                  </td>
                </tr>
                <tr>
                  <td style={td}>🪨</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Cave</td>
                  <td style={td}>
                    Draw cave areas. Choose a mode in the sub-toolbar:<br />
                    <Badge>✏️ Polygon</Badge> click to place vertices; double-click or click near the first point to close.<br />
                    <Badge>🖌️ Paint</Badge> click and drag to freehand paint the cave shape.
                  </td>
                </tr>
                <tr>
                  <td style={td}>🌿</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Terrain</td>
                  <td style={td}>
                    Draw terrain areas (Forest, Grass, Mountain, Water, Sand, Swamp, Snow).<br />
                    Select the terrain type in the sub-toolbar first, then draw using Square, Circle, or Custom mode.
                  </td>
                </tr>
                <tr>
                  <td style={td}>📌</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Item</td>
                  <td style={td}>
                    Click anywhere on the canvas to place an item (door, chest, trap, stairs, torch, monster, NPC, pillar).<br />
                    Change the symbol in the Properties panel after placing.
                  </td>
                </tr>
                <tr>
                  <td style={td}>✕</td>
                  <td style={{ ...td, color: '#eee', fontWeight: 600 }}>Erase</td>
                  <td style={td}>Click any element on the canvas to permanently delete it.</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="Keyboard &amp; Mouse Shortcuts">
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Shortcut</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}><Kbd>Ctrl</Kbd> + Scroll wheel</td>
                  <td style={td}>Zoom in / out (range: 0.2× – 8×)</td>
                </tr>
                <tr>
                  <td style={td}><Kbd>Ctrl</Kbd> + Drag</td>
                  <td style={td}>Pan the canvas</td>
                </tr>
                <tr>
                  <td style={td}><Kbd>Alt</Kbd> + Drag <em>(ellipse mode)</em></td>
                  <td style={td}>Constrain ellipse to a perfect circle</td>
                </tr>
                <tr>
                  <td style={td}><Kbd>Alt</Kbd> + Click edge <em>(Edit tool)</em></td>
                  <td style={td}>Insert a new vertex on a polygon edge</td>
                </tr>
                <tr>
                  <td style={td}><Kbd>Alt</Kbd> + Click handle <em>(Edit tool)</em></td>
                  <td style={td}>Remove that vertex from a polygon (min 3 vertices)</td>
                </tr>
                <tr>
                  <td style={td}>Double-click <em>(polygon drawing)</em></td>
                  <td style={td}>Finish and close the polygon</td>
                </tr>
                <tr>
                  <td style={td}>Click near first vertex <em>(polygon drawing)</em></td>
                  <td style={td}>Finish and close the polygon</td>
                </tr>
                <tr>
                  <td style={td}><Kbd>Enter</Kbd></td>
                  <td style={td}>Confirm text inputs (rename map, save dialog)</td>
                </tr>
                <tr>
                  <td style={td}><Kbd>Escape</Kbd></td>
                  <td style={td}>Cancel text inputs</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="Properties Panel (right sidebar)">
            <div style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.7 }}>
              Select any element on the canvas to reveal its properties:<br />
              <strong style={{ color: '#ddd' }}>Rooms &amp; Caves</strong> — edit label, fill color, and optional per-element grid settings.<br />
              <strong style={{ color: '#ddd' }}>Terrain</strong> — change terrain type, label, and grid settings.<br />
              <strong style={{ color: '#ddd' }}>Items</strong> — choose a symbol emoji and add a label.
            </div>
          </Section>

          <Section title="Objects Panel">
            <div style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.7 }}>
              Click <strong style={{ color: '#ddd' }}>Objects</strong> in the toolbar to open the layer list.<br />
              All elements are shown in render order — items at the top of the list appear in front.<br />
              Use the <strong style={{ color: '#ddd' }}>▲ / ▼</strong> buttons to reorder layers. Click an entry to select that element.
            </div>
          </Section>

          <Section title="Saving &amp; Exporting">
            <table style={table}>
              <tbody>
                <tr>
                  <td style={{ ...td, color: '#eee', fontWeight: 600, whiteSpace: 'nowrap' }}>Save Map</td>
                  <td style={td}>Save the current map to browser storage. You'll be prompted for a name the first time.</td>
                </tr>
                <tr>
                  <td style={{ ...td, color: '#eee', fontWeight: 600, whiteSpace: 'nowrap' }}>Maps</td>
                  <td style={td}>Open the saved maps panel to load, export (JSON), or delete maps. Drag &amp; drop a JSON file to import.</td>
                </tr>
                <tr>
                  <td style={{ ...td, color: '#eee', fontWeight: 600, whiteSpace: 'nowrap' }}>New Map</td>
                  <td style={td}>Clear the canvas and start a fresh map.</td>
                </tr>
                <tr>
                  <td style={{ ...td, color: '#eee', fontWeight: 600, whiteSpace: 'nowrap' }}>Save PNG</td>
                  <td style={td}>Export the current canvas as a PNG image file.</td>
                </tr>
                <tr>
                  <td style={{ ...td, color: '#eee', fontWeight: 600, whiteSpace: 'nowrap' }}>Map name</td>
                  <td style={td}>Click the map name in the toolbar to rename it inline.</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="Global Grid">
            <div style={{ fontSize: '12px', color: '#bbb', lineHeight: 1.7 }}>
              Toggle the global grid <strong style={{ color: '#ddd' }}>On / Off</strong> from the toolbar.<br />
              When on, adjust the grid <strong style={{ color: '#ddd' }}>size</strong> (px), <strong style={{ color: '#ddd' }}>color</strong>, and <strong style={{ color: '#ddd' }}>opacity</strong> with the controls that appear beside it.<br />
              Individual rooms, caves, and terrain elements can also have their own independent grid via the Properties panel.
            </div>
          </Section>

        </div>
      </div>
    </div>
  )
}
