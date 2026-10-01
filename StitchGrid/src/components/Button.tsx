type ButtonProps = {
    variant?: 'primary' | 'secondary' | 'danger';
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

const variantStyles = {
    primary: 'bg-pink-500 text-white shadow-sm shadow-pink-200 hover:bg-pink-600',
    secondary: 'bg-purple-100 text-purple-900 hover:bg-purple-200',
    danger: 'bg-rose-500 text-white shadow-sm shadow-rose-200 hover:bg-rose-600'
};

export default function Button({
    variant = 'primary',
    type = 'button',
    disabled,
    onClick,
    children
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]}`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}