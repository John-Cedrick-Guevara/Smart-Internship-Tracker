import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-out focus:outline-none ' +
                (active
                    ? 'border-[var(--accent)] text-[var(--text)] focus:border-[var(--accent)]'
                    : 'border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:text-[var(--text)] focus:border-[var(--line)] focus:text-[var(--text)]') +
                className
            }
        >
            {children}
        </Link>
    );
}
