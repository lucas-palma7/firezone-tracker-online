/**
 * Create room button component
 * @module components/features/lobby/CreateRoomButton
 */

'use client';

/**
 * Button for creating a new room
 * Styled with dashed border to indicate it's an action button
 * 
 * @param {Object} props - Component props
 * @param {() => void} props.onClick - Callback when button is clicked
 * @returns {JSX.Element} Create room button
 * 
 * @example
 * <CreateRoomButton onClick={handleCreateRoom} />
 */
export default function CreateRoomButton({ onClick }) {
    return (
        <button className="btn-create-room" onClick={onClick}>
            + Criar Nova Sala

            <style jsx>{`
        .btn-create-room {
          width: 100%;
          background: var(--bg-card);
          border: 2px dashed var(--border-color);
          color: var(--text-secondary);
          padding: 15px;
          border-radius: 16px;
          font-weight: 700;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-create-room:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }
      `}</style>
        </button>
    );
}
