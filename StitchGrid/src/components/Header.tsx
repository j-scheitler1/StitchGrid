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
        <header className="flex items-center justify-between gap-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 via-white to-purple-50 px-6 py-3 shadow-sm">
            <div className="flex items-center gap-2.5">
                <span className="hover-wiggle grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 text-base shadow-sm shadow-pink-200">
                    🧵
                </span>
                <h1 className="font-heading bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                    StitchGrid
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={onOpenDesign}>Open Design</Button>
                <Button variant="secondary" onClick={onNewDesign}>New Design</Button>
                <Button onClick={onSaveDesign}>Save Design</Button>
            </div>
        </header>
    )
}
