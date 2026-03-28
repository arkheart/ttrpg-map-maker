import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('react-konva', () => ({
  Layer: ({ children }: { children: React.ReactNode }) => <div data-testid="layer">{children}</div>,
  Line: (props: Record<string, unknown>) => <div data-testid="line" data-closed={String(props.closed)} />,
  Circle: (_props: Record<string, unknown>) => <div data-testid="circle" />,
}))

import { CaveDrawLayer, PaintCaveDrawLayer } from '../CaveDrawLayer'

describe('CaveDrawLayer', () => {
  it('renders nothing when no points', () => {
    const { container } = render(<CaveDrawLayer points={[]} mousePos={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a layer when points provided', () => {
    const { getByTestId } = render(
      <CaveDrawLayer points={[0, 0, 50, 0, 50, 50]} mousePos={null} />
    )
    expect(getByTestId('layer')).toBeInTheDocument()
  })

  it('renders vertex circles for each point pair', () => {
    const { getAllByTestId } = render(
      <CaveDrawLayer points={[0, 0, 50, 0, 50, 50]} mousePos={null} />
    )
    // 3 vertices → 3 circles
    expect(getAllByTestId('circle')).toHaveLength(3)
  })

  it('renders preview line when mousePos is provided', () => {
    const { getAllByTestId } = render(
      <CaveDrawLayer points={[0, 0, 50, 50]} mousePos={{ x: 100, y: 100 }} />
    )
    // lines: outline (not closed) + preview dashed line
    const lines = getAllByTestId('line')
    expect(lines.length).toBeGreaterThanOrEqual(2)
  })

  it('does not render preview line when mousePos is null', () => {
    // Use only 2 values (1 vertex) so filled polygon is NOT triggered (needs >= 4 values)
    const { getAllByTestId } = render(
      <CaveDrawLayer points={[0, 0]} mousePos={null} />
    )
    const lines = getAllByTestId('line')
    // Only the open outline line, no closed polygon, no preview
    expect(lines).toHaveLength(1)
  })

  it('renders filled polygon when 4+ point values given', () => {
    const { getAllByTestId } = render(
      <CaveDrawLayer points={[0, 0, 50, 0, 50, 50, 0, 50]} mousePos={null} />
    )
    const closedLines = getAllByTestId('line').filter(el => el.dataset.closed === 'true')
    expect(closedLines.length).toBeGreaterThanOrEqual(1)
  })
})

describe('PaintCaveDrawLayer', () => {
  it('renders nothing when fewer than 4 point values', () => {
    const { container } = render(<PaintCaveDrawLayer points={[0, 0]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for empty points', () => {
    const { container } = render(<PaintCaveDrawLayer points={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders layer with lines when 4+ point values provided', () => {
    const { getByTestId } = render(<PaintCaveDrawLayer points={[0, 0, 10, 10, 20, 0, 30, 10]} />)
    expect(getByTestId('layer')).toBeInTheDocument()
  })
})
