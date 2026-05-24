import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] focus:border-[var(--accent)]'
                    : 'border-transparent text-[var(--muted-strong)] hover:border-[var(--line)] hover:bg-[color-mix(in_srgb,var(--surface-strong)_58%,transparent)] hover:text-[var(--text)] focus:border-[var(--line)] focus:bg-[color-mix(in_srgb,var(--surface-strong)_58%,transparent)] focus:text-[var(--text)]'
            } text-base font-medium transition duration-150 ease-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
