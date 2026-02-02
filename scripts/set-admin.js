
import pool from '../lib/db.js';

// Try to load .env if available (requires node --env-file=.env or dotenv)
// But purely standard node:
// Usage: node --env-file=.env scripts/set-admin.js <email>

const email = process.argv[2];

if (!email) {
    console.error('Usage: node --env-file=.env scripts/set-admin.js <email>');
    process.exit(1);
}

async function setAdmin() {
    try {
        console.log(`Promoting ${email} to Master Admin...`);

        const result = await pool.query(
            `UPDATE users 
             SET is_admin = TRUE, is_master = TRUE 
             WHERE email = $1 
             RETURNING id, name, email, is_admin, is_master`,
            [email]
        );

        if (result.rowCount === 0) {
            console.error(`User with email ${email} not found.`);
        } else {
            console.log('Success!', result.rows[0]);
        }
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await pool.end();
    }
}

setAdmin();
