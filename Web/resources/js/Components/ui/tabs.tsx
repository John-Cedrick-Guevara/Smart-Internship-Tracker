import React, { createContext, useContext, useState, useEffect } from 'react';

interface TabsContextProps {
    value: string;
    onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ defaultValue, value, onValueChange, children, ...props }, ref) => {
        const [activeTab, setActiveTab] = useState(defaultValue ?? value ?? '');

        useEffect(() => {
            if (value !== undefined) {
                setActiveTab(value);
            }
        }, [value]);

        const handleValueChange = (newVal: string) => {
            if (value === undefined) {
                setActiveTab(newVal);
            }
            if (onValueChange) {
                onValueChange(newVal);
            }
        };

        return (
            <TabsContext.Provider value={{ value: activeTab, onValueChange: handleValueChange }}>
                <div ref={ref} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        );
    }
);

Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={
                    'segmented-control inline-flex h-10 items-center justify-center text-[var(--muted)] ' +
                    className
                }
                {...props}
            >
                {children}
            </div>
        );
    }
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className = '', value, children, ...props }, ref) => {
        const context = useContext(TabsContext);
        if (!context) throw new Error('TabsTrigger must be used within Tabs');

        const isActive = context.value === value;

        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => context.onValueChange?.(value)}
                className={
                    'segmented-option inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 ' +
                    (isActive
                        ? 'bg-[var(--surface-strong)] text-[var(--accent)] shadow-sm'
                        : 'hover:text-[var(--text)]') +
                    ' ' +
                    className
                }
                {...props}
            >
                {children}
            </button>
        );
    }
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className = '', value, children, ...props }, ref) => {
        const context = useContext(TabsContext);
        if (!context) throw new Error('TabsContent must be used within Tabs');

        const isActive = context.value === value;

        if (!isActive) return null;

        return (
            <div
                ref={ref}
                role="tabpanel"
                className={'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' + className}
                {...props}
            >
                {children}
            </div>
        );
    }
);

TabsContent.displayName = 'TabsContent';
