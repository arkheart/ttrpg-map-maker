import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolButton } from '../ToolButton';
describe('ToolButton', () => {
    it('renders icon and label', () => {
        render(_jsx(ToolButton, { icon: "\u2B1C", label: "Room", active: false, onClick: () => { } }));
        expect(screen.getByText('⬜')).toBeInTheDocument();
        expect(screen.getByText('Room')).toBeInTheDocument();
    });
    it('sets title attribute to label', () => {
        render(_jsx(ToolButton, { icon: "\u2B1C", label: "Room", active: false, onClick: () => { } }));
        expect(screen.getByTitle('Room')).toBeInTheDocument();
    });
    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(_jsx(ToolButton, { icon: "\u2B1C", label: "Room", active: false, onClick: onClick }));
        await userEvent.click(screen.getByTitle('Room'));
        expect(onClick).toHaveBeenCalledOnce();
    });
    it('applies active background when active=true', () => {
        render(_jsx(ToolButton, { icon: "\u2B1C", label: "Room", active: true, onClick: () => { } }));
        const btn = screen.getByTitle('Room');
        expect(btn).toHaveStyle({ background: '#0066cc' });
        expect(btn).toHaveStyle({ fontWeight: 600 });
    });
    it('applies inactive background when active=false', () => {
        render(_jsx(ToolButton, { icon: "\u2B1C", label: "Room", active: false, onClick: () => { } }));
        const btn = screen.getByTitle('Room');
        expect(btn).toHaveStyle({ background: '#333' });
        expect(btn).toHaveStyle({ fontWeight: 400 });
    });
});
