import { useState } from 'react'
import type { GenerateParams, GenerationStyle } from '@/generation/mapGenerator'

interface Props {
  onGenerate: (params: GenerateParams) => void
  onClose: () => void
}

const STYLES: { value: GenerationStyle; label: string; desc: string }[] = [
  { value: 'dungeon', label: 'Dungeon', desc: 'Rectangular rooms connected by corridors' },
  { value: 'cavern',  label: 'Cavern',  desc: 'Organic cave shapes with irregular edges' },
  { value: 'mixed',   label: 'Mixed',   desc: 'Rooms with water and terrain features inside' },
]

function randomSeed() {
  return Math.floor(Math.random() * 0xFFFFFF)
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px', color: '#666',
  textTransform: 'uppercase', letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  padding: '5px 8px', background: '#333', color: '#fff',
  border: '1px solid #555', borderRadius: '4px', fontSize: '13px',
  width: '100%', boxSizing: 'border-box',
}

export function GenerateModal({ onGenerate, onClose }: Props) {
  const [mapWidth,  setMapWidth]  = useState(1200)
  const [mapHeight, setMapHeight] = useState(900)
  const [roomCount, setRoomCount] = useState(8)
  const [style,     setStyle]     = useState<GenerationStyle>('dungeon')
  const [seed,      setSeed]      = useState(() => randomSeed())
  const [addGrid,   setAddGrid]   = useState(false)

  function handleGenerate() {
    onGenerate({ mapWidth, mapHeight, roomCount, style, seed, addGrid })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#252525', border: '1px solid #444', borderRadius: '8px',
        padding: '24px', width: '360px', display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>

        <h2 style={{ margin: 0, fontSize: '16px', color: '#ddd', fontWeight: 600 }}>
          Generate Map
        </h2>

        {/* Map size */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={labelStyle}>Width (px)</span>
            <input
              type="number" min={400} max={4000} step={100} value={mapWidth}
              onChange={e => setMapWidth(Math.max(400, parseInt(e.target.value) || 400))}
              style={inputStyle}
            />
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={labelStyle}>Height (px)</span>
            <input
              type="number" min={400} max={4000} step={100} value={mapHeight}
              onChange={e => setMapHeight(Math.max(400, parseInt(e.target.value) || 400))}
              style={inputStyle}
            />
          </label>
        </div>

        {/* Room count */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={labelStyle}>Rooms: {roomCount}</span>
          <input
            type="range" min={4} max={20} step={1} value={roomCount}
            onChange={e => setRoomCount(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555' }}>
            <span>4</span><span>20</span>
          </div>
        </label>

        {/* Style */}
        <div>
          <div style={labelStyle}>Style</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {STYLES.map(s => (
              <button
                key={s.value}
                title={s.desc}
                onClick={() => setStyle(s.value)}
                style={{
                  flex: 1, padding: '6px 0',
                  background: style === s.value ? '#0066cc' : '#2a2a2a',
                  color: '#fff',
                  border: `1px solid ${style === s.value ? '#0088ff' : '#3a3a3a'}`,
                  borderRadius: '4px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: style === s.value ? 600 : 400,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#555', minHeight: '14px' }}>
            {STYLES.find(s => s.value === style)?.desc}
          </div>
        </div>

        {/* Seed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={labelStyle}>Seed</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="number" value={seed}
              onChange={e => setSeed(parseInt(e.target.value) || 0)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => setSeed(randomSeed())}
              title="Randomize seed"
              style={{
                padding: '5px 10px', background: '#2a2a2a', color: '#aaa',
                border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
              }}
            >
              ↺
            </button>
          </div>
        </div>

        {/* Grid checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox" checked={addGrid}
            onChange={e => setAddGrid(e.target.checked)}
          />
          <span style={{ fontSize: '12px', color: '#bbb' }}>Add grid to rooms</span>
        </label>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px', background: '#2a2a2a', color: '#888',
              border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            style={{
              padding: '6px 14px', background: '#1a3d1a', color: '#8fbc8f',
              border: '1px solid #3a6a3a', borderRadius: '4px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600,
            }}
          >
            Generate
          </button>
        </div>

      </div>
    </div>
  )
}
