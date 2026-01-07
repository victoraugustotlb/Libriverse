const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        console.log("--- Global Books ---");
        const resGb = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'global_books';`);
        console.log(resGb.rows.map(r => `${r.column_name} (${r.data_type})`));

        console.log("--- Old Books ---");
        const resOb = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'old_books';`);
        console.log(resOb.rows.map(r => `${r.column_name} (${r.data_type})`));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

checkSchema();
