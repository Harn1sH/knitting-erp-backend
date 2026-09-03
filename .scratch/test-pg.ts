import { Client } from 'pg';
const OLD_URL = "postgresql://postgres.tvijihejgsackqmvqytw:Ow8WGu5qFAQwPHYV@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function main() {
    const client = new Client({ connectionString: OLD_URL });
    await client.connect();
    
    const res = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != '_prisma_migrations';
    `);
    
    console.log(res.rows.map(r => r.table_name));
    await client.end();
}

main().catch(console.error);
