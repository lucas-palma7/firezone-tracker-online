/**
 * Service layer for authentication and user management
 * @module services/auth
 */

import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Saves user data to localStorage
 * 
 * @param {import('../types/user.types').User} user - The user object to save
 * 
 * @example
 * saveUser({ id: 'u_123', name: 'João', isAdmin: false });
 */
export function saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Retrieves user data from localStorage
 * 
 * @returns {import('../types/user.types').User | null} The user object, or null if not found
 * 
 * @example
 * const user = getUser();
 * if (user) {
 *   console.log('Welcome back,', user.name);
 * }
 */
export function getUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
}

/**
 * Removes user data from localStorage (logout)
 * 
 * @example
 * clearUser();
 */
export function clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * Generates a new unique user ID
 * 
 * @returns {string} A unique user ID in the format "u_" + random string
 * 
 * @example
 * const userId = generateUserId(); // "u_x7k9m2p4q"
 */
export function generateUserId() {
    return 'u_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Creates a new user object with the given name
 * 
 * @param {string} name - The user's display name
 * @returns {import('../types/user.types').User} A new user object
 * 
 * @example
 * const newUser = createUser('João Silva');
 * // { id: 'u_x7k9m2p4q', name: 'João Silva', isAdmin: false }
 */
export function createUser(name) {
    return {
        id: generateUserId(),
        name: name.trim(),
        isAdmin: false
    };
}

/**
 * Updates a user's admin status and saves to localStorage
 * 
 * @param {import('../types/user.types').User} user - The user object
 * @param {boolean} isAdmin - The new admin status
 * @returns {import('../types/user.types').User} The updated user object
 * 
 * @example
 * const updatedUser = toggleAdminMode(currentUser, true);
 * console.log(updatedUser.isAdmin); // true
 */
export function toggleAdminMode(user, isAdmin) {
    const updatedUser = { ...user, isAdmin };
    saveUser(updatedUser);
    return updatedUser;
}

/**
 * Saves current room information to localStorage
 * 
 * @param {string} roomId - The room ID
 * @param {string} roomName - The room name
 * 
 * @example
 * saveCurrentRoom('room-uuid-123', 'Friday Night');
 */
export function saveCurrentRoom(roomId, roomName) {
    localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId);
    localStorage.setItem(STORAGE_KEYS.ROOM_NAME, roomName);
}

/**
 * Retrieves current room information from localStorage
 * 
 * @returns {import('../types/room.types').CurrentRoom | null} The current room object, or null if not found
 * 
 * @example
 * const room = getCurrentRoom();
 * if (room) {
 *   console.log('Current room:', room.name);
 * }
 */
export function getCurrentRoom() {
    const roomId = localStorage.getItem(STORAGE_KEYS.ROOM_ID);
    const roomName = localStorage.getItem(STORAGE_KEYS.ROOM_NAME);

    if (roomId && roomName) {
        return { id: roomId, name: roomName };
    }

    return null;
}

/**
 * Clears current room information from localStorage
 * 
 * @example
 * clearCurrentRoom();
 */
export function clearCurrentRoom() {
    localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
    localStorage.removeItem(STORAGE_KEYS.ROOM_NAME);
}
