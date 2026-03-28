import { jsx as _jsx } from "react/jsx-runtime";
import { render } from '@testing-library/react';
import { MapStateContext, MapDispatchContext } from '@/store/mapStore';
import { MapToolContext } from '@/hooks/useMapTool';
export const emptyMapState = {
    rooms: [],
    caves: [],
    terrain: [],
    items: [],
    globalGrid: { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 },
    layerOrder: [],
};
const defaultToolState = {
    activeTool: 'select',
    setActiveTool: () => { },
    activeTerrainType: 'grass',
    setActiveTerrainType: () => { },
    terrainDrawMode: 'rect',
    setTerrainDrawMode: () => { },
    roomDrawMode: 'rect',
    setRoomDrawMode: () => { },
    caveDrawMode: 'polygon',
    setCaveDrawMode: () => { },
};
export function renderWithContext(ui, { mapState, dispatch = () => { }, toolState } = {}) {
    const state = { ...emptyMapState, ...mapState };
    const tool = { ...defaultToolState, ...toolState };
    return render(_jsx(MapStateContext.Provider, { value: state, children: _jsx(MapDispatchContext.Provider, { value: dispatch, children: _jsx(MapToolContext.Provider, { value: tool, children: ui }) }) }));
}
