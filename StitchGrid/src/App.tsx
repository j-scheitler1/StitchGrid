import { useState, useEffect } from 'react'

import { DEFAULT_CELL_COLOR, DEFAULT_GRID_LINE_COLOR, createDefaultCells, createDesignId, computeCellNumbers } from './types.ts';
import type { Design, Cell } from './types.ts';
import { saveDesign, loadCurrentDesign, clearCurrentDesign, deleteDesign } from './storage.ts';

import Header from './components/Header';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import DesignModal from './components/DesignModal';
import ConfirmDialog from './components/ConfirmDialog';

export type Tool = 'filler' | 'eraser' | 'resize' | null;

const DEFAULT_FILL_COLOR = '#000000';
const HISTORY_LIMIT = 50;
const AUTOSAVE_DELAY_MS = 300;

// Remaps a row-major cell array onto a new grid size, keeping existing
// colors for cells that still exist and padding new ones with the default.
// Numbers are always recomputed, since they depend on color runs within
// each row and the row count/direction both just changed.
const resizeGridCells = (cells: Cell[], oldRows: number, oldColumns: number, newRows: number, newColumns: number): Cell[] => {
  const resized = Array.from({ length: newRows * newColumns }, (_, i) => {
    const row = Math.floor(i / newColumns);
    const col = i % newColumns;

    if (row < oldRows && col < oldColumns) {
      const existing = cells[(row * oldColumns) + col];
      if (existing) return { color: existing.color, number: 0 };
    }

    return { color: DEFAULT_CELL_COLOR, number: 0 };
  });

  const numbers = computeCellNumbers(resized, newRows, newColumns);
  return resized.map((cell, i) => ({ ...cell, number: numbers[i] }));
};

// A factory, not a constant: every call needs its own fresh id, including
// when one replaces a design the user just deleted out from under it.
const createDefaultDesign = (): Design => ({
  id: createDesignId(),
  grid: {
    rows: 10,
    columns: 10,
    cells: createDefaultCells(10, 10),
    offset: { x: 0, y: 0 },
    scale: 1,
    completedRows: 0,
    lineColor: DEFAULT_GRID_LINE_COLOR,
  },
  opacity: 100,
  version: 1,
  name: 'Untitled Design',
});

function App() {
  const [action, setAction] = useState<'existing' | 'new' | 'save' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Restores whichever design was last open in this browser, like Excalidraw
  // does, falling back to a fresh design the first time StitchGrid is opened.
  const [design, setDesign] = useState<Design | null>(() => loadCurrentDesign() ?? createDefaultDesign());
  const [history, setHistory] = useState<Design[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [fillColor, setFillColor] = useState(DEFAULT_FILL_COLOR);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Autosaves to the browser's design library as you work, the way
  // Excalidraw does, so the design survives a refresh/reopen without an
  // explicit save and shows up in "Open Design". Debounced so a continuous
  // drag (moving the grid, resizing the photo) doesn't fire a localStorage
  // write on every pointer-move event.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (design) saveDesign(design);
      else clearCurrentDesign();
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [design]);

  // Snapshots the given design onto the undo stack, capped so it can't grow
  // without bound over a long editing session.
  const pushHistory = (snapshot: Design) => {
    setHistory(prev => [...prev.slice(-(HISTORY_LIMIT - 1)), snapshot]);
  }

  const handleUndo = () => {
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setDesign(previous);
  }

  const handleSidebarChange = (newX: number, newY: number, newOpacity: number) => {
    if (design === undefined || design === null) {
      return;
    }
    // Keep at least 1 column/row even if the input is temporarily empty/invalid.
    const columns = Math.max(1, Math.floor(newX) || design.grid.columns);
    const rows = Math.max(1, Math.floor(newY) || design.grid.rows);

    // This handler also fires for the opacity slider (same callback, columns/
    // rows unchanged) - only snapshot when the grid itself is actually resized.
    if (columns !== design.grid.columns || rows !== design.grid.rows) {
      pushHistory(design);
    }

    setDesign({
      ...design,
      grid: {
        ...design.grid,
        columns,
        rows,
        cells: resizeGridCells(design.grid.cells, design.grid.rows, design.grid.columns, rows, columns),
        // Shrinking the grid below the number of completed rows would make
        // "completed" cover more than exists.
        completedRows: Math.min(design.grid.completedRows, rows),
      },
      opacity: newOpacity,
    });
  }

  const handlePhotoScaleChange = (newScale: number) => {
    if (design === undefined || design === null || !design.photo) {
      return;
    }
    setDesign({
      ...design,
      photo: { ...design.photo, scale: newScale },
    });
  }

  const handleGridLineColorChange = (color: string) => {
    if (design === undefined || design === null) {
      return;
    }
    setDesign({
      ...design,
      grid: { ...design.grid, lineColor: color },
    });
  }

  const handleGridTransformChange = (newOffset: { x: number; y: number }, newScale: number) => {
    if (design === undefined || design === null) {
      return;
    }
    setDesign({
      ...design,
      grid: { ...design.grid, offset: newOffset, scale: newScale },
    });
  }

  const handleToolChange = (tool: Tool) => {
    setActiveTool(prev => (prev === tool ? null : tool));
  }

  const handleCellPaint = (index: number, color: string) => {
    if (design === undefined || design === null) {
      return;
    }
    if (!design.grid.cells[index]) {
      return;
    }
    // Recolor first, then renumber the whole grid: a color change can shift
    // the run-length count for every cell after it in that row's scan order.
    const paintedCells = design.grid.cells.map((cell, i) =>
      i === index ? { ...cell, color } : cell
    );
    const numbers = computeCellNumbers(paintedCells, design.grid.rows, design.grid.columns);

    setDesign({
      ...design,
      grid: {
        ...design.grid,
        cells: paintedCells.map((cell, i) => ({ ...cell, number: numbers[i] })),
      },
    });
  }

  const handleCellFill = (index: number) => handleCellPaint(index, fillColor);
  const handleCellErase = (index: number) => handleCellPaint(index, DEFAULT_CELL_COLOR);

  // Called once at the start of a fill/erase drag (not on every cell it
  // passes over), so one undo click reverts a whole stroke, not one cell.
  const handlePaintStart = () => {
    if (design === undefined || design === null) {
      return;
    }
    pushHistory(design);
  }

  // Marks the next row up from the bottom as complete; each click advances
  // one more row, bottom to top.
  const handleCompleteRow = () => {
    if (design === undefined || design === null) {
      return;
    }
    pushHistory(design);
    setDesign({
      ...design,
      grid: {
        ...design.grid,
        completedRows: Math.min(design.grid.completedRows + 1, design.grid.rows),
      },
    });
  }

  const handleRequestClear = () => setIsClearConfirmOpen(true);

  const handleConfirmClear = () => {
    if (design === undefined || design === null) {
      setIsClearConfirmOpen(false);
      return;
    }
    pushHistory(design);
    setDesign({
      ...design,
      grid: {
        ...design.grid,
        cells: createDefaultCells(design.grid.rows, design.grid.columns),
      },
    });
    setIsClearConfirmOpen(false);
  }

  const handleSetDesign = (newDesign: Design | null) => {
    // A newly created/opened design makes the old undo history meaningless.
    setHistory([]);
    setDesign(newDesign);
  }

  const handleDeleteDesign = (id: string) => {
    deleteDesign(id);

    // Deleting the design that's currently open can't leave it sitting in
    // memory - it would just get autosaved right back into the library on
    // the next edit. Swap in a fresh one instead.
    if (design && design.id === id) {
      setHistory([]);
      clearCurrentDesign();
      setDesign(createDefaultDesign());
    }
  }

  const handleOpenDesign = () => {
    setIsModalOpen(true);
    setAction('existing');
  };

  const handleNewDesign = () => {
    setIsModalOpen(true);
    setAction('new');
  }

  const handleSaveDesign = () => {
    setIsModalOpen(true);
    setAction('save');
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onOpenDesign={handleOpenDesign} 
        onNewDesign={handleNewDesign}
        onSaveDesign={handleSaveDesign}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          design={design}
          onSidebarChange={handleSidebarChange}
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onRequestClear={handleRequestClear}
          onCompleteRow={handleCompleteRow}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          onGridLineColorChange={handleGridLineColorChange}
          fillColor={fillColor}
          onFillColorChange={setFillColor}
        />
        <Canvas
          design={design}
          onGridTransformChange={handleGridTransformChange}
          onPhotoScaleChange={handlePhotoScaleChange}
          activeTool={activeTool}
          onCellFill={handleCellFill}
          onCellErase={handleCellErase}
          onPaintStart={handlePaintStart}
        />
        {
          isModalOpen &&
          <DesignModal
            action={action}
            design={design}
            setDesign={handleSetDesign}
            onSaveDesign={setDesign}
            onDeleteDesign={handleDeleteDesign}
            onClose={() => setIsModalOpen(false)} />
        }
        {
          isClearConfirmOpen &&
          <ConfirmDialog
            title="Clear the grid?"
            message="Are you sure you want to do this? Every square will be reset and this can't be undone."
            confirmLabel="Clear"
            onConfirm={handleConfirmClear}
            onCancel={() => setIsClearConfirmOpen(false)}
          />
        }
      </div>
    </div>
  )
}

export default App
