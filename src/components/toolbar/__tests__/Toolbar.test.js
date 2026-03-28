import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '../Toolbar';
import { renderWithContext, emptyMapState } from '@/test-utils';
function renderToolbar(props = {}, toolState = {}, mapState = {}) {
    return renderWithContext(_jsx(Toolbar, { ...props }), {
        mapState: { ...emptyMapState, ...mapState },
        toolState: { activeTool: 'select', ...toolState },
    });
}
describe('Toolbar — tool buttons', () => {
    it('renders all 6 tool buttons', () => {
        renderToolbar();
        expect(screen.getByTitle('Select')).toBeInTheDocument();
        expect(screen.getByTitle('Room')).toBeInTheDocument();
        expect(screen.getByTitle('Cave')).toBeInTheDocument();
        expect(screen.getByTitle('Terrain')).toBeInTheDocument();
        expect(screen.getByTitle('Item')).toBeInTheDocument();
        expect(screen.getByTitle('Erase')).toBeInTheDocument();
    });
    it('calls setActiveTool when a tool button is clicked', async () => {
        const setActiveTool = vi.fn();
        renderToolbar({}, { setActiveTool });
        await userEvent.click(screen.getByTitle('Room'));
        expect(setActiveTool).toHaveBeenCalledWith('room');
    });
    it('select tool button is active by default', () => {
        renderToolbar();
        expect(screen.getByTitle('Select')).toHaveStyle({ background: '#0066cc' });
    });
});
describe('Toolbar — action buttons', () => {
    it('renders Save Map, Maps, New Map, Save PNG, Clear All buttons', () => {
        renderToolbar();
        expect(screen.getByText('Save Map')).toBeInTheDocument();
        expect(screen.getByText('Maps')).toBeInTheDocument();
        expect(screen.getByText('New Map')).toBeInTheDocument();
        expect(screen.getByText('Save PNG')).toBeInTheDocument();
        expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
    it('calls onExportPng when Save PNG is clicked', async () => {
        const onExportPng = vi.fn();
        renderToolbar({ onExportPng });
        await userEvent.click(screen.getByText('Save PNG'));
        expect(onExportPng).toHaveBeenCalledOnce();
    });
    it('calls onOpenMaps when Maps is clicked', async () => {
        const onOpenMaps = vi.fn();
        renderToolbar({ onOpenMaps });
        await userEvent.click(screen.getByText('Maps'));
        expect(onOpenMaps).toHaveBeenCalledOnce();
    });
    it('calls onNewMap when New Map is clicked', async () => {
        const onNewMap = vi.fn();
        renderToolbar({ onNewMap });
        await userEvent.click(screen.getByText('New Map'));
        expect(onNewMap).toHaveBeenCalledOnce();
    });
    it('calls onOpenObjects when Objects is clicked', async () => {
        const onOpenObjects = vi.fn();
        renderToolbar({ onOpenObjects });
        await userEvent.click(screen.getByText('Objects'));
        expect(onOpenObjects).toHaveBeenCalledOnce();
    });
    it('dispatches CLEAR_ALL when Clear All is clicked', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(Toolbar, {}), { dispatch });
        await userEvent.click(screen.getByText('Clear All'));
        expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR_ALL' });
    });
});
describe('Toolbar — save dialog', () => {
    it('shows first-save dialog when Save Map clicked with no currentMapId', async () => {
        renderToolbar({ currentMapId: undefined });
        await userEvent.click(screen.getByText('Save Map'));
        expect(screen.getByText(/Name this map/i)).toBeInTheDocument();
    });
    it('calls onSaveMap when Save is confirmed in dialog', async () => {
        const onSaveMap = vi.fn();
        renderToolbar({ onSaveMap, currentMapId: undefined, currentMapName: 'Untitled Map' });
        await userEvent.click(screen.getByText('Save Map'));
        const saveBtn = screen.getAllByText('Save').find(el => el.tagName === 'BUTTON');
        await userEvent.click(saveBtn);
        expect(onSaveMap).toHaveBeenCalledWith('Untitled Map');
    });
    it('dismisses dialog on Cancel', async () => {
        renderToolbar({ currentMapId: undefined });
        await userEvent.click(screen.getByText('Save Map'));
        expect(screen.getByText(/Name this map/i)).toBeInTheDocument();
        await userEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByText(/Name this map/i)).not.toBeInTheDocument();
    });
    it('calls onSaveMap directly when currentMapId is set', async () => {
        const onSaveMap = vi.fn();
        renderToolbar({ onSaveMap, currentMapId: 'existing-id', currentMapName: 'My Map' });
        await userEvent.click(screen.getByText('Save Map'));
        expect(onSaveMap).toHaveBeenCalledWith('My Map');
        expect(screen.queryByText(/Name this map/i)).not.toBeInTheDocument();
    });
});
describe('Toolbar — map name / rename', () => {
    it('displays currentMapName', () => {
        renderToolbar({ currentMapName: 'Dungeon Floor 1' });
        expect(screen.getByText('Dungeon Floor 1')).toBeInTheDocument();
    });
    it('enters rename mode when map name is clicked', async () => {
        renderToolbar({ currentMapName: 'Dungeon Floor 1', currentMapId: 'id1' });
        await userEvent.click(screen.getByText('Dungeon Floor 1'));
        const input = screen.getByDisplayValue('Dungeon Floor 1');
        expect(input).toBeInTheDocument();
    });
    it('shows rename input after clicking the map name', async () => {
        renderToolbar({ currentMapName: 'Dungeon Floor 1', currentMapId: 'id1' });
        expect(screen.queryByDisplayValue('Dungeon Floor 1')).not.toBeInTheDocument();
        await userEvent.click(screen.getByText('Dungeon Floor 1'));
        expect(screen.getByDisplayValue('Dungeon Floor 1')).toBeInTheDocument();
    });
});
describe('Toolbar — grid controls', () => {
    it('renders Grid label and Off button when grid disabled', () => {
        renderToolbar({}, {}, { globalGrid: { enabled: false, size: 32, color: '#ffffff', opacity: 0.15 } });
        expect(screen.getByText('Grid')).toBeInTheDocument();
        expect(screen.getByTitle('Enable grid')).toHaveTextContent('Off');
    });
    it('dispatches SET_GLOBAL_GRID to enable when Off is clicked', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(Toolbar, {}), { mapState: { ...emptyMapState, globalGrid: { enabled: false, size: 32, color: '#fff', opacity: 0.15 } }, dispatch });
        await userEvent.click(screen.getByTitle('Enable grid'));
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_GLOBAL_GRID', payload: { enabled: true } });
    });
    it('shows grid controls when grid is enabled', () => {
        renderToolbar({}, {}, { globalGrid: { enabled: true, size: 32, color: '#ffffff', opacity: 0.15 } });
        expect(screen.getByTitle('Grid size (px)')).toBeInTheDocument();
        expect(screen.getByTitle('Grid color')).toBeInTheDocument();
        expect(screen.getByTitle('Grid opacity')).toBeInTheDocument();
    });
    it('dispatches SET_GLOBAL_GRID on size change', () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(Toolbar, {}), { mapState: { ...emptyMapState, globalGrid: { enabled: true, size: 32, color: '#fff', opacity: 0.15 } }, dispatch });
        const sizeInput = screen.getByTitle('Grid size (px)');
        fireEvent.change(sizeInput, { target: { value: '64' } });
        expect(dispatch).toHaveBeenCalledWith({ type: 'SET_GLOBAL_GRID', payload: { size: 64 } });
    });
});
describe('Toolbar — secondary bar', () => {
    it('shows cave mode buttons when cave tool is active', () => {
        renderToolbar({}, { activeTool: 'cave' });
        expect(screen.getByTitle('Polygon')).toBeInTheDocument();
        expect(screen.getByTitle('Paint')).toBeInTheDocument();
    });
    it('shows shape mode buttons when room tool is active', () => {
        renderToolbar({}, { activeTool: 'room' });
        expect(screen.getByTitle('Square')).toBeInTheDocument();
        expect(screen.getByTitle('Circle')).toBeInTheDocument();
        expect(screen.getByTitle('Custom')).toBeInTheDocument();
    });
    it('shows shape + terrain type buttons when terrain tool is active', () => {
        renderToolbar({}, { activeTool: 'terrain' });
        expect(screen.getByTitle('Square')).toBeInTheDocument();
        // terrain type labels
        expect(screen.getByTitle('Forest')).toBeInTheDocument();
        expect(screen.getByTitle('Water')).toBeInTheDocument();
    });
    it('shows no secondary buttons for select tool', () => {
        renderToolbar({}, { activeTool: 'select' });
        expect(screen.queryByTitle('Polygon')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Square')).not.toBeInTheDocument();
    });
    it('calls setCaveDrawMode when Paint is clicked', async () => {
        const setCaveDrawMode = vi.fn();
        renderToolbar({}, { activeTool: 'cave', setCaveDrawMode });
        await userEvent.click(screen.getByTitle('Paint'));
        expect(setCaveDrawMode).toHaveBeenCalledWith('paint');
    });
    it('calls setRoomDrawMode when Circle is clicked', async () => {
        const setRoomDrawMode = vi.fn();
        renderToolbar({}, { activeTool: 'room', setRoomDrawMode });
        await userEvent.click(screen.getByTitle('Circle'));
        expect(setRoomDrawMode).toHaveBeenCalledWith('ellipse');
    });
    it('calls setActiveTerrainType when terrain button clicked', async () => {
        const setActiveTerrainType = vi.fn();
        renderToolbar({}, { activeTool: 'terrain', setActiveTerrainType });
        await userEvent.click(screen.getByTitle('Water'));
        expect(setActiveTerrainType).toHaveBeenCalledWith('water');
    });
});
