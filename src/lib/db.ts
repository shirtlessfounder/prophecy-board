import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL (or DB_URL)');
}

const pool = new Pool({
  connectionString,
  max: 10,
});

export default pool;
