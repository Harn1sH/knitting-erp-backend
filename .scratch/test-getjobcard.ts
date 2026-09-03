import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Warming up connections...");
    const warmupStart = performance.now();
    await Promise.all(
        Array(15).fill(0).map(() => prisma.$queryRaw`SELECT 1`)
    );
    const warmupEnd = performance.now();
    console.log(`Warmup complete in ${(warmupEnd - warmupStart).toFixed(2)}ms`);

    const jobNumber = '26-0033';
    console.log(`Testing getJobCard for ${jobNumber}...`);
    
    const start = performance.now();
    const [jobCardData, yarnInwardChallans, yarnReturnsData, deliveryChallans, stockTransfersIn, stockTransfersOut] = await Promise.all([
        prisma.jobCard.findUnique({
            where: { jobNumber },
            include: { invoices: true, fabricItems: true }
        }),
        prisma.yarnInwardChallan.findMany({
            where: { jobCard: { jobNumber } },
            include: { supplier: true, items: true }
        }),
        prisma.yarnReturn.findMany({
            where: { jobCard: { jobNumber } },
            include: { supplier: true, items: true }
        }),
        prisma.deliveryChallan.findMany({
            where: { jobCard: { jobNumber } },
            include: { items: true }
        }),
        prisma.yarnStockLedger.findMany({
            where: { sourceJobCard: { jobNumber }, type: 'IN' }
        }),
        prisma.yarnStockLedger.findMany({
            where: { targetJobCard: { jobNumber }, type: 'OUT' },
            include: {
                linkedChallan: { include: { supplier: true } }
            }
        })
    ]);
    const end = performance.now();
    console.log(`getJobCard Promise.all took ${(end - start).toFixed(2)}ms`);

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
