'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Alternar tema"
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <style jsx>{`
        .theme-toggle-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          width: 40px;
          height: 40px;
        }
        .theme-toggle-btn:hover {
          background: var(--bg-hover);
          transform: scale(1.05);
        }
      `}</style>
        </button>
    );
}
