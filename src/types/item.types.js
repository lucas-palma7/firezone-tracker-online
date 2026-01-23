/**
 * Type definitions for Item/Comanda objects
 * @module types/item
 */

/**
 * Represents an item in a user's comanda (tab)
 * @typedef {Object} Item
 * @property {number} id - Unique identifier for the item (bigint from Supabase)
 * @property {string} room_id - ID of the room this item belongs to
 * @property {string} user_id - ID of the user who owns this item
 * @property {string} user_name - Display name of the user who owns this item
 * @property {string} nome - Name/description of the item
 * @property {number} preco - Price of a single unit of this item
 * @property {number} qtd - Quantity of this item
 * @property {string} created_at - ISO timestamp of when the item was created (used for ordering)
 */

/**
 * Data required to create a new item
 * @typedef {Object} NewItemData
 * @property {string} nome - Name/description of the item
 * @property {number} preco - Price of a single unit
 * @property {number} qtd - Quantity
 */

/**
 * Updates that can be applied to an existing item
 * @typedef {Object} ItemUpdates
 * @property {string} [nome] - Updated name/description
 * @property {number} [preco] - Updated price
 * @property {number} [qtd] - Updated quantity
 * @property {string} [created_at] - Updated timestamp (for reordering)
 */

/**
 * Aggregated player data for ranking view
 * @typedef {Object} PlayerRanking
 * @property {string} id - User ID
 * @property {string} name - User display name
 * @property {number} total - Total value of all items for this user
 * @property {Item[]} items - Array of all items belonging to this user
 */

export { };
