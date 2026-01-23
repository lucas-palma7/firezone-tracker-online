/**
 * Application header component
 * @module components/common/Header
 */

'use client';

import ThemeToggle from './ThemeToggle';

/**
 * Main application header with logo, title, and user information
 * 
 * @param {Object} props - Component props
 * @param {import('../../types/user.types').User} props.user - Current user object
 * @param {boolean} [props.showThemeToggle=true] - Whether to show the theme toggle button
 * @returns {JSX.Element} Header component
 * 
 * @example
 * <Header user={currentUser} showThemeToggle={true} />
 */
export default function Header({ user, showThemeToggle = true }) {
    return (
        <header>
            {showThemeToggle && (
                <>
                    <div className="theme-toggle-mobile">
                        <ThemeToggle />
                    </div>
                    <div className="theme-toggle-desktop">
                        <ThemeToggle />
                    </div>
                </>
            )}

            <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg"
                alt="Botafogo"
                className="bfr-logo"
            />
            <h1>Firezone</h1>
            <div className="subtitle">
                Olá, {user.name} {user.isAdmin && <span className="admin-tag">(Admin)</span>}
            </div>

            <style jsx>{`
        header {
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          position: relative;
        }

        .theme-toggle-mobile {
          display: none;
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
        }

        .theme-toggle-desktop {
          position: absolute;
          top: 20px;
          right: 20px;
        }

        @media (max-width: 600px) {
          .theme-toggle-mobile {
            display: block;
          }
          .theme-toggle-desktop {
            display: none;
          }
        }

        .bfr-logo {
          width: 60px;
          height: 60px;
          margin-bottom: 10px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        h1 {
          font-size: 24px;
          letter-spacing: -1px;
          margin: 0;
          font-weight: 800;
          text-align: center;
          width: 100%;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin-top: 5px;
          font-weight: 500;
          text-align: center;
          width: 100%;
        }

        .admin-tag {
          color: var(--danger);
          font-weight: 700;
          font-size: 12px;
          margin-left: 4px;
          vertical-align: middle;
        }
      `}</style>
        </header>
    );
}
