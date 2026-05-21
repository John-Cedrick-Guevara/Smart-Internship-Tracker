import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type = 'text', ...props }, ref) => {
        return (
            <input
                type={type}
                className={
                    'flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-650 dark:focus:ring-indigo-650 ' +
                    className
                }
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';
