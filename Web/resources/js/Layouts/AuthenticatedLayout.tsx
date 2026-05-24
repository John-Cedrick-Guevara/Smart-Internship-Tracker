import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useTheme } from '@/hooks/useTheme';
import { Link, usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const { theme, toggleTheme } = useTheme();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="app-layout">
            <nav className="app-nav">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-3">
                                    <span className="logo-mark size-10 rounded-xl">
                                        <ApplicationLogo className="block h-6 w-auto fill-current" />
                                    </span>
                                    <span className="hidden sm:block">
                                        <span className="block text-sm font-semibold tracking-[-0.02em] text-[var(--text)]">
                                            AMN Tracker
                                        </span>
                                        <span className="block text-xs text-[var(--muted)]">
                                            Application pipeline
                                        </span>
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('internships.list')}
                                    active={route().current('internships.list')}
                                >
                                    Internships
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden gap-3 sm:ms-6 sm:flex sm:items-center">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="theme-toggle"
                                aria-label={`Switch to ${
                                    theme === 'dark' ? 'light' : 'dark'
                                } mode`}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                                {theme === 'dark' ? 'Light' : 'Dark'}
                            </button>
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="ghost-pill rounded-2xl px-3 py-2"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="theme-toggle p-2"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('internships.list')}
                            active={route().current('internships.list')}
                        >
                            Internships
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-[var(--line)] pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-[var(--text)]">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-[var(--muted)]">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex w-full items-center gap-2 px-4 py-2 text-start text-base font-medium text-[var(--muted-strong)]"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="size-4" />
                                ) : (
                                    <Moon className="size-4" />
                                )}
                                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                            </button>
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="app-header">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
