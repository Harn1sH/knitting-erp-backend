import { config } from 'dotenv';
config();
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
    console.log("Connecting...");
    await pool.query('SELECT 1');
    console.log("Connected.");
    
    console.log("Testing raw query...");
    let start = performance.now();
    const result = await pool.query(`
        SELECT 
            jc.*,
            (
                SELECT COALESCE(json_agg(fi), '[]'::json)
                FROM "FabricItem" fi
                WHERE fi."jobCardId" = jc.id
            ) as "fabricItems"
        FROM "JobCard" jc
        ORDER BY jc."createdAt" DESC
        LIMIT 10
    `);
    
    const countRes = await pool.query(`SELECT COUNT(*) FROM "JobCard"`);
    let end = performance.now();
    
    console.log(`Raw query took ${(end - start).toFixed(2)}ms, found ${countRes.rows[0].count} job cards`);

    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
