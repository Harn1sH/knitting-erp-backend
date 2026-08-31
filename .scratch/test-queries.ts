import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Connecting...");
    await prisma.$connect();
    console.log("Connected.");
    
    console.log("Warming up...");
    await prisma.jobCard.count();
    console.log("Warmup done.");

    console.log("Testing get-all-jobcards query...");
    let start = performance.now();
    const where = {};
    const [jobCards, total] = await Promise.all([
        prisma.jobCard.findMany({ 
            where,
            relationLoadStrategy: 'join',
            include: {
                fabricItems: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: 0,
            take: 10,
        }),
        prisma.jobCard.count({ where })
    ]);
    let end = performance.now();
    console.log(`get-all-jobcards query took ${(end - start).toFixed(2)}ms, found ${total} job cards`);

    if (jobCards.length > 0) {
        const jobNumber = jobCards[0].jobNumber;
        console.log(`Testing get-jobcard query for ${jobNumber}...`);
        start = performance.now();
        const jobCard = await prisma.jobCard.findUnique({
            where: {
                jobNumber: jobNumber
            },
            relationLoadStrategy: 'join',
            include: {
                invoices: true,
                yarnInwardChallans: {
                    include: {
                        supplier: true,
                        items: {
                            include: { supplier: true }
                        }
                    }
                },
                yarnReturns: {
                    include: {
                        supplier: true,
                        items: true
                    }
                },
                deliveryChallans: {
                    include: {
                        items: {
                            include: {
                                fabricItem: true
                            }
                        }
                    }
                },
                fabricItems: true
            }
        });
        end = performance.now();
        console.log(`get-jobcard query took ${(end - start).toFixed(2)}ms`);
    } else {
        console.log("No job cards found to test get-jobcard.");
    }
    
    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
