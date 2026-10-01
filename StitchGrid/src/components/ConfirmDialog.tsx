import Button from './Button';

type ConfirmDialogProps = {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Confirm',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <div
            onClick={onCancel}
            className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-modal-in w-full max-w-sm rounded-3xl border-2 border-rose-100 bg-white p-6 shadow-2xl shadow-rose-100"
            >
                <h2 className="font-heading mb-2 text-lg font-bold text-gray-900">{title}</h2>
                <p className="mb-6 text-sm text-gray-600">{message}</p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    );
}
