import { Layer, Text } from 'react-konva'
import type { MapItem } from '@/types/map'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'

interface Props {
  items: MapItem[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function ItemLayer({ items, onSelect, selectedId }: Props) {
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()

  return (
    <Layer>
      {items.map(item => (
        <Text
          key={item.id}
          id={item.id}
          x={item.x}
          y={item.y}
          text={item.symbol}
          fontSize={24}
          fill={selectedId === item.id ? '#00aaff' : '#fff'}
          draggable={activeTool === 'select'}
          onClick={() => onSelect(item.id)}
          onDragEnd={e => {
            dispatch({
              type: 'UPDATE_ITEM',
              payload: { id: item.id, x: e.target.x(), y: e.target.y() },
            })
          }}
        />
      ))}
    </Layer>
  )
}
