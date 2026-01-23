/**
 * Service layer for room-related database operations
 * @module services/rooms
 */

import { supabase } from './supabase/client';

/**
 * Fetches all rooms from the database, ordered by creation date (newest first)
 * 
 * @async
 * @returns {Promise<import('../types/room.types').Room[]>} Array of room objects
 * 
 * @example
 * const rooms = await fetchRooms();
 * console.log(rooms); // [{ id: '...', name: 'Room 1', created_at: '...' }, ...]
 */
export async function fetchRooms() {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching rooms:', error);
        return [];
    }

    return data || [];
}

/**
 * Creates a new room in the database
 * 
 * @async
 * @param {string} name - The name for the new room
 * @returns {Promise<import('../types/room.types').Room | null>} The created room object, or null if creation failed
 * 
 * @example
 * const newRoom = await createRoom('Friday Night');
 * if (newRoom) {
 *   console.log('Room created:', newRoom.id);
 * }
 */
export async function createRoom(name) {
    const { data, error } = await supabase
        .from('rooms')
        .insert({ name })
        .select()
        .single();

    if (error) {
        console.error('Error creating room:', error);
        return null;
    }

    return data;
}

/**
 * Deletes a room and all associated items from the database
 * This operation cascades to delete all comandas (items) in the room
 * 
 * @async
 * @param {string} roomId - The ID of the room to delete
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 * 
 * @example
 * const success = await deleteRoom('room-uuid-123');
 * if (success) {
 *   console.log('Room and all items deleted');
 * }
 */
export async function deleteRoom(roomId) {
    // First delete all items in the room
    const { error: itemsError } = await supabase
        .from('comandas')
        .delete()
        .eq('room_id', roomId);

    if (itemsError) {
        console.error('Error deleting room items:', itemsError);
        return false;
    }

    // Then delete the room itself
    const { error: roomError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

    if (roomError) {
        console.error('Error deleting room:', roomError);
        return false;
    }

    return true;
}
