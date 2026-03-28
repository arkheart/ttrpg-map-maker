import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { renderWithContext, emptyMapState } from '@/test-utils';
describe('Sidebar', () => {
    it('renders Properties heading', () => {
        render(_jsx(Sidebar, { selected: null }));
        expect(screen.getByText('Properties')).toBeInTheDocument();
    });
    it('shows help text when nothing is selected', () => {
        render(_jsx(Sidebar, { selected: null }));
        expect(screen.getByText(/Select an element/i)).toBeInTheDocument();
        expect(screen.getByText(/↖ Select/i)).toBeInTheDocument();
    });
    it('shows PropertiesPanel when a room is selected', () => {
        const room = { id: 'r1', shape: 'rect', x: 0, y: 0, width: 100, height: 80, fill: '#333' };
        renderWithContext(_jsx(Sidebar, { selected: { type: 'room', id: 'r1' } }), {
            mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] },
        });
        // PropertiesPanel renders a Label input for rooms
        expect(screen.getByPlaceholderText('Room name...')).toBeInTheDocument();
    });
    it('does not show help text when element is selected', () => {
        const room = { id: 'r1', shape: 'rect', x: 0, y: 0, width: 100, height: 80, fill: '#333' };
        renderWithContext(_jsx(Sidebar, { selected: { type: 'room', id: 'r1' } }), {
            mapState: { ...emptyMapState, rooms: [room], layerOrder: ['r1'] },
        });
        expect(screen.queryByText(/Select an element/i)).not.toBeInTheDocument();
    });
});
