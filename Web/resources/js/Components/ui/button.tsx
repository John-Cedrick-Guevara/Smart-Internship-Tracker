import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
        
        const variants = {
            default: 'bg-[linear-gradient(135deg,var(--accent),var(--accent-soft))] text-[var(--accent-contrast)] shadow-[0_18px_42px_color-mix(in_srgb,var(--accent)_20%,transparent)] hover:brightness-105',
            destructive: 'bg-[var(--danger)] text-white shadow-sm hover:brightness-110',
            outline: 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted-strong)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]',
            secondary: 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]',
            ghost: 'text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--text)]',
            link: 'text-[var(--accent)] underline-offset-4 hover:underline',
        };

        const sizes = {
            default: 'h-10 px-4 py-2',
            sm: 'h-8 rounded-lg px-3 text-xs',
            lg: 'h-11 rounded-2xl px-8',
            icon: 'h-9 w-9 p-1',
        };

        const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
