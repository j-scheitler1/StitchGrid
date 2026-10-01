import type { Design } from '../types';
import type { Tool } from '../App';
import Button from './Button';
import { EraserIcon, FillIcon, ResizeIcon, CheckIcon, UndoIcon, TrashIcon } from './icons';

type SidebarProps = {
    design: Design | null;
    onSidebarChange: (newX: number, newY: number, newOpacity: number) => void;
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
    onRequestClear: () => void;
    onCompleteRow: () => void;
    onUndo: () => void;
    canUndo: boolean;
    onGridLineColorChange: (color: string) => void;
    fillColor: string;
    onFillColorChange: (color: string) => void;
}

const sectionTitleStyles = 'font-heading text-xs font-bold uppercase tracking-wide text-pink-400';
const sectionStyles = 'flex flex-col gap-3 border-t border-pink-100 pt-5 first:border-t-0 first:pt-0';
const numberInputStyles = 'w-14 rounded-xl border-2 border-purple-200 bg-white px-2 py-1.5 text-center text-sm font-semibold text-purple-900 focus:border-pink-400 focus:outline-none';
const swatchStyles = 'h-9 w-9 shrink-0 cursor-pointer rounded-xl border-2 border-purple-200 bg-white p-0.5';
const rowLabelStyles = 'flex items-center justify-between gap-3 text-sm text-gray-600';

export default function Sidebar({
    design,
    onSidebarChange,
    activeTool,
    onToolChange,
    onRequestClear,
    onCompleteRow,
    onUndo,
    canUndo,
    onGridLineColorChange,
    fillColor,
    onFillColorChange,
}: SidebarProps) {
    if (!design) return null;

    return (
        <aside className="flex w-72 flex-col gap-5 overflow-y-auto border-r border-pink-100 bg-gradient-to-b from-purple-50/60 via-white to-pink-50/60 p-5">
            <section className={sectionStyles}>
                <h3 className={sectionTitleStyles}>🎨 Tools</h3>
                <Button
                    variant={activeTool === 'eraser' ? 'primary' : 'secondary'}
                    onClick={() => onToolChange('eraser')}
                >
                    <EraserIcon />
                    Eraser
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        variant={activeTool === 'filler' ? 'primary' : 'secondary'}
                        onClick={() => onToolChange('filler')}
                    >
                        <FillIcon />
                        Filler
                    </Button>
                    <input
                        type="color"
                        aria-label="Fill color"
                        value={fillColor}
                        onChange={(e) => onFillColorChange(e.target.value)}
                        className={swatchStyles}
                    />
                </div>
            </section>

            <section className={sectionStyles}>
                <h3 className={sectionTitleStyles}>📐 Grid</h3>
                <div className="flex items-center gap-4">
                    <label htmlFor="x" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        X
                        <input
                            type="text"
                            id="x"
                            value={design.grid.columns}
                            inputMode="numeric"
                            onChange={(e) => onSidebarChange(Number(e.target.value), design.grid.rows, design.opacity)}
                            className={numberInputStyles}
                        />
                    </label>
                    <label htmlFor="y" className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        Y
                        <input
                            type="text"
                            id="y"
                            value={design.grid.rows}
                            inputMode="numeric"
                            onChange={(e) => onSidebarChange(design.grid.columns, Number(e.target.value), design.opacity)}
                            className={numberInputStyles}
                        />
                    </label>
                </div>
                <label htmlFor="grid-line-color" className={rowLabelStyles}>
                    Line Color
                    <input
                        type="color"
                        id="grid-line-color"
                        value={design.grid.lineColor}
                        onChange={(e) => onGridLineColorChange(e.target.value)}
                        className={swatchStyles}
                    />
                </label>
            </section>

            {
                design.photo &&
                <section className={sectionStyles}>
                    <h3 className={sectionTitleStyles}>🖼️ Image</h3>
                    <Button
                        variant={activeTool === 'resize' ? 'primary' : 'secondary'}
                        onClick={() => onToolChange('resize')}
                    >
                        <ResizeIcon />
                        Resize
                    </Button>
                    <label htmlFor="opacity" className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        Opacity
                        <input
                            type="range"
                            id="opacity"
                            min="0"
                            max="100"
                            value={design.opacity}
                            onChange={(e) => onSidebarChange(design.grid.columns, design.grid.rows, Number(e.target.value))}
                            className="w-full accent-pink-500"
                        />
                    </label>
                </section>
            }

            <section className={sectionStyles}>
                <h3 className={sectionTitleStyles}>✅ Progress</h3>
                <Button
                    variant="secondary"
                    onClick={onCompleteRow}
                    disabled={design.grid.completedRows >= design.grid.rows}
                >
                    <CheckIcon />
                    Complete Row ({design.grid.completedRows}/{design.grid.rows})
                </Button>
                <Button variant="secondary" onClick={onUndo} disabled={!canUndo}>
                    <UndoIcon />
                    Undo
                </Button>
            </section>

            <section className={`${sectionStyles} mt-auto`}>
                <Button variant="danger" onClick={onRequestClear}>
                    <TrashIcon />
                    Clear Grid
                </Button>
            </section>
        </aside>
    )
}
