/**
 * Service layer for item/comanda-related database operations
 * @module services/items
 */

import { supabase } from './supabase/client';

/**
 * Fetches all items for a specific room, ordered by creation date
 * 
 * @async
 * @param {string} roomId - The ID of the room to fetch items for
 * @returns {Promise<import('../types/item.types').Item[]>} Array of item objects
 * 
 * @example
 * const items = await fetchItems('room-uuid-123');
 * console.log(items); // [{ id: 1, nome: 'Cerveja', preco: 10.5, qtd: 2, ... }, ...]
 */
export async function fetchItems(roomId) {
    const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetches all items across all rooms (used for lobby statistics)
 * 
 * @async
 * @returns {Promise<import('../types/item.types').Item[]>} Array of all item objects
 * 
 * @example
 * const allItems = await fetchAllItems();
 */
export async function fetchAllItems() {
    const { data, error } = await supabase
        .from('comandas')
        .select('*');

    if (error) {
        console.error('Error fetching all items:', error);
        return [];
    }

    return data || [];
}

/**
 * Adds a new item to a user's comanda in a specific room
 * 
 * @async
 * @param {string} roomId - The ID of the room
 * @param {string} userId - The ID of the user
 * @param {string} userName - The display name of the user
 * @param {import('../types/item.types').NewItemData} itemData - The item data (nome, preco, qtd)
 * @returns {Promise<import('../types/item.types').Item | null>} The created item object, or null if creation failed
 * 
 * @example
 * const newItem = await addItem('room-123', 'user-456', 'João', {
 *   nome: 'Cerveja',
 *   preco: 10.5,
 *   qtd: 2
 * });
 */
export async function addItem(roomId, userId, userName, itemData) {
    const { data, error } = await supabase
        .from('comandas')
        .insert({
            room_id: roomId,
            user_id: userId,
            user_name: userName,
            nome: itemData.nome,
            preco: itemData.preco,
            qtd: itemData.qtd
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding item:', error);
        return null;
    }

    return data;
}

/**
 * Updates an existing item with new values
 * 
 * @async
 * @param {number} itemId - The ID of the item to update
 * @param {import('../types/item.types').ItemUpdates} updates - Object containing fields to update
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 * 
 * @example
 * await updateItem(123, { nome: 'Cerveja Premium', preco: 12.0 });
 */
export async function updateItem(itemId, updates) {
    const { error } = await supabase
        .from('comandas')
        .update(updates)
        .eq('id', itemId);

    if (error) {
        console.error('Error updating item:', error);
        return false;
    }

    return true;
}

/**
 * Updates the quantity of an item
 * If quantity is 0 or negative, the item should be deleted instead
 * 
 * @async
 * @param {number} itemId - The ID of the item to update
 * @param {number} quantity - The new quantity
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 * 
 * @example
 * await updateItemQuantity(123, 5);
 */
export async function updateItemQuantity(itemId, quantity) {
    return updateItem(itemId, { qtd: quantity });
}

/**
 * Deletes an item from the database
 * 
 * @async
 * @param {number} itemId - The ID of the item to delete
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 * 
 * @example
 * const success = await deleteItem(123);
 */
export async function deleteItem(itemId) {
    const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting item:', error);
        return false;
    }

    return true;
}

/**
 * Deletes all items for a specific user in a specific room
 * Used when clearing a user's entire comanda or removing a user from a room
 * 
 * @async
 * @param {string} roomId - The ID of the room
 * @param {string} userId - The ID of the user
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 * 
 * @example
 * await deleteUserItems('room-123', 'user-456');
 */
export async function deleteUserItems(roomId, userId) {
    const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting user items:', error);
        return false;
    }

    return true;
}

/**
 * Swaps the created_at timestamps of two items to reorder them
 * This is used for the drag-and-drop reordering functionality
 * 
 * @async
 * @param {number} itemAId - The ID of the first item
 * @param {number} itemBId - The ID of the second item
 * @param {string} itemANewTimestamp - The new timestamp for item A
 * @param {string} itemBNewTimestamp - The new timestamp for item B
 * @returns {Promise<boolean>} True if reordering was successful, false otherwise
 * 
 * @example
 * await reorderItems(123, 456, '2024-01-01T12:00:00', '2024-01-01T11:00:00');
 */
export async function reorderItems(itemAId, itemBId, itemANewTimestamp, itemBNewTimestamp) {
    // Update both items in sequence
    const resultA = await updateItem(itemAId, { created_at: itemANewTimestamp });
    const resultB = await updateItem(itemBId, { created_at: itemBNewTimestamp });

    return resultA && resultB;
}
