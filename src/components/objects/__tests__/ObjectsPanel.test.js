import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectsPanel } from '../ObjectsPanel';
import { renderWithContext } from '@/test-utils';
const room = { id: 'r1', shape: 'rect', x: 0, y: 0, width: 100, height: 80, fill: '#333', label: 'Entry Hall' };
const cave = { id: 'c1', points: [0, 0, 10, 10], fill: '#555', label: 'Dark Cave' };
const terrain = { id: 't1', shape: 'rect', x: 0, y: 0, width: 50, height: 50, terrainType: 'forest' };
const item = { id: 'i1', x: 5, y: 5, symbol: '🚪', label: 'Main Door' };
const stateWithAll = {
    rooms: [room],
    caves: [cave],
    terrain: [terrain],
    items: [item],
    layerOrder: ['t1', 'r1', 'c1', 'i1'],
};
describe('ObjectsPanel', () => {
    it('renders Objects heading', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }));
        expect(screen.getByText('Objects')).toBeInTheDocument();
    });
    it('shows empty state when no objects', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }));
        expect(screen.getByText(/No objects yet/i)).toBeInTheDocument();
    });
    it('calls onClose when ✕ is clicked', async () => {
        const onClose = vi.fn();
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: onClose }));
        await userEvent.click(screen.getByTitle('Close'));
        expect(onClose).toHaveBeenCalledOnce();
    });
    it('renders all objects from layerOrder', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll });
        expect(screen.getByText('Entry Hall')).toBeInTheDocument();
        expect(screen.getByText('Dark Cave')).toBeInTheDocument();
        expect(screen.getByText('Main Door')).toBeInTheDocument();
    });
    it('calls onSelect with correct element when label is clicked', async () => {
        const onSelect = vi.fn();
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: onSelect, onClose: () => { } }), { mapState: stateWithAll });
        await userEvent.click(screen.getByText('Entry Hall'));
        expect(onSelect).toHaveBeenCalledWith({ type: 'room', id: 'r1' });
    });
    it('highlights selected element', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: { type: 'room', id: 'r1' }, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll });
        // Selected label has blue color
        expect(screen.getByText('Entry Hall')).toHaveStyle({ color: '#aef' });
    });
    it('dispatches REORDER_ELEMENT up when ▲ is clicked', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll, dispatch });
        // ▲ buttons — click first enabled one (topmost item has disabled ▲)
        const upButtons = screen.getAllByTitle('Move up (render on top)');
        // Find an enabled one (not the topmost)
        const enabledUp = upButtons.find(b => !b.disabled);
        await userEvent.click(enabledUp);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'REORDER_ELEMENT', payload: expect.objectContaining({ direction: 'up' }) }));
    });
    it('dispatches REORDER_ELEMENT down when ▼ is clicked', async () => {
        const dispatch = vi.fn();
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll, dispatch });
        const downButtons = screen.getAllByTitle('Move down (render below)');
        const enabledDown = downButtons.find(b => !b.disabled);
        await userEvent.click(enabledDown);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'REORDER_ELEMENT', payload: expect.objectContaining({ direction: 'down' }) }));
    });
    it('disables ▲ on the topmost element', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll });
        const upButtons = screen.getAllByTitle('Move up (render on top)');
        // First row in displayed list = topmost layer = last in layerOrder (i1)
        expect(upButtons[0]).toBeDisabled();
    });
    it('disables ▼ on the bottommost element', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll });
        const downButtons = screen.getAllByTitle('Move down (render below)');
        expect(downButtons[downButtons.length - 1]).toBeDisabled();
    });
    it('shows footer hint text', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }));
        expect(screen.getByText(/top of list = drawn on top/i)).toBeInTheDocument();
    });
    it('shows type label for each element', () => {
        renderWithContext(_jsx(ObjectsPanel, { selected: null, onSelect: () => { }, onClose: () => { } }), { mapState: stateWithAll });
        expect(screen.getByText('room')).toBeInTheDocument();
        expect(screen.getByText('cave')).toBeInTheDocument();
        expect(screen.getByText('terrain')).toBeInTheDocument();
        expect(screen.getByText('item')).toBeInTheDocument();
    });
});
