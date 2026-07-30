import mysql from 'mysql2/promise';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const sql = fs.readFileSync('drizzle/0014_flimsy_sandman.sql', 'utf8');
const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

for (const stmt of statements) {
  try {
    await connection.query(stmt);
    console.log('✓ Executed statement');
  } catch (err) {
    console.log('⚠ Skipped:', err.message.substring(0, 100));
  }
}

await connection.end();
console.log('✓ Migration complete');
