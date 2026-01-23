/**
 * Lobby screen component
 * @module components/features/lobby/LobbyScreen
 */

'use client';

import RoomCard from './RoomCard';
import CreateRoomButton from './CreateRoomButton';
import AdminToggleButton from './AdminToggleButton';

/**
 * Main lobby screen displaying all available rooms
 * Shows room list, create room button, and admin toggle
 * 
 * @param {Object} props - Component props
 * @param {import('../../../types/room.types').Room[]} props.rooms - Array of all rooms
 * @param {import('../../../types/item.types').Item[]} props.lobbyItems - All items across all rooms (for statistics)
 * @param {import('../../../types/user.types').User} props.user - Current user object
 * @param {(roomId: string, roomName: string) => void} props.onEnterRoom - Callback when entering a room
 * @param {(e: React.MouseEvent, roomId: string) => void} props.onDeleteRoom - Callback when deleting a room
 * @param {() => void} props.onCreateRoom - Callback when creating a new room
 * @param {() => void} props.onToggleAdmin - Callback when toggling admin mode
 * @returns {JSX.Element} Lobby screen component
 * 
 * @example
 * <LobbyScreen
 *   rooms={rooms}
 *   lobbyItems={allItems}
 *   user={currentUser}
 *   onEnterRoom={enterRoom}
 *   onDeleteRoom={deleteRoom}
 *   onCreateRoom={createRoom}
 *   onToggleAdmin={toggleAdmin}
 * />
 */
export default function LobbyScreen({
    rooms,
    lobbyItems,
    user,
    onEnterRoom,
    onDeleteRoom,
    onCreateRoom,
    onToggleAdmin
}) {
    return (
        <div id="lobbyScreen">
            <div id="roomsList">
                {rooms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        Nenhuma sala aberta.
                    </div>
                ) : (
                    rooms.map(room => {
                        // Filter items for this specific room
                        const roomItems = lobbyItems.filter(i => i.room_id === room.id);

                        return (
                            <RoomCard
                                key={room.id}
                                room={room}
                                items={roomItems}
                                isAdmin={user.isAdmin}
                                onEnter={() => onEnterRoom(room.id, room.name)}
                                onDelete={(e) => onDeleteRoom(e, room.id)}
                            />
                        );
                    })
                )}
            </div>

            <CreateRoomButton onClick={onCreateRoom} />
            <AdminToggleButton isAdmin={user.isAdmin} onClick={onToggleAdmin} />
        </div>
    );
}
