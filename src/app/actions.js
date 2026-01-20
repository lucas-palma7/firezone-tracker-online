'use server';

export async function verifyAdminPassword(password) {
    const correctPassword = process.env.ADMIN_PASSWORD;
    return password === correctPassword;
}
