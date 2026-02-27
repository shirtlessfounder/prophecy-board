import { Pool } from 'pg';

const KJV_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/refs/heads/master/Books.json';

type RawBook = Record<string, unknown>;

type ChapterEntry = { chapter: number; verses: Array<{ verse: number; text: string }> };

function normalizeChapters(raw: unknown): ChapterEntry[] {
  if (!raw || typeof raw !== 'object') return [];

  if (Array.isArray(raw)) {
    // Shape: chapters: [["verse1", "verse2"], ...]
    if (raw.length > 0 && Array.isArray(raw[0])) {
      return raw
        .map((chapterVerses, idx) => ({
          chapter: idx + 1,
          verses: normalizeVerses(chapterVerses),
        }))
        .filter((c) => Number.isFinite(c.chapter) && c.verses.length > 0);
    }

    // Shape: chapters: ["verse1", "verse2"] (single chapter fallback)
    if (raw.length > 0 && typeof raw[0] === 'string') {
      return [{ chapter: 1, verses: normalizeVerses(raw as string[]) }];
    }

    // Shape: chapters: [{chapter, verses}, ...]
    return raw.map((c) => ({
      chapter: parseInt(String((c as Record<string, unknown>).chapter), 10),
      verses: normalizeVerses((c as Record<string, unknown>).verses),
    }))
      .filter((c) => Number.isFinite(c.chapter) && c.verses.length > 0);
  }

  return Object.entries(raw)
    .map(([chapterKey, chapterValue]) => {
      const chapterNum = parseInt(chapterKey, 10);
      if (!chapterValue || typeof chapterValue !== 'object') {
        return { chapter: chapterNum, verses: [] as Array<{ verse: number; text: string }> };
      }
      const maybeVerses =
        typeof chapterValue === 'object' && chapterValue !== null && 'verses' in chapterValue
          ? chapterValue.verses
          : (chapterValue as Record<string, string>);
      return {
        chapter: chapterNum,
        verses: normalizeVerses(maybeVerses),
      };
    })
    .filter((c) => Number.isFinite(c.chapter) && c.verses.length > 0)
    .sort((a, b) => a.chapter - b.chapter);
}

function normalizeVerses(
  raw: unknown
): Array<{ verse: number; text: string }> {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
    return (raw as string[])
      .map((text, i) => ({ verse: i + 1, text }))
      .filter((v) => typeof v.text === 'string' && v.text.length > 0);
  }
  if (Array.isArray(raw)) {
    return raw
      .map((v) => {
        const row = v as Record<string, unknown>;
        const verseVal = row.verse ?? row.verse_nr ?? row.verseNumber ?? row.number ?? row.id;
        const textVal = row.text ?? row.verse_text ?? row.content ?? row.value ?? row.verseText ?? row.verse;
        return { verse: parseInt(String(verseVal), 10), text: String(textVal || '') };
      })
      .filter((v) => Number.isFinite(v.verse) && typeof v.text === 'string' && v.text.length > 0);
  }
  if (typeof raw !== 'object') return [];
  return Object.entries(raw as Record<string, unknown>)
    .map(([verseKey, text]) => ({ verse: parseInt(verseKey, 10), text }))
    .filter((v) => Number.isFinite(v.verse) && typeof v.text === 'string' && v.text.length > 0)
    .sort((a, b) => a.verse - b.verse);
}

function getBookName(rawBook: RawBook, index: number): string {
  const candidates = [
    rawBook.book,
    rawBook.name,
    rawBook.title,
    rawBook.Book,
    rawBook.book_name,
  ];
  const picked = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
  return (picked as string | undefined) || `Book ${index + 1}`;
}

function getChapters(rawBook: RawBook): unknown {
  const direct = rawBook.chapters ?? rawBook.Chapters ?? rawBook.content ?? null;
  if (direct) return direct;

  // Common shape: { "Genesis": { ...chapters... } } or { "Genesis": [...] }
  const entries = Object.entries(rawBook);
  if (entries.length === 1) {
    return entries[0][1];
  }

  return null;
}

function unwrapBook(rawBook: RawBook, index: number): { name: string; chapters: unknown } {
  // Direct shape: {book/name/title, chapters}
  const directName = getBookName(rawBook, index);
  const directChapters = getChapters(rawBook);
  if (directName !== `Book ${index + 1}` || directChapters) {
    return { name: directName, chapters: directChapters };
  }

  // Wrapped shape: {"Genesis": {...}} / {"Genesis":[...]}
  const entries = Object.entries(rawBook);
  if (entries.length === 1) {
    const [bookName, value] = entries[0];
    const wrapped =
      typeof value === 'object' && value !== null
        ? ((value as Record<string, unknown>).chapters ??
          (value as Record<string, unknown>).Chapters ??
          (value as Record<string, unknown>).content ??
          value)
        : value;
    return { name: bookName, chapters: wrapped };
  }

  return { name: `Book ${index + 1}`, chapters: null };
}

async function ingestKJV() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL (or DB_URL)');
  const pool = new Pool({ connectionString });

  console.log('Downloading KJV Bible...');
  const res = await fetch(KJV_URL);
  if (!res.ok) throw new Error(`Failed to fetch KJV: ${res.status}`);
  const payload = await res.json();
  const books: RawBook[] = Array.isArray(payload) ? payload : (payload?.books as RawBook[] || []);

  let totalVerses = 0;
  let totalBooks = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const { name: bookName, chapters: rawChapters } = unwrapBook(book, i);
    let bookVerses = 0;

    const chapters = normalizeChapters(rawChapters);
    for (const chapter of chapters) {
      const chapterNum = chapter.chapter;
      const values: string[] = [];
      const params: (string | number)[] = [];

      for (const v of chapter.verses) {
        const verseNum = v.verse;
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

  if (totalVerses === 0) {
    throw new Error('Parsed 0 verses from KJV source. Source shape likely changed.');
  }

  console.log(`\nIngested ${totalVerses} verses from ${totalBooks} books.`);
  await pool.end();
}

ingestKJV().catch(err => {
  console.error('KJV ingest failed:', err);
  process.exit(1);
});
