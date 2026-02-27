import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SeedData {
  version: number;
  entities: { id: string; type: string; name: string; metadata_json?: object; image_url?: string }[];
  connections: { id: string; source_entity: string; modern_entity: string; claim: string; reasoning: string; status: string }[];
  claims: { id: string; connection_id: string; text: string }[];
  claim_verses: { claim_id: string; book: string; chapter: number; verse: number }[];
  claim_facts: { claim_id: string; source_url: string; fact: string }[];
  media_assets: { entity_id: string; type: string; url: string; caption?: string }[];
}

async function seed() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL (or DB_URL)');
  const pool = new Pool({ connectionString });
  const data: SeedData = JSON.parse(readFileSync(join(__dirname, '..', 'seed', 'v1.json'), 'utf-8'));

  console.log(`Seeding v${data.version}...`);

  // Entities
  for (const e of data.entities) {
    await pool.query(
      `INSERT INTO p_entities (id, type, name, metadata_json, image_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET type = $2, name = $3, metadata_json = $4, image_url = $5`,
      [e.id, e.type, e.name, JSON.stringify(e.metadata_json || {}), e.image_url || null]
    );
  }
  console.log(`  ✓ ${data.entities.length} entities`);

  // Connections
  for (const c of data.connections) {
    await pool.query(
      `INSERT INTO p_connections (id, source_entity_id, modern_entity_id, claim, reasoning, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET claim = $4, reasoning = $5, status = $6`,
      [c.id, c.source_entity, c.modern_entity, c.claim, c.reasoning, c.status]
    );
  }
  console.log(`  ✓ ${data.connections.length} connections`);

  // Claims
  for (const c of data.claims) {
    await pool.query(
      `INSERT INTO p_claims (id, connection_id, text)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET text = $3`,
      [c.id, c.connection_id, c.text]
    );
  }
  console.log(`  ✓ ${data.claims.length} claims`);

  // Claim verses — link claims to verses by book/chapter/verse lookup
  for (const cv of data.claim_verses) {
    const { rows } = await pool.query(
      'SELECT id FROM p_verses WHERE book = $1 AND chapter = $2 AND verse = $3',
      [cv.book, cv.chapter, cv.verse]
    );
    if (rows.length === 0) {
      console.warn(`  ⚠ verse not found: ${cv.book} ${cv.chapter}:${cv.verse} (run ingest-kjv first)`);
      continue;
    }
    await pool.query(
      `INSERT INTO p_claim_verses (claim_id, verse_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [cv.claim_id, rows[0].id]
    );
  }
  console.log(`  ✓ ${data.claim_verses.length} claim-verse links`);

  // Claim facts
  for (const cf of data.claim_facts) {
    await pool.query(
      `INSERT INTO p_claim_facts (claim_id, source_url, fact_text)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [cf.claim_id, cf.source_url, cf.fact]
    );
  }
  console.log(`  ✓ ${data.claim_facts.length} claim facts`);

  console.log('Seed complete.');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
