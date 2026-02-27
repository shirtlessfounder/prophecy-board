import { Pool } from 'pg';

const KJV_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/refs/heads/master/Books.json';

interface KJVBook {
  book: string;
  chapters: { chapter: string; verses: { verse: string; text: string }[] }[];
}

async function ingestKJV() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL (or DB_URL)');
  const pool = new Pool({ connectionString });

  console.log('Downloading KJV Bible...');
  const res = await fetch(KJV_URL);
  if (!res.ok) throw new Error(`Failed to fetch KJV: ${res.status}`);
  const books: KJVBook[] = await res.json();

  let totalVerses = 0;
  let totalBooks = 0;

  for (const book of books) {
    const bookName = book.book;
    let bookVerses = 0;

    for (const chapter of book.chapters) {
      const chapterNum = parseInt(chapter.chapter, 10);
      const values: string[] = [];
      const params: (string | number)[] = [];

      for (const v of chapter.verses) {
        const verseNum = parseInt(v.verse, 10);
        const idx = params.length;
        values.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
        params.push(bookName, chapterNum, verseNum, v.text);
        bookVerses++;
      }

      if (values.length > 0) {
        await pool.query(
          `INSERT INTO p_verses (book, chapter, verse, text_kjv)
           VALUES ${values.join(', ')}
           ON CONFLICT (book, chapter, verse) DO UPDATE SET text_kjv = EXCLUDED.text_kjv`,
          params
        );
      }
    }

    totalBooks++;
    totalVerses += bookVerses;
    console.log(`  ${bookName}: ${bookVerses} verses`);
  }

  console.log(`\nIngested ${totalVerses} verses from ${totalBooks} books.`);
  await pool.end();
}

ingestKJV().catch(err => {
  console.error('KJV ingest failed:', err);
  process.exit(1);
});
