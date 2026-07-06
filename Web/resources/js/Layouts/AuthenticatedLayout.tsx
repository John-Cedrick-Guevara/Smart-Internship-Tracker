import BrandWatermark from '@/Components/BrandWatermark';
import { useTheme } from '@/hooks/useTheme';
import { Link, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Gauge,
    LogOut,
    Menu,
    Moon,
    Sun,
    User,
    X,
    Sparkles
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user!;
    const { theme, toggleTheme } = useTheme();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            {/* Desktop Sidebar Navigation */}
            <aside className="app-sidebar hidden md:flex animate-in fade-in duration-200">
                <div className="flex flex-col h-full justify-between p-6">
                    {/* Top Section */}
                    <div className="space-y-8">
                        {/* Logo/Brand */}
                        <Link href="/" className="flex items-center gap-3 focus:outline-none">
                            <span className="logo-mark flex items-center justify-center size-10 rounded-xl">
                                <Sparkles className="size-5" />
                            </span>
                            <div>
                                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] block">
                                    ANTI MAHINANG
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted)] block">
                                    Smart tracker
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Items */}
                        <nav className="flex flex-col gap-2">
                            <Link
                                href={route('dashboard')}
                                className={`sidebar-link ${
                                    route().current('dashboard') ? 'active' : ''
                                }`}
                            >
                                <Gauge className="size-4" />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                href={route('internships.list')}
                                className={`sidebar-link ${
                                    route().current('internships.list') || route().current('internships.index') ? 'active' : ''
                                }`}
                            >
                                <BriefcaseBusiness className="size-4" />
                                <span>Internships</span>
                            </Link>
                            <Link
                                href={route('profile.edit')}
                                className={`sidebar-link ${
                                    route().current('profile.edit') ? 'active' : ''
                                }`}
                            >
                                <User className="size-4" />
                                <span>Profile</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Bottom Section */}
                    <div className="space-y-4 pt-4 border-t border-[var(--line)]">
                        {/* Theme Toggle in Sidebar */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--muted-strong)] hover:text-[var(--text)] hover:border-[var(--text)] transition"
                            aria-label="Toggle theme"
                        >
                            <span className="uppercase text-[10px] tracking-wider">
                                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                            </span>
                            {theme === 'dark' ? (
                                <Sun className="size-4 text-amber-500" />
                            ) : (
                                <Moon className="size-4 text-slate-700" />
                            )}
                        </button>

                        {/* User Card */}
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--line)]">
                            <div className="min-w-0 flex-1 px-1">
                                <span className="block text-xs font-bold text-[var(--text)] truncate">
                                    {user.name}
                                </span>
                                <span className="block text-[10px] text-[var(--muted)] truncate">
                                    {user.email}
                                </span>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] transition"
                                title="Log Out"
                            >
                                <LogOut className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay/Drawer */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div className="relative flex flex-col w-full max-w-[280px] h-full bg-[var(--surface)] p-6 shadow-2xl border-r border-[var(--line)] animate-in slide-in-from-left duration-200">
                        <div className="absolute right-4 top-4">
                            <button 
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="p-1 rounded-lg hover:bg-[var(--surface-strong)] border border-[var(--line)]"
                            >
                                <X className="size-4 text-[var(--text)]" />
                            </button>
                        </div>

                        <div className="flex flex-col h-full justify-between">
                            <div className="space-y-8">
                                {/* Logo */}
                                <Link href="/" className="flex items-center gap-3 focus:outline-none">
                                    <span className="logo-mark flex items-center justify-center size-9 rounded-xl">
                                        <Sparkles className="size-4.5" />
                                    </span>
                                    <div>
                                        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] block">
                                            ANTI MAHINANG
                                        </span>
                                    </div>
                                </Link>

                                {/* Links */}
                                <nav className="flex flex-col gap-2">
                                    <Link
                                        href={route('dashboard')}
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className={`sidebar-link ${
                                            route().current('dashboard') ? 'active' : ''
                                        }`}
                                    >
                                        <Gauge className="size-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        href={route('internships.list')}
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className={`sidebar-link ${
                                            route().current('internships.list') || route().current('internships.index') ? 'active' : ''
                                        }`}
                                    >
                                        <BriefcaseBusiness className="size-4" />
                                        <span>Internships</span>
                                    </Link>
                                    <Link
                                        href={route('profile.edit')}
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className={`sidebar-link ${
                                            route().current('profile.edit') ? 'active' : ''
                                        }`}
                                    >
                                        <User className="size-4" />
                                        <span>Profile</span>
                                    </Link>
                                </nav>
                            </div>

                            {/* Bottom Card */}
                            <div className="space-y-4 pt-4 border-t border-[var(--line)]">
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--muted-strong)] hover:text-[var(--text)] transition"
                                >
                                    <span className="uppercase text-[10px] tracking-wider">
                                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                                    </span>
                                    {theme === 'dark' ? (
                                        <Sun className="size-4 text-amber-500" />
                                    ) : (
                                        <Moon className="size-4 text-slate-700" />
                                    )}
                                </button>

                                <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--line)]">
                                    <div className="min-w-0 flex-1 px-1">
                                        <span className="block text-xs font-bold text-[var(--text)] truncate">
                                            {user.name}
                                        </span>
                                    </div>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] transition"
                                    >
                                        <LogOut className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="app-main">
                {/* Mobile Top Navigation */}
                <nav className="app-nav md:hidden">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="logo-mark flex items-center justify-center size-8 rounded-lg">
                            <Sparkles className="size-4" />
                        </span>
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--text)]">
                            AMN
                        </span>
                    </Link>

                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-strong)] transition"
                        aria-label="Open sidebar"
                    >
                        <Menu className="size-4 text-[var(--text)]" />
                    </button>
                </nav>

                {/* Subpage Header (if active) */}
                {header && (
                    <header className="app-header">
                        <div className="mx-auto max-w-7xl px-6 py-5 md:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Subpage Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                <BrandWatermark />
            </div>
        </div>
    );
}
