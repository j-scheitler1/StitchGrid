import Button from "./Button";

type HeaderProps = {
    onOpenDesign: () => void;
    onNewDesign: () => void;
    onSaveDesign: () => void;
}

export default function Header({ 
    onOpenDesign, 
    onNewDesign, 
    onSaveDesign 
}: HeaderProps) {
    return (
        <header className="flex justify-end-safe gap-10 p-4 bg-gray-100">
            <Button onClick={onOpenDesign}>Open Design</Button>
            <Button onClick={onNewDesign}>New Design</Button>
            <Button onClick={onSaveDesign}>Save Design</Button>
        </header>
    )
}