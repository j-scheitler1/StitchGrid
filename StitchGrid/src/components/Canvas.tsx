import { useRef, useEffect, useState } from 'react'

type CanvasProps = {
    rows: number;
    columns: number;
}

const CELLSIZE = 20; // size of each cell in pixels

export default function Canvas({ rows, columns }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [scale, setScale] = useState(1);
    const effectiveCellSize = CELLSIZE * scale; // effective size of each cell after scaling

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            setScale(prev => {
                const newScale = prev * Math.exp(-e.deltaY * 0.002);
                return Math.min(Math.max(0.5, newScale), 20);
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        console.log(`Drawing grid with ${rows} rows and ${columns} columns at scale ${scale}`);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, 0, columns * effectiveCellSize, rows * effectiveCellSize);
    }, [scale, rows, columns, effectiveCellSize]);

    /**
     * Drawing Methods
     *  - fillRect(x, y, width, height)
     *  - strokeRect(x, y, width, height)
     *  - drawImage(image, x, y, width, height)
     *  - clearRect(x, y, width, height)
     */

    return (
        <div ref={containerRef} className="flex-1 overflow-auto">
            <canvas
                ref={canvasRef}
                width={columns * effectiveCellSize}
                height={rows * effectiveCellSize}
            />
        </div>
    )
}