import { config } from 'dotenv';
config();
import { Pool } from 'pg';

const connectionString = 'postgresql://postgres.utblfbckuputmbsrnehs:tvijihejgsackqmvqytw@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
    console.log("Connecting...");
    await pool.query('SELECT 1');
    console.log("Connected.");
    
    console.log("Testing simple query...");
    let start = performance.now();
    const res1 = await pool.query('SELECT * FROM "JobCard" LIMIT 10');
    let end = performance.now();
    console.log(`JobCard query took ${(end - start).toFixed(2)}ms`);

    start = performance.now();
    const [a, b] = await Promise.all([
        pool.query('SELECT * FROM "JobCard" LIMIT 10'),
        pool.query('SELECT COUNT(*) FROM "JobCard"')
    ]);
    end = performance.now();
    console.log(`Parallel query took ${(end - start).toFixed(2)}ms`);

    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
