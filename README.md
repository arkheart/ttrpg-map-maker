# TTRPG Map Maker

A browser-based dungeon map editor for tabletop RPGs. Draw rooms, caves, and terrain, place items, manage layers, and export your maps as PNG or JSON.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Tools](#tools)
- [Keyboard & Mouse Shortcuts](#keyboard--mouse-shortcuts)
- [Properties Panel](#properties-panel)
- [Objects Panel](#objects-panel)
- [Saving & Exporting](#saving--exporting)
- [Global Grid](#global-grid)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Scripts](#scripts)
- [Running with Docker](#running-with-docker)

---

## Getting Started

```bash
npm install
npm run dev        # starts dev server at http://localhost:3000
```

---

## Tools

Select a tool from the toolbar. A secondary sub-toolbar appears below for tools that have shape or mode options.

| Icon | Tool | Description |
|------|------|-------------|
| ↖ | **Select** | Click an element to select it. Drag to move it. |
| ⬡ | **Edit** | Drag handles to resize/reshape. `Alt`+click an edge to insert a vertex; `Alt`+click a handle to remove it (min 3 vertices). |
| ⬜ | **Room** | Draw dungeon rooms. Sub-toolbar: **Square** (drag), **Circle** (drag; `Alt` to snap to perfect circle), **Custom** (click vertices; double-click or click near start to close). |
| 🪨 | **Cave** | Draw cave areas. Sub-toolbar: **Polygon** (click vertices; close same as above), **Paint** (click-drag to freehand draw). |
| 🌿 | **Terrain** | Draw terrain (Forest, Grass, Mountain, Water, Sand, Swamp, Snow). Pick the terrain type and shape mode in the sub-toolbar before drawing. |
| 📌 | **Item** | Click to place an item (door, chest, trap, stairs, torch, monster, NPC, pillar). Change the symbol in the Properties panel after placing. |
| ✕ | **Erase** | Click any element to permanently delete it. |

---

## Keyboard & Mouse Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl` + Scroll wheel | Zoom in / out (0.2× – 8×) |
| `Ctrl` + Drag | Pan the canvas |
| `Alt` + Drag *(ellipse mode)* | Constrain ellipse to a perfect circle |
| `Alt` + Click edge *(Edit tool)* | Insert a new vertex on a polygon edge |
| `Alt` + Click handle *(Edit tool)* | Remove that vertex (min 3 vertices required) |
| Double-click *(polygon drawing)* | Finish and close the polygon |
| Click near first vertex *(polygon drawing)* | Finish and close the polygon |
| `Enter` | Confirm text inputs (rename map, save dialog) |
| `Escape` | Cancel text inputs |

---

## Properties Panel

Select any element on the canvas to edit its properties in the right sidebar:

- **Rooms & Caves** — label, fill color (presets + custom color picker), and optional per-element grid settings.
- **Terrain** — terrain type, label, and per-element grid settings.
- **Items** — symbol emoji (8 options) and label.

When nothing is selected, the panel shows a brief tool reference.

---

## Objects Panel

Click **Objects** in the toolbar to open the layer list. Elements are displayed in render order — the top of the list is rendered in front. Use the **▲ / ▼** buttons to reorder layers. Click any entry to select that element on the canvas.

---

## Saving & Exporting

| Control | Description |
|---------|-------------|
| **Save Map** | Save to browser `localStorage`. Prompts for a name on first save; subsequent saves overwrite silently. |
| **Maps** | Open the saved maps panel to load, export as JSON, or delete maps. Drag & drop a `.json` file into the panel to import. |
| **New Map** | Clear the canvas and start fresh. |
| **Save PNG** | Export the current canvas as a PNG image. |
| Map name *(toolbar)* | Click the name to rename it inline. |

Map data is also auto-saved to `localStorage` on every change so work is preserved across page reloads.

---

## Global Grid

Toggle the grid **On / Off** from the toolbar. When enabled, additional controls appear:

- **Size** — grid cell size in pixels.
- **Color** — grid line color.
- **Opacity** — grid line transparency (0–100%).

Individual rooms, caves, and terrain elements can have their own independent grid configured in the Properties panel, independent of the global grid.

---

## Project Structure

```
src/
├── components/
│   ├── canvas/         # MapCanvas — drawing, pan/zoom, hit-testing
│   ├── dev/            # DevMenu — localStorage inspector (dev only)
│   ├── help/           # HelpModal — in-app help overlay
│   ├── maps/           # MapsPanel — save/load/import/export
│   ├── objects/        # ObjectsPanel — layer management
│   ├── sidebar/        # Sidebar / PropertiesPanel — element properties
│   └── toolbar/        # Toolbar, ToolButton — tool selection & grid controls
├── hooks/
│   └── useMapTool.ts   # Active tool + draw-mode context
├── store/
│   └── mapStore.ts     # Map state reducer, localStorage persistence
├── types/
│   └── map.ts          # Core types: MapRoom, MapCave, MapTerrain, MapItem, etc.
├── App.tsx             # Root layout, panel visibility, save/load orchestration
└── main.tsx            # React entry point
```

---

## Tech Stack

| Package | Purpose |
|---------|---------|
| [React 18](https://react.dev) | UI framework |
| [react-konva](https://konvajs.org/docs/react/) / [Konva](https://konvajs.org) | Canvas rendering |
| [Vite](https://vitejs.dev) | Dev server & bundler |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vitest](https://vitest.dev) | Unit testing |
| [@testing-library/react](https://testing-library.com) | Component testing |

---

## Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Type-check and build for production (output: dist/)
npm run preview      # Serve the production build locally
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
```

---

## Running with Docker

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`. Source files are volume-mounted so edits are reflected live without rebuilding the image.
