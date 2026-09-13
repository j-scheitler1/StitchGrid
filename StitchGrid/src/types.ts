export type Cell = {
    color: string;
    number: number;
}

export type Grid = {
    rows: number;
    columns: number;
    cells: Cell[];
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
    grid: Grid;
    photo?: Photo;
    version: number;
    name: string;
}   