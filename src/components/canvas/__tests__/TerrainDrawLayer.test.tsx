import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('react-konva', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => <div data-testid="layer">{children}</div>,
  Line: (props: Record<string, unknown>) => <div data-testid="line" data-closed={String(props.closed)} />,
  Ellipse: (_props: Record<string, unknown>) => <div data-testid="ellipse" />,
  Circle: (_props: Record<string, unknown>) => <div data-testid="circle" />,
}))

import { TerrainDrawLayer } from '../TerrainDrawLayer'

describe('TerrainDrawLayer', () => {
  it('always renders a layer', () => {
    const { getByTestId } = render(
      <TerrainDrawLayer drawMode="rect" preview={null} points={[]} mousePos={null} />
    )
    expect(getByTestId('layer')).toBeInTheDocument()
  })

  it('renders ellipse when drawMode=ellipse and preview with size > 2', () => {
    const { getByTestId } = render(
      <TerrainDrawLayer
        drawMode="ellipse"
        preview={{ x: 10, y: 10, w: 60, h: 40 }}
        points={[]}
        mousePos={null}
      />
    )
    expect(getByTestId('ellipse')).toBeInTheDocument()
  })

  it('does not render ellipse when preview dimensions are <= 2', () => {
    const { queryByTestId } = render(
      <TerrainDrawLayer
        drawMode="ellipse"
        preview={{ x: 0, y: 0, w: 1, h: 1 }}
        points={[]}
        mousePos={null}
      />
    )
    expect(queryByTestId('ellipse')).not.toBeInTheDocument()
  })

  it('does not render ellipse in rect mode', () => {
    const { queryByTestId } = render(
      <TerrainDrawLayer
        drawMode="rect"
        preview={{ x: 0, y: 0, w: 100, h: 100 }}
        points={[]}
        mousePos={null}
      />
    )
    expect(queryByTestId('ellipse')).not.toBeInTheDocument()
  })

  it('renders polygon line when drawMode=custom and 4+ point values', () => {
    const { getAllByTestId } = render(
      <TerrainDrawLayer
        drawMode="custom"
        preview={null}
        points={[0, 0, 50, 0, 50, 50, 0, 50]}
        mousePos={null}
      />
    )
    const closedLines = getAllByTestId('line').filter(el => el.dataset.closed === 'true')
    expect(closedLines.length).toBeGreaterThanOrEqual(1)
  })

  it('renders vertex circles in custom mode', () => {
    const { getAllByTestId } = render(
      <TerrainDrawLayer
        drawMode="custom"
        preview={null}
        points={[0, 0, 50, 0, 50, 50]}
        mousePos={null}
      />
    )
    expect(getAllByTestId('circle')).toHaveLength(3)
  })

  it('renders preview line from last vertex to mousePos in custom mode', () => {
    const { getAllByTestId } = render(
      <TerrainDrawLayer
        drawMode="custom"
        preview={null}
        points={[0, 0, 50, 50]}
        mousePos={{ x: 100, y: 100 }}
      />
    )
    const lines = getAllByTestId('line')
    expect(lines.length).toBeGreaterThanOrEqual(2)
  })

  it('does not render preview line when mousePos is null', () => {
    // 2 values = 1 vertex: outline renders but no closed polygon (needs >=4 values), no preview
    const { getAllByTestId } = render(
      <TerrainDrawLayer
        drawMode="custom"
        preview={null}
        points={[0, 0]}
        mousePos={null}
      />
    )
    // Only the open outline line — no preview dashed line
    expect(getAllByTestId('line')).toHaveLength(1)
  })
})
