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
    
    console.log("Testing sequential Prisma query...");
    let start = performance.now();
    const where = {};
    
    // SEQUENTIAL
    const jobCards = await prisma.jobCard.findMany({ 
        where,
        orderBy: {
            createdAt: 'desc'
        },
        skip: 0,
        take: 10,
    });
    const total = await prisma.jobCard.count({ where });
    
    if (jobCards.length > 0) {
        const jobCardIds = jobCards.map(jc => jc.id);
        const fabricItems = await prisma.fabricItem.findMany({
            where: { jobCardId: { in: jobCardIds } }
        });
        const fiMap = new Map();
        fabricItems.forEach(fi => {
            if (!fiMap.has(fi.jobCardId)) fiMap.set(fi.jobCardId, []);
            fiMap.get(fi.jobCardId).push(fi);
        });
        jobCards.forEach(jc => {
            (jc as any).fabricItems = fiMap.get(jc.id) || [];
        });
    }

    let end = performance.now();
    console.log(`Sequential Prisma query took ${(end - start).toFixed(2)}ms`);

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
