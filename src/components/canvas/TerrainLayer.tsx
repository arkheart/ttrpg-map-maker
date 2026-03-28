import { Layer, Rect, Text } from 'react-konva'
import type { MapTerrain } from '@/types/map'
import { useMapDispatch } from '@/store/mapStore'
import { useMapTool } from '@/hooks/useMapTool'

interface Props {
  terrain: MapTerrain[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function TerrainLayer({ terrain, onSelect, selectedId }: Props) {
  const dispatch = useMapDispatch()
  const { activeTool } = useMapTool()

  return (
    <Layer>
      {terrain.map(t => (
        <>
          <Rect
            key={t.id}
            id={t.id}
            x={t.x}
            y={t.y}
            width={t.width}
            height={t.height}
            fill={t.fill}
            stroke={selectedId === t.id ? '#00aaff' : '#555'}
            strokeWidth={selectedId === t.id ? 2 : 1}
            draggable={activeTool === 'select'}
            onClick={() => onSelect(t.id)}
            onDragEnd={e => {
              dispatch({
                type: 'UPDATE_TERRAIN',
                payload: { id: t.id, x: e.target.x(), y: e.target.y() },
              })
            }}
          />
          {t.label && (
            <Text
              key={`${t.id}-label`}
              x={t.x + 4}
              y={t.y + 4}
              text={t.label}
              fontSize={11}
              fill="#ddd"
              listening={false}
            />
          )}
        </>
      ))}
    </Layer>
  )
}
