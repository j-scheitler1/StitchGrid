type ButtonProps = {
    variant?: 'primary' | 'secondary';
    type?: 'button' | 'submit';
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

const baseStyles = 'rounded-full px-4 py-2 font-medium';

const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
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