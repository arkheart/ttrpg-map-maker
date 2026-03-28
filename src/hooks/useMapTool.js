import { createContext, useContext, useState } from 'react';
export const MapToolContext = createContext({
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
});
export function useMapToolState() {
    const [activeTool, setActiveTool] = useState('select');
    const [activeTerrainType, setActiveTerrainType] = useState('grass');
    const [terrainDrawMode, setTerrainDrawMode] = useState('rect');
    const [roomDrawMode, setRoomDrawMode] = useState('rect');
    const [caveDrawMode, setCaveDrawMode] = useState('polygon');
    return { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode, roomDrawMode, setRoomDrawMode, caveDrawMode, setCaveDrawMode };
}
export function useMapTool() {
    return useContext(MapToolContext);
}
