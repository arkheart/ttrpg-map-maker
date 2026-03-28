import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { GridSettings } from '@/types/map'

// Mock react-konva: render each shape as a plain div with data attributes
vi.mock('react-konva', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => <div data-testid="layer">{children}</div>,
  Line: (props: Record<string, unknown>) => <div data-testid="line" data-points={JSON.stringify(props.points)} />,
}))

import { GlobalGridLayer } from '../GlobalGridLayer'

const enabledGrid: GridSettings = { enabled: true, size: 32, color: '#ffffff', opacity: 0.2 }
const disabledGrid: GridSettings = { enabled: false, size: 32 }

describe('GlobalGridLayer', () => {
  it('renders nothing when grid is disabled', () => {
    const { container } = render(
      <GlobalGridLayer width={400} height={300} scale={1} stagePos={{ x: 0, y: 0 }} grid={disabledGrid} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when grid size < 4', () => {
    const { container } = render(
      <GlobalGridLayer width={400} height={300} scale={1} stagePos={{ x: 0, y: 0 }} grid={{ ...enabledGrid, size: 3 }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders a Layer when grid is enabled', () => {
    const { getByTestId } = render(
      <GlobalGridLayer width={400} height={300} scale={1} stagePos={{ x: 0, y: 0 }} grid={enabledGrid} />
    )
    expect(getByTestId('layer')).toBeInTheDocument()
  })

  it('renders vertical and horizontal lines', () => {
    const { getAllByTestId } = render(
      <GlobalGridLayer width={128} height={64} scale={1} stagePos={{ x: 0, y: 0 }} grid={{ ...enabledGrid, size: 32 }} />
    )
    const lines = getAllByTestId('line')
    // For width=128, size=32: columns at 0, 32, 64, 96, 128 → 5 vertical
    // For height=64, size=32: rows at 0, 32, 64 → 3 horizontal
    expect(lines.length).toBe(8)
  })

  it('renders more lines when zoomed out (scale < 1)', () => {
    const { getAllByTestId: at1 } = render(
      <GlobalGridLayer width={128} height={64} scale={1} stagePos={{ x: 0, y: 0 }} grid={{ ...enabledGrid, size: 32 }} />
    )
    const count1 = at1('line').length

    const { getAllByTestId: at05 } = render(
      <GlobalGridLayer width={128} height={64} scale={0.5} stagePos={{ x: 0, y: 0 }} grid={{ ...enabledGrid, size: 32 }} />
    )
    const count05 = at05('line').length

    expect(count05).toBeGreaterThan(count1)
  })
})
