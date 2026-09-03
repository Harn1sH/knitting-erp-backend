import { Client } from 'pg';

const OLD_URL = "postgresql://postgres.tvijihejgsackqmvqytw:Ow8WGu5qFAQwPHYV@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";
const NEW_URL = "postgresql://postgres.jczywilvbqrusugstvvc:DbpE7daQjVIfOvbs@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function main() {
    const oldClient = new Client({ connectionString: OLD_URL });
    await oldClient.connect();
    const res = await oldClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'FabricItem'
    `);
    console.log("OLD DB FabricItem columns:", res.rows);

    const newClient = new Client({ connectionString: NEW_URL });
    await newClient.connect();
    
    // Let's add dia if it exists in old but not in new
    const oldCols = res.rows.map(r => r.column_name);
    
    const resNew = await newClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'FabricItem'
    `);
    const newCols = resNew.rows.map(r => r.column_name);

    for (const row of res.rows) {
        if (!newCols.includes(row.column_name)) {
            console.log(`Adding missing column ${row.column_name} to NEW DB FabricItem...`);
            let type = row.data_type;
            if (type === 'character varying') type = 'VARCHAR(255)'; // rough fallback
            await newClient.query(`ALTER TABLE "FabricItem" ADD COLUMN "${row.column_name}" ${type}`);
        }
    }
    
    await oldClient.end();
    await newClient.end();
}

main().catch(console.error);
