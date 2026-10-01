import { useState } from 'react';

import { listSavedDesigns } from '../storage';
import type { Design } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import { TrashIcon } from '../components/icons';

type OpenDesignProps = {
    currentDesignId?: string;
    onSelect: (design: Design) => void;
    onDelete: (id: string) => void;
}

export default function OpenDesign({ currentDesignId, onSelect, onDelete }: OpenDesignProps) {
    const [designs, setDesigns] = useState(() => listSavedDesigns());
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const pendingDesign = designs.find((d) => d.id === pendingDeleteId) ?? null;
    const sorted = [...designs].sort((a, b) => a.name.localeCompare(b.name));

    const handleConfirmDelete = () => {
        if (!pendingDeleteId) return;

        onDelete(pendingDeleteId);
        setDesigns((prev) => prev.filter((d) => d.id !== pendingDeleteId));
        setPendingDeleteId(null);
    };

    return (
        <div>
            <h2 className="font-heading mb-4 text-xl font-bold text-gray-900">📂 Open Design</h2>
            {
                sorted.length === 0 ? (
                    <p className="rounded-xl bg-purple-50 px-3 py-4 text-center text-sm text-purple-900">
                        No saved designs yet. Create one and save it to see it here. 🌸
                    </p>
                ) : (
                    <ul className="thin-scrollbar flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
                        {sorted.map((design) => {
                            const isCurrent = design.id === currentDesignId;
                            return (
                                <li key={design.id} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onSelect(design)}
                                        className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-colors hover:bg-pink-50 ${isCurrent ? 'border-pink-400 bg-pink-50' : 'border-purple-100'}`}
                                    >
                                        <p className="font-medium text-gray-900">
                                            {design.name}
                                            {isCurrent && (
                                                <span className="ml-2 text-xs font-normal text-pink-500">(currently open)</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {design.grid.columns} × {design.grid.rows}
                                            {design.photo && ' · with photo'}
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPendingDeleteId(design.id)}
                                        aria-label={`Delete ${design.name}`}
                                        className="shrink-0 rounded-xl border-2 border-purple-100 p-2.5 text-gray-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500"
                                    >
                                        <TrashIcon />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )
            }
            {
                pendingDesign &&
                <ConfirmDialog
                    title="Delete this design?"
                    message={`Are you sure you want to delete "${pendingDesign.name}"? This can't be undone.`}
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setPendingDeleteId(null)}
                />
            }
        </div>
    )
}
