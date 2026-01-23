/**
 * Theme provider and context for managing light/dark mode
 * @module app/ThemeProvider
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Theme context with default values
 * @type {React.Context<import('../types/theme.types').ThemeContextValue>}
 */
const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
});

/**
 * Theme provider component that manages theme state and persistence
 * Checks localStorage and system preferences on mount
 * Automatically applies theme to document root element
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Theme provider wrapper
 * 
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    /**
     * Initialize theme on mount
     * Priority: localStorage > system preference > default (light)
     */
    useEffect(() => {
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Fall back to system preference
            setTheme('dark');
        }
        setMounted(true);
    }, []);

    /**
     * Apply theme changes to DOM and localStorage
     * Sets data-theme attribute on document root for CSS variable switching
     */
    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
        }
    }, [theme, mounted]);

    /**
     * Toggles between light and dark themes
     */
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    // Prevent flash of unstyled content by not rendering until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme context
 * Must be used within a ThemeProvider
 * 
 * @returns {import('../types/theme.types').ThemeContextValue} Theme context value
 * 
 * @example
 * const { theme, toggleTheme } = useTheme();
 */
export const useTheme = () => useContext(ThemeContext);
