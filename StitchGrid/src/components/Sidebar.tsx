
import Button from './Button';

type SidebarProps = {
    x: number;
    y: number;
    opacity: number;
    onXChange: (x: number) => void;
    onYChange: (y: number) => void;
    onOpacityChange: (opacity: number) => void;
};

export default function Sidebar({ x, y, opacity, onXChange, onYChange, onOpacityChange }: SidebarProps) {
    return (
        <div className="flex flex-col gap-4 p-4 w-64 bg-gray-100">
            <Button variant="secondary">Eraser</Button>
            <Button variant="secondary">Filler</Button>
            <p>Grid Size</p>
            <div className="flex gap-2">
                <label htmlFor="x">X</label>
                <input
                    type="text"
                    id="x"
                    defaultValue={x}
                    inputMode="numeric"
                    onChange={(e) => onXChange(Number(e.target.value))}
                    className="w-12"
                />
                <label htmlFor="y">Y</label>
                <input
                    type="text"
                    id="y"
                    defaultValue={y}
                    inputMode="numeric"
                    onChange={(e) => onYChange(Number(e.target.value))}
                    className="w-12"
                />
            </div>
            <Button variant="secondary">Resize</Button>
            <Button variant="secondary">Toggle Image</Button>
            <label htmlFor="opacity">Opacity</label>
            <input
                type="range"
                id="opacity"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange(Number(e.target.value))}
                className="w-full"
            /> 
            <Button variant="secondary">Complete Row</Button>
            <Button variant="secondary">Undo</Button>
        </div>
    )
}