/**
 * Total dock component - fixed bottom bar showing totals
 * @module components/features/room/TotalDock
 */

'use client';

import { Trash2 } from 'lucide-react';
import { BRL } from '@/utils/currency';
import { VIEW_MODES } from '@/utils/constants';

/**
 * Fixed bottom dock displaying total value
 * Shows different totals based on current view (my tab vs entire room)
 * Includes trash button for clearing user's tab in "my tab" view
 * 
 * @param {Object} props - Component props
 * @param {number} props.total - Total value to display
 * @param {string} props.view - Current view mode ('minha' or 'ranking')
 * @param {() => void} [props.onClearMyTab] - Callback when trash button is clicked (only in my tab view)
 * @returns {JSX.Element} Total dock component
 * 
 * @example
 * <TotalDock total={150.50} view="minha" onClearMyTab={clearMyComanda} />
 */
export default function TotalDock({ total, view, onClearMyTab }) {
    const label = view === VIEW_MODES.MY_TAB
        ? 'Total da Minha Comanda'
        : 'Total da Mesa Inteira';

    return (
        <div className="total-dock">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {label}
                </div>
                <div className="total-value">
                    {BRL.format(total)}
                </div>
            </div>

            {view === VIEW_MODES.MY_TAB && onClearMyTab && (
                <button className="btn-trash-dock" onClick={onClearMyTab}>
                    <Trash2 size={20} />
                </button>
            )}

            <style jsx>{`
        .total-dock {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 30px);
          max-width: 420px;
          background: var(--dock-bg);
          color: var(--dock-text);
          padding: 12px 20px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          box-sizing: border-box;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .total-value {
          font-size: 20px;
          font-weight: 700;
        }

        .btn-trash-dock {
          background: var(--dock-btn-bg);
          color: #ff6b6b;
          border: none;
          padding: 8px;
          border-radius: 8px;
          font-size: 18px;
          transition: transform 0.2s;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-trash-dock:active {
          transform: scale(0.9);
        }
      `}</style>
        </div>
    );
}
