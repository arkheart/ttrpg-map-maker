import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertiesPanel } from '../PropertiesPanel';
import { renderWithContext, emptyMapState } from '@/test-utils';
const room = { id: 'r1', shape: 'rect', x: 0, y: 0, width: 100, height: 80, fill: '#3a3a3a', label: 'Boss Room' };
const cave = { id: 'c1', points: [0, 0, 10, 10, 20, 0], fill: '#555', label: 'Hidden Cave' };
const terrain = { id: 't1', shape: 'rect', x: 0, y: 0, width: 50, height: 50, terrainType: 'forest', label: 'Dark Woods' };
const item = { id: 'i1', x: 5, y: 5, symbol: '🚪', label: 'Front Door' };
// ── Room ──────────────────────────────────────────────────────────────────────
describe('PropertiesPanel — room', () => {
    it('renders label input with existing label', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] } });
        expect(screen.getByPlaceholderText('Room name...')).toHaveValue('Boss Room');
    });
    it('dispatches UPDATE_ROOM on label change', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] }, dispatch });
        const input = screen.getByPlaceholderText('Room name...');
        fireEvent.change(input, { target: { value: 'Throne Room' } });
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ROOM', payload: expect.objectContaining({ id: 'r1', label: 'Throne Room' }) }));
    });
    it('dispatches UPDATE_ROOM on preset color click', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] }, dispatch });
        await userEvent.click(screen.getByTitle('Stone'));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ROOM', payload: expect.objectContaining({ fill: '#555' }) }));
    });
    it('renders Fill Color section', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] } });
        expect(screen.getByText(/Fill Color/i)).toBeInTheDocument();
    });
    it('renders Grid section', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] } });
        expect(screen.getByText('Grid')).toBeInTheDocument();
    });
    it('returns null when room id not found', () => {
        const { container } = renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'unknown' } }), { mapState: { ...emptyMapState } });
        expect(container.firstChild).toBeNull();
    });
});
// ── Cave ──────────────────────────────────────────────────────────────────────
describe('PropertiesPanel — cave', () => {
    it('renders label input with existing label', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'cave', id: 'c1' } }), { mapState: { ...emptyMapState, caves: [cave], layerOrder: ['c1'] } });
        expect(screen.getByPlaceholderText('Cave name...')).toHaveValue('Hidden Cave');
    });
    it('dispatches UPDATE_CAVE on label change', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'cave', id: 'c1' } }), { mapState: { ...emptyMapState, caves: [cave], layerOrder: ['c1'] }, dispatch });
        const input = screen.getByPlaceholderText('Cave name...');
        fireEvent.change(input, { target: { value: 'Dragon Lair' } });
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_CAVE', payload: expect.objectContaining({ id: 'c1', label: 'Dragon Lair' }) }));
    });
    it('returns null when cave id not found', () => {
        const { container } = renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'cave', id: 'unknown' } }), { mapState: { ...emptyMapState } });
        expect(container.firstChild).toBeNull();
    });
});
// ── Terrain ───────────────────────────────────────────────────────────────────
describe('PropertiesPanel — terrain', () => {
    it('renders terrain type buttons', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'terrain', id: 't1' } }), { mapState: { ...emptyMapState, terrain: [terrain], layerOrder: ['t1'] } });
        expect(screen.getByText('Forest')).toBeInTheDocument();
        expect(screen.getByText('Water')).toBeInTheDocument();
        expect(screen.getByText('Mountain')).toBeInTheDocument();
    });
    it('dispatches UPDATE_TERRAIN on terrain type click', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'terrain', id: 't1' } }), { mapState: { ...emptyMapState, terrain: [terrain], layerOrder: ['t1'] }, dispatch });
        await userEvent.click(screen.getByText('Water'));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_TERRAIN', payload: expect.objectContaining({ terrainType: 'water' }) }));
    });
    it('renders label input', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'terrain', id: 't1' } }), { mapState: { ...emptyMapState, terrain: [terrain], layerOrder: ['t1'] } });
        expect(screen.getByPlaceholderText('Terrain label...')).toHaveValue('Dark Woods');
    });
    it('dispatches UPDATE_TERRAIN on label change', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'terrain', id: 't1' } }), { mapState: { ...emptyMapState, terrain: [terrain], layerOrder: ['t1'] }, dispatch });
        const input = screen.getByPlaceholderText('Terrain label...');
        fireEvent.change(input, { target: { value: 'Enchanted' } });
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_TERRAIN', payload: expect.objectContaining({ id: 't1', label: 'Enchanted' }) }));
    });
});
// ── Item ──────────────────────────────────────────────────────────────────────
describe('PropertiesPanel — item', () => {
    it('renders symbol buttons', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'item', id: 'i1' } }), { mapState: { ...emptyMapState, items: [item], layerOrder: ['i1'] } });
        expect(screen.getByTitle('Door')).toBeInTheDocument();
        expect(screen.getByTitle('Chest')).toBeInTheDocument();
    });
    it('dispatches UPDATE_ITEM on symbol click', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'item', id: 'i1' } }), { mapState: { ...emptyMapState, items: [item], layerOrder: ['i1'] }, dispatch });
        await userEvent.click(screen.getByTitle('Chest'));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ITEM', payload: expect.objectContaining({ symbol: '📦' }) }));
    });
    it('renders label input', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'item', id: 'i1' } }), { mapState: { ...emptyMapState, items: [item], layerOrder: ['i1'] } });
        expect(screen.getByPlaceholderText('Item label...')).toHaveValue('Front Door');
    });
    it('dispatches UPDATE_ITEM on label change', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'item', id: 'i1' } }), { mapState: { ...emptyMapState, items: [item], layerOrder: ['i1'] }, dispatch });
        const input = screen.getByPlaceholderText('Item label...');
        fireEvent.change(input, { target: { value: 'Side Entrance' } });
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ITEM', payload: expect.objectContaining({ id: 'i1', label: 'Side Entrance' }) }));
    });
    it('returns null when item id not found', () => {
        const { container } = renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'item', id: 'unknown' } }), { mapState: { ...emptyMapState } });
        expect(container.firstChild).toBeNull();
    });
});
// ── GridSection ───────────────────────────────────────────────────────────────
describe('PropertiesPanel — GridSection', () => {
    it('shows Disabled when grid not enabled', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [{ ...room, grid: { enabled: false, size: 32 } }], layerOrder: ['r1'] } });
        expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
    it('shows Enabled and size/color/opacity inputs when grid enabled', () => {
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [{ ...room, grid: { enabled: true, size: 32, color: '#fff', opacity: 0.2 } }], layerOrder: ['r1'] } });
        expect(screen.getByText('Enabled')).toBeInTheDocument();
        expect(screen.getByDisplayValue('32')).toBeInTheDocument();
    });
    it('dispatches UPDATE_ROOM with enabled grid when toggle clicked', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(PropertiesPanel, { selected: { type: 'room', id: 'r1' } }), { mapState: { ...emptyMapState, rooms: [{ ...room, grid: { enabled: false, size: 32 } }], layerOrder: ['r1'] }, dispatch });
        await userEvent.click(screen.getByText('Disabled'));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'UPDATE_ROOM', payload: expect.objectContaining({ grid: expect.objectContaining({ enabled: true }) }) }));
    });
});
