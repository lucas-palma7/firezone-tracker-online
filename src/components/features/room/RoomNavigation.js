/**
 * Room navigation tabs component
 * @module components/features/room/RoomNavigation
 */

'use client';

import { VIEW_MODES } from '@/utils/constants';

/**
 * Tab navigation for switching between "Minha Comanda" and "Ranking" views
 * 
 * @param {Object} props - Component props
 * @param {string} props.activeView - Currently active view ('minha' or 'ranking')
 * @param {(view: string) => void} props.onViewChange - Callback when view is changed
 * @returns {JSX.Element} Room navigation component
 * 
 * @example
 * <RoomNavigation activeView={view} onViewChange={setView} />
 */
export default function RoomNavigation({ activeView, onViewChange }) {
    return (
        <div className="room-nav">
            <button
                className={`nav-btn ${activeView === VIEW_MODES.MY_TAB ? 'active' : ''}`}
                onClick={() => onViewChange(VIEW_MODES.MY_TAB)}
            >
                Minha Comanda
            </button>
            <button
                className={`nav-btn ${activeView === VIEW_MODES.RANKING ? 'active' : ''}`}
                onClick={() => onViewChange(VIEW_MODES.RANKING)}
            >
                Ranking
            </button>

            <style jsx>{`
        .room-nav {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          background: var(--nav-bg);
          padding: 4px;
          border-radius: 10px;
        }

        .nav-btn {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-btn.active {
          background: var(--nav-item-active-bg);
          color: var(--nav-item-active-text);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .nav-btn:hover:not(.active) {
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
