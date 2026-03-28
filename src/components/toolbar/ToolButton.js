import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ToolButton({ icon, label, active, onClick }) {
    return (_jsxs("button", { onClick: onClick, title: label, style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: active ? '#0066cc' : '#333',
            color: '#fff',
            border: `1px solid ${active ? '#0088ff' : '#444'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: active ? 600 : 400,
        }, children: [_jsx("span", { children: icon }), _jsx("span", { children: label })] }));
}
