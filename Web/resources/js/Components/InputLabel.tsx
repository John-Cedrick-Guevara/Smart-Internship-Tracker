import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `themed-label block text-sm font-semibold ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
