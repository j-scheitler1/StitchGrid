import NewDesign from "../forms/NewDesign";
import SaveDesign from "../forms/SaveDesign";
import OpenDesign from "../forms/OpenDesign";
import type { Design } from "../types";

type DesignModalProps = {
    action: 'existing' | 'new' | 'save' | null;
    design: Design | null;
    setDesign: (design: Design | null) => void;
    onSaveDesign: (design: Design) => void;
    onDeleteDesign: (id: string) => void;
    onClose: () => void;
}

export default function DesignModal({
    action,
    design,
    setDesign,
    onSaveDesign,
    onDeleteDesign,
    onClose
}: DesignModalProps) {

    /**
     * TODO
     *  - Add validation for each form
     *  - Add error handling for each form
     *  - Add loading state for each form
     *  - Add success state for each form
     *  - Add cancel button for each form
     */

    const renderContent = () => {
        switch (action) {
            case 'existing':
                return (
                    <OpenDesign
                        currentDesignId={design?.id}
                        onSelect={(selected) => {
                            setDesign(selected);
                            onClose();
                        }}
                        onDelete={onDeleteDesign}
                    />
                );
            case 'new':
                return (
                    <NewDesign
                        setDesign={(design) => {
                            setDesign(design);
                            onClose();
                        }}
                    />
                );
            case 'save':
                return design ? (
                    <SaveDesign
                        design={design}
                        onSave={(updated) => {
                            onSaveDesign(updated);
                            onClose();
                        }}
                    />
                ) : null;
            default:
                return null;
        }
    }

    return (
        <div
            onClick={onClose}
            className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-modal-in thin-scrollbar relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-pink-100 bg-white p-6 shadow-2xl shadow-pink-100"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-purple-300 transition-colors hover:bg-purple-50 hover:text-purple-500"
                >
                    ✕
                </button>
                {renderContent()}
            </div>
        </div>
    );
}