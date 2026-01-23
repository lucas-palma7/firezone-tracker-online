/**
 * Type definitions for Room objects
 * @module types/room
 */

/**
 * Represents a room in the Firezone Tracker application
 * @typedef {Object} Room
 * @property {string} id - Unique identifier for the room (UUID from Supabase)
 * @property {string} name - Display name of the room
 * @property {string} created_at - ISO timestamp of when the room was created
 */

/**
 * Room data with additional computed properties for display
 * @typedef {Object} RoomWithStats
 * @property {string} id - Unique identifier for the room
 * @property {string} name - Display name of the room
 * @property {number} participantCount - Number of unique users in the room
 * @property {number} totalValue - Total value of all items in the room
 */

/**
 * Current room context
 * @typedef {Object} CurrentRoom
 * @property {string} id - Room ID
 * @property {string} name - Room name
 */

export { };
