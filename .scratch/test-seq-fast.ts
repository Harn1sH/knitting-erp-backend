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
    console.log("Connecting and warming up...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("Warmup done.");
    
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
    }

    let end = performance.now();
    console.log(`getAllJobCards Sequential took ${(end - start).toFixed(2)}ms`);

    const jobNumber = jobCards[0]?.jobNumber;
    if (jobNumber) {
        start = performance.now();
        
        const jobCard = await prisma.jobCard.findUnique({ where: { jobNumber } });
        if (jobCard) {
            jobCard.invoices = await prisma.invoice.findMany({ where: { jobCardId: jobCard.id } });
            jobCard.yarnInwardChallans = await prisma.yarnInwardChallan.findMany({
                where: { jobCardId: jobCard.id },
                include: { supplier: true, items: { include: { supplier: true } } }
            });
            jobCard.yarnReturns = await prisma.yarnReturn.findMany({
                where: { jobCardId: jobCard.id },
                include: { supplier: true, items: true }
            });
            jobCard.deliveryChallans = await prisma.deliveryChallan.findMany({
                where: { jobCardId: jobCard.id },
                include: { items: { include: { fabricItem: true } } }
            });
            jobCard.fabricItems = await prisma.fabricItem.findMany({ where: { jobCardId: jobCard.id } });
        }
        
        end = performance.now();
        console.log(`getJobCard Sequential took ${(end - start).toFixed(2)}ms`);
    }

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
