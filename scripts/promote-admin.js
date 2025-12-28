import pool from '../api/lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address as an argument.');
    process.exit(1);
}

const promote = async () => {
    try {
        console.log(`Promoting user ${email} to admin...`);
        const result = await pool.query(`
            UPDATE users 
            SET is_admin = TRUE 
            WHERE email = $1
            RETURNING id, name, email, is_admin;
        `, [email]);

        if (result.rowCount === 0) {
            console.log('User not found.');
        } else {
            console.log('User promoted successfully:', result.rows[0]);
        }
    } catch (error) {
        console.error('Promotion failed:', error);
    } finally {
        await pool.end();
    }
};

promote();
