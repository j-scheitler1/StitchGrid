import { useState } from 'react';

import Button from '../components/Button';
import type { Design } from '../types';

type SaveDesignProps = {
    design: Design;
    onSave: (design: Design) => void;
}

export default function SaveDesign({ design, onSave }: SaveDesignProps) {
    const [name, setName] = useState(design.name);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        onSave({ ...design, name: name.trim() || design.name });
    };

    const inputStyles = 'rounded-xl border-2 border-purple-200 px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100';

    return (
        <div>
            <h2 className="font-heading mb-5 text-xl font-bold text-gray-900">💾 Save Design</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                    Design Name
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputStyles}
                    />
                </label>
                <p className="rounded-xl bg-purple-50 px-3 py-2.5 text-sm text-purple-900">
                    🧷 Your design is saved automatically to this browser as you work, so it'll still
                    be here next time you open StitchGrid. Saving here just confirms it and lets
                    you rename it.
                </p>
                <div className="mt-2 flex justify-end border-t border-pink-100 pt-5">
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </div>
    )
}
