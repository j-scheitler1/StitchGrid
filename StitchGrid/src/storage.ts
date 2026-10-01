import type { Design } from './types';

const LIBRARY_KEY = 'stitchgrid:library';
const CURRENT_ID_KEY = 'stitchgrid:current-id';

type Library = Record<string, Design>;

// Best-effort browser persistence for every design you've worked on, the
// way Excalidraw keeps your scenes in localStorage. Every call is wrapped
// in try/catch since localStorage can throw (private browsing, storage
// disabled/full).

const readLibrary = (): Library => {
    try {
        const raw = localStorage.getItem(LIBRARY_KEY);
        if (!raw) return {};
        return JSON.parse(raw) as Library;
    } catch {
        return {};
    }
};

const writeLibrary = (library: Library): void => {
    try {
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {
        // Saving is best-effort; skip it rather than crash the app.
    }
};

// Saves/updates this design in the browser's design library, and remembers
// it as the one to reopen automatically next time StitchGrid loads.
export const saveDesign = (design: Design): void => {
    const library = readLibrary();
    library[design.id] = design;
    writeLibrary(library);

    try {
        localStorage.setItem(CURRENT_ID_KEY, design.id);
    } catch {
        // Best-effort.
    }
};

// Every design saved in this browser, for "Open Design" to list.
export const listSavedDesigns = (): Design[] => {
    return Object.values(readLibrary());
};

// The design that was open last time, if any.
export const loadCurrentDesign = (): Design | null => {
    try {
        const id = localStorage.getItem(CURRENT_ID_KEY);
        if (!id) return null;
        return readLibrary()[id] ?? null;
    } catch {
        return null;
    }
};

// Forgets which design was last open, without deleting it from the library.
export const clearCurrentDesign = (): void => {
    try {
        localStorage.removeItem(CURRENT_ID_KEY);
    } catch {
        // Best-effort.
    }
};

export const deleteDesign = (id: string): void => {
    const library = readLibrary();
    delete library[id];
    writeLibrary(library);
};
