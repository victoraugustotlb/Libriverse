import 'dotenv/config';
import pool from '../api/lib/db.js';

async function runMigration() {
    try {
        console.log('Adding "theme" column...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system';
        `);
        console.log('"theme" column added');

        console.log('Adding "view_mode" column...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS view_mode VARCHAR(20) DEFAULT 'shelves';
        `);
        console.log('"view_mode" column added');

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
