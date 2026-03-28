import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MapsPanel } from '../MapsPanel';
import { emptyMapState } from '@/test-utils';
function makeEntry(overrides = {}) {
    return {
        id: 'map-1',
        name: 'My Map',
        savedAt: new Date('2026-01-15T14:30:00').getTime(),
        state: { ...emptyMapState },
        ...overrides,
    };
}
const noop = () => { };
describe('MapsPanel', () => {
    it('renders "Saved Maps" heading', () => {
        render(_jsx(MapsPanel, { maps: [], currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: noop }));
        expect(screen.getByText('Saved Maps')).toBeInTheDocument();
    });
    it('shows empty state message when no maps', () => {
        render(_jsx(MapsPanel, { maps: [], currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: noop }));
        expect(screen.getByText(/No saved maps yet/i)).toBeInTheDocument();
    });
    it('renders a map entry with name', () => {
        render(_jsx(MapsPanel, { maps: [makeEntry()], currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: noop }));
        expect(screen.getByText('My Map')).toBeInTheDocument();
    });
    it('renders element count summary', () => {
        const entry = makeEntry({
            state: {
                ...emptyMapState,
                rooms: [{ id: 'r1', shape: 'rect', x: 0, y: 0, width: 10, height: 10, fill: '#fff' }],
                caves: [],
                terrain: [],
                items: [],
                layerOrder: ['r1'],
            },
        });
        render(_jsx(MapsPanel, { maps: [entry], currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: noop }));
        expect(screen.getByText('1R · 0C · 0T · 0I')).toBeInTheDocument();
    });
    it('shows Load and Delete buttons per entry', () => {
        render(_jsx(MapsPanel, { maps: [makeEntry()], currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: noop }));
        expect(screen.getByTitle('Load this map')).toBeInTheDocument();
        expect(screen.getByTitle('Delete this map')).toBeInTheDocument();
    });
    it('calls onLoad with the entry when Load is clicked', async () => {
        const onLoad = vi.fn();
        const entry = makeEntry();
        render(_jsx(MapsPanel, { maps: [entry], currentMapId: undefined, onLoad: onLoad, onDelete: noop, onClose: noop }));
        await userEvent.click(screen.getByTitle('Load this map'));
        expect(onLoad).toHaveBeenCalledWith(entry);
    });
    it('calls onDelete with id when Delete is clicked', async () => {
        const onDelete = vi.fn();
        render(_jsx(MapsPanel, { maps: [makeEntry()], currentMapId: undefined, onLoad: noop, onDelete: onDelete, onClose: noop }));
        await userEvent.click(screen.getByTitle('Delete this map'));
        expect(onDelete).toHaveBeenCalledWith('map-1');
    });
    it('calls onClose when ✕ is clicked', async () => {
        const onClose = vi.fn();
        render(_jsx(MapsPanel, { maps: [], currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: onClose }));
        await userEvent.click(screen.getByTitle('Close'));
        expect(onClose).toHaveBeenCalledOnce();
    });
    it('renders multiple entries', () => {
        const maps = [
            makeEntry({ id: '1', name: 'Alpha' }),
            makeEntry({ id: '2', name: 'Beta' }),
        ];
        render(_jsx(MapsPanel, { maps: maps, currentMapId: undefined, onLoad: noop, onDelete: noop, onClose: noop }));
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });
});
