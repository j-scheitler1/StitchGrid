import NewDesign from "../forms/NewDesign";
import type { Design } from "../types";

type DesignModalProps = {
    action: 'existing' | 'new' | 'save' | null;
    setDesign: (design: Design | null) => void;
    onClose: () => void;
}

export default function DesignModal({
    action,
    setDesign,
    onClose
}: DesignModalProps) {

    /**
     * TODO
     *  - Handle functionality for each action type
     *  - Add form for new design (name, grid size, photo)
     *  - Add form for existing design (file input)
     *  - Add form for save design (file output)
     *  - Add validation for each form
     *  - Add error handling for each form
     *  - Add loading state for each form
     *  - Add success state for each form
     *  - Add cancel button for each form
     *  - Add close button for modal
     *  - Add overlay for modal
     */

    const renderContent = () => {
        switch (action) {
            case 'existing':
                return <p>Open Existing Design</p>;
            case 'new':
                return <NewDesign setDesign={setDesign} />;
            case 'save':
                return <p>Save Design</p>;
            default:
                return null;
        }
    }

    return (
        <>
            <div
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                >
                    {renderContent()}
                </div>
            </div>
        </>
    );
}