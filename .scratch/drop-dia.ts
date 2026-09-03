import { Client } from 'pg';

const NEW_URL = "postgresql://postgres.jczywilvbqrusugstvvc:DbpE7daQjVIfOvbs@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function main() {
    const newClient = new Client({ connectionString: NEW_URL });
    await newClient.connect();
    
    try {
        await newClient.query(`ALTER TABLE "FabricItem" DROP COLUMN "dia"`);
        console.log("Successfully dropped 'dia' column from FabricItem.");
    } catch(e) {
        console.error(e);
    } finally {
        await newClient.end();
    }
}

main().catch(console.error);
