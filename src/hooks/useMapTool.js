import { createContext, useContext, useState } from 'react';
export const MapToolContext = createContext({
    activeTool: 'select',
    setActiveTool: () => { },
    activeTerrainType: 'grass',
    setActiveTerrainType: () => { },
    terrainDrawMode: 'rect',
    setTerrainDrawMode: () => { },
});
export function useMapToolState() {
    const [activeTool, setActiveTool] = useState('select');
    const [activeTerrainType, setActiveTerrainType] = useState('grass');
    const [terrainDrawMode, setTerrainDrawMode] = useState('rect');
    return { activeTool, setActiveTool, activeTerrainType, setActiveTerrainType, terrainDrawMode, setTerrainDrawMode };
}
export function useMapTool() {
    return useContext(MapToolContext);
}
