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

async function migrate() {
    const oldClient = new Client({ connectionString: OLD_URL });
    const newClient = new Client({ connectionString: NEW_URL });

    await oldClient.connect();
    await newClient.connect();

    console.log("Connected to both databases.");

    // Disable triggers/FK checks on new DB
    await newClient.query("SET session_replication_role = 'replica';");

    try {
        // Truncate all tables first
        for (const table of TABLES_IN_ORDER.slice().reverse()) {
            await newClient.query(`TRUNCATE TABLE "${table}" CASCADE`);
        }
        
        for (const table of TABLES_IN_ORDER) {
            console.log(`Migrating table: ${table}`);
            const res = await oldClient.query(`SELECT * FROM "${table}"`);
            const rows = res.rows;
            console.log(`  Found ${rows.length} rows.`);

            if (rows.length > 0) {
                const keys = Object.keys(rows[0]);
                const columns = keys.map(k => `"${k}"`).join(', ');

                for (const row of rows) {
                    const values = keys.map(k => row[k]);
                    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                    
                    await newClient.query(
                        `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`,
                        values
                    );
                }
                console.log(`  Inserted ${rows.length} rows into ${table}.`);
            }
        }
    } catch(e) {
        console.error("Error migrating data:", e);
    } finally {
        await newClient.query("SET session_replication_role = 'origin';");
        await oldClient.end();
        await newClient.end();
        console.log("Migration complete.");
    }
}

migrate().catch(console.error);
