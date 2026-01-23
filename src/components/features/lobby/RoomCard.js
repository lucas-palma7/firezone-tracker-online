/**
 * Room card component for lobby display
 * @module components/features/lobby/RoomCard
 */

'use client';

import { Users, ChevronDown, Trash2 } from 'lucide-react';
import { BRL } from '@/utils/currency';

/**
 * Displays a single room card in the lobby with participant count and total value
 * Shows delete button for admin users
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/room.types').Room} props.room - The room object
 * @param {import('../../../types/item.types').Item[]} props.items - All items in this room
 * @param {boolean} props.isAdmin - Whether the current user is an admin
 * @param {() => void} props.onEnter - Callback when room card is clicked
 * @param {(e: React.MouseEvent) => void} props.onDelete - Callback when delete button is clicked
 * @returns {JSX.Element} Room card component
 * 
 * @example
 * <RoomCard
 *   room={room}
 *   items={roomItems}
 *   isAdmin={user.isAdmin}
 *   onEnter={() => enterRoom(room.id, room.name)}
 *   onDelete={(e) => deleteRoom(e, room.id)}
 * />
 */
export default function RoomCard({ room, items, isAdmin, onEnter, onDelete }) {
    // Calculate statistics for this room
    const participants = new Set(items.map(i => i.user_id)).size;
    const roomTotal = items.reduce((acc, curr) => acc + (curr.preco * curr.qtd), 0);

    return (
        <div className="room-card" onClick={onEnter}>
            <div className="room-info">
                <h3>{room.name}</h3>
                <div className="room-users">
                    <Users size={14} />
                    <span>{participants}</span>
                </div>
            </div>
            <div className="room-actions">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>Total</span>
                    <div className="room-total-preview">{BRL.format(roomTotal)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isAdmin && (
                        <button
                            className="btn-admin-small"
                            onClick={onDelete}
                            style={{
                                border: 'none',
                                background: 'var(--danger-bg)',
                                color: 'var(--danger)',
                                borderRadius: '8px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <ChevronDown
                        className="arrow-right"
                        style={{ transform: 'rotate(-90deg)', color: 'var(--text-secondary)' }}
                    />
                </div>
            </div>

            <style jsx>{`
        .room-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 15px 20px;
          margin-bottom: 15px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border: 1px solid var(--border-color);
        }

        .room-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 700;
          word-break: break-word;
          color: var(--text-primary);
        }

        .room-users {
          font-size: 14px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          margin-top: 5px;
        }

        .room-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .room-total-preview {
          font-weight: 800;
          font-size: 16px;
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
