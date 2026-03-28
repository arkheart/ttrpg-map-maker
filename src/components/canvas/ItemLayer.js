import { jsx as _jsx } from "react/jsx-runtime";
import { Layer, Text } from 'react-konva';
import { useMapDispatch } from '@/store/mapStore';
import { useMapTool } from '@/hooks/useMapTool';
export function ItemLayer({ items, onSelect, selectedId }) {
    const dispatch = useMapDispatch();
    const { activeTool } = useMapTool();
    return (_jsx(Layer, { children: items.map(item => (_jsx(Text, { id: item.id, x: item.x, y: item.y, text: item.symbol, fontSize: 24, fill: selectedId === item.id ? '#00aaff' : '#fff', draggable: activeTool === 'select', onClick: () => onSelect(item.id), onDragEnd: e => {
                dispatch({
                    type: 'UPDATE_ITEM',
                    payload: { id: item.id, x: e.target.x(), y: e.target.y() },
                });
            } }, item.id))) }));
}
