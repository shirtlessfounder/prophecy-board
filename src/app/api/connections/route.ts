import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const entityId = searchParams.get('entity_id');

    let query = `
      SELECT c.*,
        se.name as source_name, se.type as source_type, se.metadata_json as source_metadata,
        me.name as modern_name, me.type as modern_type, me.metadata_json as modern_metadata
      FROM connections c
      LEFT JOIN entities se ON c.source_entity_id = se.id
      LEFT JOIN entities me ON c.modern_entity_id = me.id
    `;
    const params: string[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push(`c.status = $${params.length + 1}`);
      params.push(status);
    }
    if (entityId) {
      conditions.push(`(c.source_entity_id = $${params.length + 1} OR c.modern_entity_id = $${params.length + 1})`);
      params.push(entityId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY c.created_at DESC';

    const { rows } = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/connections error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
