import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function migrate() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL (or DB_URL)');
  const pool = new Pool({ connectionString });

  // Track applied migrations
  await pool.query(`
    CREATE TABLE IF NOT EXISTS p_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  const { rows: applied } = await pool.query('SELECT name FROM p_migrations');
  const appliedSet = new Set(applied.map(r => r.name));

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  skip: ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    console.log(`  applying: ${file}`);
    await pool.query(sql);
    await pool.query('INSERT INTO p_migrations (name) VALUES ($1)', [file]);
    console.log(`  ✓ ${file}`);
  }

  console.log('Migrations complete.');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
