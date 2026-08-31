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
    await prisma.$connect();
    
    let start = performance.now();
    const jobNumber = '26-0001'; // or whatever is valid

    const result = await prisma.$queryRaw<any[]>`
        SELECT
            (SELECT COALESCE(json_agg(row_to_json(inv)), '[]') FROM "Invoice" inv WHERE inv."jobCardId" = jc.id) as invoices,
            (SELECT COALESCE(json_agg(row_to_json(fi)), '[]') FROM "FabricItem" fi WHERE fi."jobCardId" = jc.id) as "fabricItems",
            (SELECT COALESCE(json_agg(row_to_json(yic)), '[]') FROM "YarnInwardChallan" yic WHERE yic."jobCardId" = jc.id) as "yarnInwardChallans",
            (SELECT COALESCE(json_agg(row_to_json(yii)), '[]') FROM "YarnInwardItem" yii JOIN "YarnInwardChallan" yic ON yii."challanId" = yic.id WHERE yic."jobCardId" = jc.id) as "yarnInwardItems",
            (SELECT COALESCE(json_agg(row_to_json(yr)), '[]') FROM "YarnReturn" yr WHERE yr."jobCardId" = jc.id) as "yarnReturns",
            (SELECT COALESCE(json_agg(row_to_json(yri)), '[]') FROM "YarnReturnItem" yri JOIN "YarnReturn" yr ON yri."yarnReturnId" = yr.id WHERE yr."jobCardId" = jc.id) as "yarnReturnItems",
            (SELECT COALESCE(json_agg(row_to_json(dc)), '[]') FROM "DeliveryChallan" dc WHERE dc."jobCardId" = jc.id) as "deliveryChallans",
            (SELECT COALESCE(json_agg(row_to_json(di)), '[]') FROM "DeliveryItem" di JOIN "DeliveryChallan" dc ON di."challanId" = dc.id WHERE dc."jobCardId" = jc.id) as "deliveryItems",
            (SELECT COALESCE(json_agg(row_to_json(s)), '[]') FROM "Supplier" s WHERE s.id IN (
                SELECT "supplierId" FROM "YarnInwardChallan" WHERE "jobCardId" = jc.id
                UNION
                SELECT yii."supplierId" FROM "YarnInwardItem" yii JOIN "YarnInwardChallan" yic ON yii."challanId" = yic.id WHERE yic."jobCardId" = jc.id AND yii."supplierId" IS NOT NULL
                UNION
                SELECT "supplierId" FROM "YarnReturn" WHERE "jobCardId" = jc.id
            )) as suppliers,
            row_to_json(jc) as jobcard
        FROM "JobCard" jc
        ORDER BY jc."createdAt" DESC
        LIMIT 1
    `;
    
    let end = performance.now();
    console.log(`Mega query took ${(end - start).toFixed(2)}ms`);

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
