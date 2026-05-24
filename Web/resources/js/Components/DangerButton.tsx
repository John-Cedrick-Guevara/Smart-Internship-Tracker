import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-[var(--danger)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-out hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--danger)] active:scale-[0.97] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
