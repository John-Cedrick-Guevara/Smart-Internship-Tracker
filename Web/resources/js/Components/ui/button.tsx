import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
        
        const variants = {
            default: 'bg-indigo-600 text-white shadow hover:bg-indigo-700 dark:bg-indigo-650 dark:hover:bg-indigo-700 shadow-indigo-500/10',
            destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
            outline: 'border border-gray-200 bg-white hover:bg-gray-55 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-950 text-gray-700 dark:text-gray-300',
            secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-750',
            ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-850 dark:hover:text-gray-100 text-gray-500 dark:text-gray-400',
            link: 'text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400',
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
