import { useRef, useEffect, useState } from 'react'
import { MIN_PHOTO_SCALE, MAX_PHOTO_SCALE } from '../types';
import type { Design } from '../types';
import type { Tool } from '../App';

type CanvasProps = {
    design: Design | null;
    onGridTransformChange: (offset: { x: number; y: number }, scale: number) => void;
    onPhotoScaleChange: (newScale: number) => void;
    activeTool: Tool;
    onCellFill: (index: number) => void;
    onCellErase: (index: number) => void;
    onPaintStart: () => void;
}

const CELLSIZE = 10; // size of each cell in pixels
const HANDLE_SIZE = 14; // size of the photo's resize handle, in canvas pixels
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 20;
const ZOOM_STEP = 1.2;
const MIN_CELL_SIZE_FOR_NUMBERS = 12; // below this, cell numbers are too small to read
const COMPLETED_ROW_COLOR = 'rgba(34, 197, 94, 0.35)'; // translucent green, like a highlighter

const BORDER_STYLE = {
    lineWidth: 1
};

// Picks black or white text depending on how light/dark the cell's fill
// color is, so the number stays legible on any color (including a filled
// black cell).
const getContrastTextColor = (color: string): string => {
    const hex = color.startsWith('#') ? color.slice(1) : null;
    if (!hex || (hex.length !== 3 && hex.length !== 6)) return '#000000';

    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);

    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 125 ? '#000000' : '#ffffff';
};

type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
};

type DragState = {
    mode: 'move' | 'resize' | 'fill' | 'erase';
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    startWidth: number;
    startScale: number;
};

export default function Canvas({ design, onGridTransformChange, onPhotoScaleChange, activeTool, onCellFill, onCellErase, onPaintStart }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);

    const [scale, setScale] = useState(1);
    const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
    const [hoverCursor, setHoverCursor] = useState<'default' | 'move' | 'nwse-resize' | 'crosshair'>('default');

    const photoData = design?.photo?.data ?? null;
    const gridOffset = design?.grid.offset ?? { x: 0, y: 0 };
    const gridScale = design?.grid.scale ?? 1;

    // The view-zoom-only cell size, used as a stable reference for the photo's
    // cover size and the grid's default footprint - independent of the grid's
    // own drag/resize transform, so repositioning the grid doesn't move the photo.
    const nominalCellSize = CELLSIZE * scale;
    const nominalGridWidth = (design?.grid.columns ?? 0) * nominalCellSize;
    const nominalGridHeight = (design?.grid.rows ?? 0) * nominalCellSize;

    // The grid's actual on-screen size/position, draggable and resizable by the user.
    const effectiveCellSize = nominalCellSize * gridScale;
    const gridRect: Rect = {
        left: gridOffset.x * scale,
        top: gridOffset.y * scale,
        width: (design?.grid.columns ?? 0) * effectiveCellSize,
        height: (design?.grid.rows ?? 0) * effectiveCellSize,
    };

    const getPhotoRect = (): Rect | null => {
        if (!design?.photo || !photoImage) return null;

        const cover = Math.max(nominalGridWidth / photoImage.width, nominalGridHeight / photoImage.height);
        const width = photoImage.width * cover * design.photo.scale;
        const height = photoImage.height * cover * design.photo.scale;
        // Anchored to the grid's top-left corner (plus any offset), so
        // growing the scale extends the photo down and to the right instead
        // of expanding it from the center.
        const left = design.photo.offset.x * scale;
        const top = design.photo.offset.y * scale;

        return { left, top, width, height };
    }

    const photoRect = getPhotoRect();

    // Bounding box around both the grid and the photo, so the canvas can grow
    // to show either one overflowing the other instead of clipping it.
    const getLayout = () => {
        const rects = photoRect ? [gridRect, photoRect] : [gridRect];

        const left = Math.min(...rects.map(r => r.left));
        const top = Math.min(...rects.map(r => r.top));
        const right = Math.max(...rects.map(r => r.left + r.width));
        const bottom = Math.max(...rects.map(r => r.top + r.height));

        return {
            canvasWidth: right - left,
            canvasHeight: bottom - top,
            // Shift so the bounding box starts at (0, 0) on the canvas.
            originX: -left,
            originY: -top,
        };
    }

    const { canvasWidth, canvasHeight, originX, originY } = getLayout();

    const canvasGridRect: Rect = {
        left: originX + gridRect.left,
        top: originY + gridRect.top,
        width: gridRect.width,
        height: gridRect.height,
    };

    const canvasPhotoRect: Rect | null = photoRect ? {
        left: originX + photoRect.left,
        top: originY + photoRect.top,
        width: photoRect.width,
        height: photoRect.height,
    } : null;

    const handleDrawCells = (ctx: CanvasRenderingContext2D) => {
        if (!design) return;

        for (let row = 0; row < design.grid.rows; row++) {
            for (let col = 0; col < design.grid.columns; col++) {
                let index = (row * design.grid.columns) + col;
                let style = design.grid.cells[index]?.color ? design.grid.cells[index].color : null;

                if (style) {
                    ctx.fillStyle = style;
                }
                else {
                    ctx.fillStyle = 'blue';
                }

                ctx.fillRect(canvasGridRect.left + col * effectiveCellSize, canvasGridRect.top + row * effectiveCellSize, effectiveCellSize, effectiveCellSize);
            }
        }
    }

    const handleDrawPhoto = (ctx: CanvasRenderingContext2D) => {
        if (!design?.photo || !photoImage || !photoRect) return;

        ctx.save();
        ctx.globalAlpha = design.opacity / 100;
        ctx.drawImage(photoImage, originX + photoRect.left, originY + photoRect.top, photoRect.width, photoRect.height);
        ctx.restore();
    }

    const handleDrawGridLines = (ctx: CanvasRenderingContext2D) => {
        if (!design) return;

        ctx.strokeStyle = design.grid.lineColor;
        ctx.lineWidth = BORDER_STYLE.lineWidth;
        for (let row = 0; row < design.grid.rows; row++) {
            for (let col = 0; col < design.grid.columns; col++) {
                ctx.strokeRect(canvasGridRect.left + col * effectiveCellSize, canvasGridRect.top + row * effectiveCellSize, effectiveCellSize, effectiveCellSize);
            }
        }
    }

    const handleDrawCellNumbers = (ctx: CanvasRenderingContext2D) => {
        if (!design || effectiveCellSize < MIN_CELL_SIZE_FOR_NUMBERS) return;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.floor(effectiveCellSize * 0.45)}px sans-serif`;

        for (let row = 0; row < design.grid.rows; row++) {
            for (let col = 0; col < design.grid.columns; col++) {
                const index = (row * design.grid.columns) + col;
                const cell = design.grid.cells[index];
                if (!cell) continue;

                const x = canvasGridRect.left + (col * effectiveCellSize) + (effectiveCellSize / 2);
                const y = canvasGridRect.top + (row * effectiveCellSize) + (effectiveCellSize / 2);

                ctx.fillStyle = getContrastTextColor(cell.color);
                ctx.fillText(String(cell.number), x, y);
            }
        }
    }

    // Highlights completed rows like a highlighter pen over a paper chart -
    // completion counts from the bottom row upward.
    const handleDrawCompletedRows = (ctx: CanvasRenderingContext2D) => {
        if (!design || design.grid.completedRows <= 0) return;

        ctx.fillStyle = COMPLETED_ROW_COLOR;
        for (let row = 0; row < design.grid.rows; row++) {
            const rowFromBottom = design.grid.rows - 1 - row;
            if (rowFromBottom >= design.grid.completedRows) continue;

            const y = canvasGridRect.top + (row * effectiveCellSize);
            ctx.fillRect(canvasGridRect.left, y, canvasGridRect.width, effectiveCellSize);
        }
    }

    const handleDrawResizeHandle = (ctx: CanvasRenderingContext2D) => {
        if (activeTool !== 'resize' || !canvasPhotoRect) return;

        const x = canvasPhotoRect.left + canvasPhotoRect.width - HANDLE_SIZE;
        const y = canvasPhotoRect.top + canvasPhotoRect.height - HANDLE_SIZE;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(x, y, HANDLE_SIZE, HANDLE_SIZE);
    }

    const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }

    const isOverHandle = (x: number, y: number) => {
        if (!canvasPhotoRect) return false;

        return x >= canvasPhotoRect.left + canvasPhotoRect.width - HANDLE_SIZE &&
            x <= canvasPhotoRect.left + canvasPhotoRect.width &&
            y >= canvasPhotoRect.top + canvasPhotoRect.height - HANDLE_SIZE &&
            y <= canvasPhotoRect.top + canvasPhotoRect.height;
    }

    const isOverGrid = (x: number, y: number) =>
        x >= canvasGridRect.left &&
        x <= canvasGridRect.left + canvasGridRect.width &&
        y >= canvasGridRect.top &&
        y <= canvasGridRect.top + canvasGridRect.height;

    // Which cell index (row-major) the given canvas point falls on, or null
    // if it's outside the grid.
    const getCellAt = (x: number, y: number): number | null => {
        if (!design || !isOverGrid(x, y)) return null;

        const col = Math.floor((x - canvasGridRect.left) / effectiveCellSize);
        const row = Math.floor((y - canvasGridRect.top) / effectiveCellSize);

        if (col < 0 || col >= design.grid.columns || row < 0 || row >= design.grid.rows) return null;

        return (row * design.grid.columns) + col;
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!design) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasPoint(e, canvas);

        if (activeTool === 'filler' || activeTool === 'eraser') {
            const index = getCellAt(x, y);
            if (index === null) return;

            // One history checkpoint per stroke (not per cell it passes over).
            onPaintStart();

            if (activeTool === 'filler') onCellFill(index);
            else onCellErase(index);

            canvas.setPointerCapture(e.pointerId);
            dragRef.current = {
                mode: activeTool === 'filler' ? 'fill' : 'erase',
                pointerId: e.pointerId,
                startX: x,
                startY: y,
                startOffsetX: gridOffset.x,
                startOffsetY: gridOffset.y,
                startWidth: gridRect.width,
                startScale: gridScale,
            };
            return;
        }

        if (activeTool === 'resize') {
            if (!design.photo || !photoRect || !isOverHandle(x, y)) return;

            canvas.setPointerCapture(e.pointerId);
            dragRef.current = {
                mode: 'resize',
                pointerId: e.pointerId,
                startX: x,
                startY: y,
                startOffsetX: design.photo.offset.x,
                startOffsetY: design.photo.offset.y,
                startWidth: photoRect.width,
                startScale: design.photo.scale,
            };
            return;
        }

        if (!isOverGrid(x, y)) return;

        canvas.setPointerCapture(e.pointerId);
        dragRef.current = {
            mode: 'move',
            pointerId: e.pointerId,
            startX: x,
            startY: y,
            startOffsetX: gridOffset.x,
            startOffsetY: gridOffset.y,
            startWidth: gridRect.width,
            startScale: gridScale,
        };
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!design) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasPoint(e, canvas);
        const drag = dragRef.current;

        if (!drag) {
            if (activeTool === 'filler' || activeTool === 'eraser') setHoverCursor(isOverGrid(x, y) ? 'crosshair' : 'default');
            else if (activeTool === 'resize') setHoverCursor(isOverHandle(x, y) ? 'nwse-resize' : 'default');
            else setHoverCursor(isOverGrid(x, y) ? 'move' : 'default');
            return;
        }

        if (drag.mode === 'fill' || drag.mode === 'erase') {
            const index = getCellAt(x, y);
            if (index !== null) {
                if (drag.mode === 'fill') onCellFill(index);
                else onCellErase(index);
            }
            return;
        }

        const dx = x - drag.startX;
        const dy = y - drag.startY;

        if (drag.mode === 'move') {
            onGridTransformChange(
                { x: drag.startOffsetX + dx / scale, y: drag.startOffsetY + dy / scale },
                gridScale,
            );
        } else {
            // Photo resize: grow/shrink from its center, same as the sidebar slider.
            const newWidth = Math.max(drag.startWidth + dx, 1);
            const newScale = Math.min(Math.max((drag.startScale * newWidth) / drag.startWidth, MIN_PHOTO_SCALE), MAX_PHOTO_SCALE);
            onPhotoScaleChange(newScale);
        }
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas?.hasPointerCapture(e.pointerId)) {
            canvas.releasePointerCapture(e.pointerId);
        }
        dragRef.current = null;
    }

    // Pointer capture keeps move/up events coming to the canvas even once the
    // cursor crosses its edge mid-drag, so leaving the canvas should only
    // reset the hover cursor hint, never cut an in-progress drag short.
    const handlePointerLeave = () => {
        if (!dragRef.current) setHoverCursor('default');
    }

    const handleZoomIn = () => setScale(prev => Math.min(prev * ZOOM_STEP, MAX_ZOOM));
    const handleZoomOut = () => setScale(prev => Math.max(prev / ZOOM_STEP, MIN_ZOOM));
    const handleZoomReset = () => setScale(1);

    useEffect(() => {
        if (!photoData) {
            setPhotoImage(null);
            return;
        }

        const image = new Image();
        let cancelled = false;

        image.onload = () => {
            if (!cancelled) setPhotoImage(image);
        };
        image.src = photoData;

        return () => { cancelled = true; };
    }, [photoData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleDrawCells(ctx);
        handleDrawPhoto(ctx);
        handleDrawGridLines(ctx);
        handleDrawCellNumbers(ctx);
        handleDrawCompletedRows(ctx);
        handleDrawResizeHandle(ctx);

    }, [scale, design?.grid, design?.opacity, design?.photo, photoImage, effectiveCellSize, canvasWidth, canvasHeight, activeTool]);

    if (!design) return null;

    return (
        <div className="canvas-backdrop relative flex-1 overflow-hidden">
            <div ref={containerRef} className="thin-scrollbar h-full w-full overflow-auto p-8">
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{ cursor: hoverCursor }}
                    className="rounded-sm shadow-lg shadow-pink-200/50 ring-1 ring-pink-200/50"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                />
            </div>
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full border-2 border-pink-100 bg-white/90 px-2 py-1 shadow-md shadow-pink-100 backdrop-blur-sm">
                <button
                    type="button"
                    onClick={handleZoomOut}
                    aria-label="Zoom out"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-semibold text-purple-500 transition-colors hover:bg-pink-50"
                >
                    −
                </button>
                <button
                    type="button"
                    onClick={handleZoomReset}
                    aria-label="Reset zoom"
                    className="min-w-[3rem] rounded-full px-1 py-1 text-center text-sm font-semibold text-purple-500 transition-colors hover:bg-pink-50"
                >
                    {Math.round(scale * 100)}%
                </button>
                <button
                    type="button"
                    onClick={handleZoomIn}
                    aria-label="Zoom in"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-semibold text-purple-500 transition-colors hover:bg-pink-50"
                >
                    +
                </button>
            </div>
        </div>
    )
}
