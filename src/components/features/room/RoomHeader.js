/**
 * Room header component with back button
 * @module components/features/room/RoomHeader
 */

'use client';

import { ArrowLeft } from 'lucide-react';

/**
 * Header bar for room screen with back button and room name
 * 
 * @param {Object} props - Component props
 * @param {string} props.roomName - Name of the current room
 * @param {() => void} props.onBack - Callback when back button is clicked
 * @returns {JSX.Element} Room header component
 * 
 * @example
 * <RoomHeader roomName="Friday Night" onBack={exitRoom} />
 */
export default function RoomHeader({ roomName, onBack }) {
    return (
        <div className="room-header-bar">
            <button className="btn-back" onClick={onBack}>
                <ArrowLeft size={16} /> Voltar
            </button>
            <div className="room-title-display">{roomName}</div>
            <div style={{ width: '60px' }}></div>

            <style jsx>{`
        .room-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .btn-back {
          background: var(--btn-secondary-border);
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-back:hover {
          background: var(--bg-hover);
        }

        .room-title-display {
          font-size: 16px;
          font-weight: 800;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
