import { useState } from 'react';

import Button from '../components/Button';
import type { Cell, Design } from '../types';

type NewDesignProps = {
    setDesign: (design: Design | null) => void;
}

const CELL_DEFAULT_COLOR = '#ffffff';

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

        const cells: Cell[] = Array.from({ length: rows * columns }, () => ({
            color: CELL_DEFAULT_COLOR,
            number: 0,
        }));

        const design: Design = {
            name: name.trim(),
            version: 1,
            grid: { rows, columns, cells },
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

    const inputStyles = 'rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none';

    return (
        <div>
            <h2 className="mb-4 text-xl font-semibold">Create New Design</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
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
                <fieldset className="flex gap-4">
                    <legend className="mb-1">Grid Size</legend>
                    <label className="flex flex-1 flex-col gap-1 text-sm text-gray-600">
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
                    <label className="flex flex-1 flex-col gap-1 text-sm text-gray-600">
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
                </fieldset>
                <label className="flex flex-col gap-1">
                    Photo (optional)
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:font-medium hover:file:bg-gray-300"
                    />
                </label>
                <div className="mt-2 flex justify-end">
                    <Button type="submit">Create Design</Button>
                </div>
            </form>
        </div>
    )
}
