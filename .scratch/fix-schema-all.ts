import { Client } from 'pg';

const OLD_URL = "postgresql://postgres.tvijihejgsackqmvqytw:Ow8WGu5qFAQwPHYV@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
const NEW_URL = "postgresql://postgres.jczywilvbqrusugstvvc:DbpE7daQjVIfOvbs@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

const TABLES_IN_ORDER = [
  'User',
  'MasterEntry',
  'Supplier',
  'Client',
  'JobCardCounter',
  'InvoiceCounter',
  'ChallanCounter',
  'Employee',
  'JobCard',
  'FabricItem',
  'Production',
  'ProductionLog',
  'YarnInwardChallan',
  'YarnInwardItem',
  'YarnReturn',
  'YarnReturnItem',
  'Invoice',
  'DeliveryChallan',
  'DeliveryItem',
  'YarnStockLedger'
];

async function main() {
    const oldClient = new Client({ connectionString: OLD_URL });
    const newClient = new Client({ connectionString: NEW_URL });

    await oldClient.connect();
    await newClient.connect();

    for (const table of TABLES_IN_ORDER) {
        const resOld = await oldClient.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [table]);
        
        const resNew = await newClient.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
        `, [table]);
        
        const newCols = resNew.rows.map(r => r.column_name);

        for (const row of resOld.rows) {
            if (!newCols.includes(row.column_name)) {
                console.log(`Adding missing column ${row.column_name} to NEW DB ${table}...`);
                let type = row.data_type;
                if (type === 'character varying') type = 'VARCHAR(255)'; // rough fallback
                if (type === 'USER-DEFINED') {
                     // Get exact enum name or type
                     const t = await oldClient.query(`
                        SELECT udt_name FROM information_schema.columns 
                        WHERE table_name = $1 AND column_name = $2
                     `, [table, row.column_name]);
                     type = t.rows[0].udt_name;
                }
                try {
                    await newClient.query(`ALTER TABLE "${table}" ADD COLUMN "${row.column_name}" ${type}`);
                } catch (e) {
                    console.log(`Failed to add column ${row.column_name} to ${table}: ${e.message}`);
                }
            }
        }
    }
    
    await oldClient.end();
    await newClient.end();
}

main().catch(console.error);
