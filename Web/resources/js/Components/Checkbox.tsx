import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[var(--line)] bg-[var(--surface-strong)] text-[var(--accent)] shadow-sm focus:ring-[var(--accent)] focus:ring-offset-0 ' +
                className
            }
        />
    );
}
