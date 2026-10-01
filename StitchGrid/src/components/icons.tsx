type IconProps = {
    className?: string;
}

const DEFAULT_SIZE = 'h-4 w-4';

const svgProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

export function EraserIcon({ className = DEFAULT_SIZE }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
            <rect x="7" y="9" width="14" height="8" rx="2" transform="rotate(-45 12 12)" />
            <line x1="7.5" y1="16.5" x2="11.5" y2="20.5" />
        </svg>
    );
}

export function FillIcon({ className = DEFAULT_SIZE }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
            <path d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z" />
        </svg>
    );
}

export function ResizeIcon({ className = DEFAULT_SIZE }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
        </svg>
    );
}

export function CheckIcon({ className = DEFAULT_SIZE }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
            <path d="M5 12l4 4 10-10" />
        </svg>
    );
}

export function UndoIcon({ className = DEFAULT_SIZE }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
            <path d="M9 14l-4-4 4-4" />
            <path d="M5 10h9a5 5 0 0 1 0 10h-1" />
        </svg>
    );
}

export function TrashIcon({ className = DEFAULT_SIZE }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
            <path d="M4 7h16" />
            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
            <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    );
}
