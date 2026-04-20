import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const migrationFile = process.argv[2] || './drizzle/0004_fair_thunderbird.sql';
const sql = fs.readFileSync(migrationFile, 'utf8');
const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

const connection = await mysql.createConnection(process.env.DATABASE_URL);
for (const stmt of statements) {
  try {
    await connection.query(stmt);
    console.log('✓ Applied:', stmt.substring(0, 80).replace(/\n/g, ' ').replace(/\s+/g, ' '));
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('⊘ Already exists:', stmt.substring(0, 60).replace(/\n/g, ' '));
    } else {
      console.error('✗ Error:', err.message);
    }
  }
}
await connection.end();
console.log('\n✅ Migration complete');
