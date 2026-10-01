import { useState } from 'react';

import Button from '../components/Button';
import { createDefaultCells, createDesignId, DEFAULT_GRID_LINE_COLOR } from '../types';
import type { Design } from '../types';

type NewDesignProps = {
    setDesign: (design: Design | null) => void;
}

export default function NewDesign({ setDesign }: NewDesignProps) {
    const [name, setName] = useState('');
    const [rows, setRows] = useState(20);
    const [columns, setColumns] = useState(20);
    const [photoData, setPhotoData] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setPhotoData(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setPhotoData(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();

        const cells = createDefaultCells(rows, columns);

        const design: Design = {
            id: createDesignId(),
            name: name.trim(),
            opacity: 100,
            version: 1,
            grid: { rows, columns, cells, offset: { x: 0, y: 0 }, scale: 1, completedRows: 0, lineColor: DEFAULT_GRID_LINE_COLOR },
            ...(photoData && {
                photo: {
                    data: photoData,
                    fit: 'cover' as const,
                    scale: 1,
                    offset: { x: 0, y: 0 },
                },
            }),
        };
        setDesign(design);
    };

    const inputStyles = 'rounded-xl border-2 border-purple-200 px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100';
    const labelStyles = 'flex flex-col gap-1.5 text-sm font-medium text-gray-700';

    return (
        <div>
            <h2 className="font-heading mb-5 text-xl font-bold text-gray-900">✨ Create New Design</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <label className={labelStyles}>
                    Design Name
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My design"
                        className={inputStyles}
                    />
                </label>
                <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-sm font-medium text-gray-700">Grid Size</legend>
                    <div className="flex gap-4">
                        <label className={`flex-1 ${labelStyles}`}>
                            Columns (X)
                            <input
                                type="number"
                                required
                                min={1}
                                max={200}
                                value={columns}
                                onChange={(e) => setColumns(Number(e.target.value))}
                                className={inputStyles}
                            />
                        </label>
                        <label className={`flex-1 ${labelStyles}`}>
                            Rows (Y)
                            <input
                                type="number"
                                required
                                min={1}
                                max={200}
                                value={rows}
                                onChange={(e) => setRows(Number(e.target.value))}
                                className={inputStyles}
                            />
                        </label>
                    </div>
                </fieldset>
                <label className={labelStyles}>
                    Photo (optional)
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-900 file:transition-colors hover:file:bg-purple-200"
                    />
                </label>
                <div className="mt-2 flex justify-end border-t border-pink-100 pt-5">
                    <Button type="submit">Create Design</Button>
                </div>
            </form>
        </div>
    )
}
