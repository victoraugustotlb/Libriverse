import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    console.log("Testing database connection...");
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

    try {
        const client = await pool.connect();
        console.log("Successfully connected to the database!");
        const res = await client.query('SELECT NOW()');
        console.log("Current time from DB:", res.rows[0].now);
        client.release();
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("Database connection failed:", err.message);
        if (err.code) console.error("Error Code:", err.code);
        process.exit(1);
    }
}

testConnection();
