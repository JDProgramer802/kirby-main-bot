import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetAuth() {
  console.log('🧹 Iniciando limpieza de sesión de Kirby Bot...');
  try {
    const res = await pool.query("DELETE FROM auth_keys WHERE id LIKE 'kirby_main%'");
    console.log(`✅ Sesión 'kirby_main' eliminada (${res.rowCount} filas borradas).`);
    console.log('🚀 Ahora puedes reiniciar el bot con "npm start" para escanear un nuevo QR.');
  } catch (err) {
    console.error('❌ Error al resetear la sesión:', err.message);
  } finally {
    await pool.end();
  }
}

resetAuth();
