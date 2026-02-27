import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Connection with entities
    const { rows: connections } = await pool.query(
      `SELECT c.*,
        se.name as source_name, se.type as source_type, se.metadata_json as source_metadata, se.image_url as source_image,
        me.name as modern_name, me.type as modern_type, me.metadata_json as modern_metadata, me.image_url as modern_image
      FROM p_connections c
      LEFT JOIN p_entities se ON c.source_entity_id = se.id
      LEFT JOIN p_entities me ON c.modern_entity_id = me.id
      WHERE c.id = $1`,
      [id]
    );

    if (connections.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const connection = connections[0];

    // Claims with their verses and facts
    const { rows: claims } = await pool.query(
      'SELECT * FROM p_claims WHERE connection_id = $1 ORDER BY created_at',
      [id]
    );

    for (const claim of claims) {
      // Verses linked to this claim
      const { rows: verses } = await pool.query(
        `SELECT v.* FROM p_claim_verses cv
         JOIN p_verses v ON cv.verse_id = v.id
         WHERE cv.claim_id = $1
         ORDER BY v.book, v.chapter, v.verse`,
        [claim.id]
      );
      claim.verses = verses;

      // Facts linked to this claim
      const { rows: facts } = await pool.query(
        'SELECT * FROM p_claim_facts WHERE claim_id = $1 ORDER BY created_at',
        [claim.id]
      );
      claim.facts = facts;
    }

    // Media assets
    const { rows: media } = await pool.query(
      `SELECT ma.*, cma.caption FROM p_connection_media_assets cma
       JOIN p_media_assets ma ON cma.media_asset_id = ma.id
       WHERE cma.connection_id = $1`,
      [id]
    );

    // Vote tallies
    const { rows: voteTallies } = await pool.query(
      `SELECT axis, SUM(value) as score, COUNT(*) as count
       FROM p_votes WHERE connection_id = $1
       GROUP BY axis`,
      [id]
    );

    return NextResponse.json({
      ...connection,
      claims,
      media,
      votes: Object.fromEntries(voteTallies.map(v => [v.axis, { score: parseInt(v.score), count: parseInt(v.count) }])),
    });
  } catch (err) {
    console.error('GET /api/connections/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
