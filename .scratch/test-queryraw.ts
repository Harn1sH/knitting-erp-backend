import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected.");
    
    console.log("Warming up...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("Warmup done.");

    console.log("Testing raw query...");
    let start = performance.now();
    const result = await prisma.$queryRaw`
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
    `;
    let end = performance.now();
    console.log(`Raw Prisma query took ${(end - start).toFixed(2)}ms`);

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
