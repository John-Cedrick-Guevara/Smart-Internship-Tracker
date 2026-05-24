import ApplicationLogo from '@/Components/ApplicationLogo';
import { useTheme } from '@/hooks/useTheme';
import { Link } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="auth-shell relative flex flex-col items-center px-5 pt-6 sm:justify-center sm:pt-0">
            <div className="page-noise absolute inset-0" />
            <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle absolute right-5 top-5"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {theme === 'dark' ? (
                    <Sun className="size-4" />
                ) : (
                    <Moon className="size-4" />
                )}
                {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <div className="relative">
                <Link href="/" className="flex flex-col items-center gap-3">
                    <span className="logo-mark size-16 rounded-3xl">
                        <ApplicationLogo className="h-9 w-9 fill-current" />
                    </span>
                    <span className="text-center">
                        <span className="brand-kicker block">
                            Anti Mahinang Nilalang
                        </span>
                        <span className="brand-subtitle block">
                            Smart application tracker
                        </span>
                    </span>
                </Link>
            </div>

            <div className="auth-card relative mt-6 w-full overflow-hidden px-6 py-6 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
