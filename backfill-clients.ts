import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting JobCard clientId backfill...');
  
  const jobCards = await prisma.jobCard.findMany({
    where: { clientId: null }
  });

  console.log(`Found ${jobCards.length} JobCards without a clientId.`);

  let matched = 0;
  let unmatched = 0;

  for (const jobCard of jobCards) {
    // Attempt to match by name (case insensitive)
    const client = await prisma.client.findFirst({
      where: {
        name: {
          equals: jobCard.customerName,
          mode: 'insensitive'
        }
      }
    });

    if (client) {
      await prisma.jobCard.update({
        where: { id: jobCard.id },
        data: { clientId: client.id }
      });
      matched++;
      console.log(`Matched: ${jobCard.jobNumber} -> ${client.name}`);
    } else {
      unmatched++;
      console.log(`UNMATCHED: ${jobCard.jobNumber} (customerName: "${jobCard.customerName}") - Please link manually or create the Client.`);
    }
  }

  console.log(`\nBackfill complete. Matched: ${matched}, Unmatched: ${unmatched}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
