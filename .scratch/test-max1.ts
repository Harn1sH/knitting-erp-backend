import { config } from 'dotenv';
config();
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 });

async function main() {
    console.log("Testing concurrent queries with max: 1...");
    let start = performance.now();
    
    const [res1, res2, res3] = await Promise.all([
        pool.query('SELECT 1'),
        pool.query('SELECT 2'),
        pool.query('SELECT 3')
    ]);
    
    let end = performance.now();
    console.log(`Parallel query with max=1 took ${(end - start).toFixed(2)}ms`);

    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
