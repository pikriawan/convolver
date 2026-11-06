const postgres = require("postgres").default;
require("dotenv").config();

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
    await sql`
        CREATE TABLE IF NOT EXISTS visitors(
            id SERIAL PRIMARY KEY,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await sql.end();
}

migrate();
