/**
 * Type definitions for User objects
 * @module types/user
 */

/**
 * Represents a user in the Firezone Tracker application
 * @typedef {Object} User
 * @property {string} id - Unique identifier for the user (format: "u_" + random string)
 * @property {string} name - Display name of the user
 * @property {boolean} isAdmin - Whether the user has admin privileges
 */

/**
 * User data stored in localStorage
 * @typedef {User} StoredUser
 */

export { };
