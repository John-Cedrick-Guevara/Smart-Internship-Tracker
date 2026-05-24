import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const storageKey = 'amn-theme';

export function getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === 'dark' || stored === 'light') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export function applyTheme(theme: Theme) {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
        window.localStorage.setItem(storageKey, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    };

    return { theme, setTheme, toggleTheme };
}
