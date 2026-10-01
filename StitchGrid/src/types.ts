export const DEFAULT_CELL_COLOR = '#ffffff';
export const DEFAULT_GRID_LINE_COLOR = '#000000';
export const MIN_PHOTO_SCALE = 0.2;
export const MAX_PHOTO_SCALE = 4;

export type Cell = {
    color: string;
    number: number;
}

// Row cell numbers for a grid, like a cross-stitch counting chart: each row
// is scanned in an alternating direction (the bottom row left to right, the
// row above it right to left, and so on up the grid), and the count resets
// to 1 every time the color changes from the previous cell in that scan -
// so it shows "how many stitches of this color in a row" rather than a
// plain position.
export const computeCellNumbers = (cells: Cell[], rows: number, columns: number): number[] => {
    const numbers = new Array(rows * columns).fill(1);

    for (let row = 0; row < rows; row++) {
        const rowFromBottom = rows - 1 - row;
        const leftToRight = rowFromBottom % 2 === 0;

        let previousColor: string | null = null;
        let runCount = 0;

        for (let step = 0; step < columns; step++) {
            const col = leftToRight ? step : (columns - 1 - step);
            const index = (row * columns) + col;
            const color = cells[index]?.color ?? DEFAULT_CELL_COLOR;

            runCount = color === previousColor ? runCount + 1 : 1;
            numbers[index] = runCount;
            previousColor = color;
        }
    }

    return numbers;
};

export const createDefaultCells = (rows: number, columns: number): Cell[] => {
    const cells = Array.from({ length: rows * columns }, () => ({ color: DEFAULT_CELL_COLOR, number: 0 }));
    const numbers = computeCellNumbers(cells, rows, columns);
    return cells.map((cell, i) => ({ ...cell, number: numbers[i] }));
};

export type Grid = {
    rows: number;
    columns: number;
    cells: Cell[];
    // Position of the grid overlay relative to the photo, draggable on the
    // canvas. offset is in unscaled pixels. scale multiplies the base cell
    // size; nothing currently drives it away from 1, but it's kept so the
    // grid's rendered size stays a simple function of rows/columns/scale.
    offset: {
        x: number;
        y: number;
    };
    scale: number;
    // How many rows, counted from the bottom row upward, have been marked
    // complete via the "Complete Row" button.
    completedRows: number;
    // Color of the grid lines, user-adjustable so they can be made to
    // contrast with whatever colors fill the cells.
    lineColor: string;
}

export type Photo = {
    data: string; // base64 date URL
    fit: 'cover';
    scale: number;
    offset: {
        x: number;
        y: number;
    }
}

export type Design = {
    id: string;
    grid: Grid;
    opacity: number;
    photo?: Photo;
    version: number;
    name: string;
}

// A stable, unique id for a design, so the same design can be found again
// in browser storage (for "Open Design") even if it's renamed.
export const createDesignId = (): string => {
    try {
        return crypto.randomUUID();
    } catch {
        return `design-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
};