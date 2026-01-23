/**
 * Server actions for admin authentication
 * @module app/actions
 */

'use server';

/**
 * Verifies if the provided password matches the admin password
 * This is a server action that runs on the server side only
 * 
 * @async
 * @param {string} password - The password to verify
 * @returns {Promise<boolean>} True if password matches, false otherwise
 * 
 * @example
 * const isValid = await verifyAdminPassword('secret123');
 * if (isValid) {
 *   console.log('Admin access granted');
 * }
 */
export async function verifyAdminPassword(password) {
    const correctPassword = process.env.ADMIN_PASSWORD;
    return password === correctPassword;
}

