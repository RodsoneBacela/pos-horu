import "dotenv/config";
import { Pool } from "pg";

async function testConnection() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error("❌ DATABASE_URL não definida no .env");
    process.exit(1);
  }

  console.log("🔄 A conectar a:", url.replace(/:([^:@]+)@/, ":***@")); // esconde a password

  const pool = new Pool({ connectionString: url });

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT version(), now() as hora");
    
    console.log("✅ Conexão bem-sucedida!");
    console.log("📦 PostgreSQL:", result.rows[0].version.split(" ").slice(0, 2).join(" "));
    console.log("🕐 Hora do servidor:", result.rows[0].hora);

    // Testa se as tabelas existem
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tabelas.rows.length === 0) {
      console.log("⚠️  Sem tabelas — precisas correr: pnpm prisma migrate deploy");
    } else {
      console.log(`\n📋 Tabelas encontradas (${tabelas.rows.length}):`);
      tabelas.rows.forEach(t => console.log(`   • ${t.table_name}`));
    }

    client.release();
  } catch (err: any) {
    console.error("❌ Falha na conexão:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();