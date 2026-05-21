import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
    const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2';
    
    const variants = {
        default: 'border-transparent bg-indigo-650 text-white dark:bg-indigo-600',
        secondary: 'border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
        destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
        outline: 'border-gray-200 text-gray-950 dark:border-gray-800 dark:text-gray-50',
        success: 'border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
        warning: 'border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    };

    return (
        <span
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        />
    );
}
