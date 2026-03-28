import { useState } from 'react'

interface LocalStorageEntry {
  key: string
  value: string
}

function getLocalStorageEntries(): LocalStorageEntry[] {
  const entries: LocalStorageEntry[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key !== null) {
      entries.push({ key, value: localStorage.getItem(key) ?? '' })
    }
  }
  return entries.sort((a, b) => a.key.localeCompare(b.key))
}

interface Props {
  onClearAll?: () => void
}

export function DevMenu({ onClearAll }: Props) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<LocalStorageEntry[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  function handleOpen() {
    setEntries(getLocalStorageEntries())
    setOpen(true)
  }

  function handleClearAll() {
    onClearAll?.()
    setEntries([])
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  function handleRefresh() {
    setEntries(getLocalStorageEntries())
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        title="Dev menu"
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '12px',
          zIndex: 9999,
          padding: '5px 10px',
          background: '#1a1a2e',
          color: '#6699cc',
          border: '1px solid #334',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          fontFamily: 'monospace',
          opacity: 0.7,
        }}
      >
        DEV
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '12px',
      right: '12px',
      zIndex: 9999,
      width: '480px',
      maxHeight: '60vh',
      background: '#0d0d1a',
      border: '1px solid #334',
      borderRadius: '6px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      fontSize: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid #223',
        gap: '8px',
        flexShrink: 0,
      }}>
        <span style={{ color: '#6699cc', fontWeight: 700, flex: 1 }}>DEV — localStorage</span>
        <button
          onClick={handleRefresh}
          title="Refresh"
          style={btnStyle('#1a2a1a', '#6c6')}
        >
          ↺ Refresh
        </button>
        <button
          onClick={handleClearAll}
          title="Clear all localStorage"
          style={btnStyle('#2a1010', '#c66')}
        >
          ✕ Clear All
        </button>
        <button
          onClick={() => setOpen(false)}
          title="Close"
          style={btnStyle('#1a1a1a', '#888')}
        >
          ✕
        </button>
      </div>

      {/* Entries */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {entries.length === 0 ? (
          <div style={{ color: '#445', textAlign: 'center', padding: '24px 0' }}>
            No localStorage entries.
          </div>
        ) : (
          entries.map(({ key, value }) => (
            <div key={key} style={{
              marginBottom: '8px',
              border: '1px solid #223',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              {/* Key row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                background: '#111122',
                gap: '8px',
              }}>
                <span style={{ color: '#88aadd', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {key}
                </span>
                <button
                  onClick={() => handleCopy(key, `key:${key}`)}
                  style={btnStyle('#1a1a2e', copied === `key:${key}` ? '#8f8' : '#668')}
                >
                  {copied === `key:${key}` ? '✓' : 'copy key'}
                </button>
                <button
                  onClick={() => handleCopy(value, `val:${key}`)}
                  style={btnStyle('#1a1a2e', copied === `val:${key}` ? '#8f8' : '#668')}
                >
                  {copied === `val:${key}` ? '✓' : 'copy value'}
                </button>
              </div>
              {/* Value row */}
              <pre style={{
                margin: 0,
                padding: '6px 8px',
                background: '#0a0a14',
                color: '#99bbaa',
                fontSize: '11px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: '120px',
                overflowY: 'auto',
              }}>
                {formatValue(value)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function formatValue(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '2px 8px',
    background: bg,
    color,
    border: `1px solid ${color}44`,
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'monospace',
    flexShrink: 0,
  }
}
