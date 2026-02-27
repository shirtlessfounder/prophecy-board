import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');
    const context = parseInt(searchParams.get('context') || '3', 10);

    if (!book || !chapter) {
      return NextResponse.json({ error: 'book and chapter required' }, { status: 400 });
    }

    const chapterNum = parseInt(chapter, 10);

    if (verse) {
      // Single verse with ±context
      const verseNum = parseInt(verse, 10);
      const { rows } = await pool.query(
        `SELECT * FROM verses
         WHERE book = $1 AND chapter = $2 AND verse BETWEEN $3 AND $4
         ORDER BY verse`,
        [book, chapterNum, Math.max(1, verseNum - context), verseNum + context]
      );
      return NextResponse.json({
        target: { book, chapter: chapterNum, verse: verseNum },
        context: rows,
      });
    } else {
      // Full chapter
      const { rows } = await pool.query(
        'SELECT * FROM verses WHERE book = $1 AND chapter = $2 ORDER BY verse',
        [book, chapterNum]
      );
      return NextResponse.json(rows);
    }
  } catch (err) {
    console.error('GET /api/verses error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
