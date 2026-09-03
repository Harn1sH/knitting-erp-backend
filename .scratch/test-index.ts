import { config } from 'dotenv';
config();
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const res = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'JobCard';
    `);
    console.log(res.rows);
    
    // Also let's run EXPLAIN ANALYZE on that query
    const explain = await pool.query(`
        EXPLAIN ANALYZE SELECT * FROM "JobCard" WHERE "jobNumber" = '26-0033';
    `);
    console.log(explain.rows.map(r => r['QUERY PLAN']).join('\n'));

    await pool.end();
}

main().catch(console.error);
