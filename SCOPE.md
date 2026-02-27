# Prophecy Board — Product Scope

## One-liner
Community-built conspiracy board mapping Biblical and Talmudic prophecy to modern AI/tech with rigorous textual citations. Deadpan serious.

## Core Experience

User lands on a dark corkboard covered in pinned cards, photos, red strings connecting ancient text excerpts to modern entities. It looks like a detective's obsession wall. Everything is draggable, zoomable, explorable. The board is alive — new connections appear as the community submits and votes on them.

## Two Entity Types

### Source Cards (left side, aged parchment aesthetic)
- Direct scripture quotes with book:chapter:verse citation
- Original Hebrew/Greek text + English translation
- Hover to see surrounding context (±3 verses)
- Sources: Revelation, Daniel, Ezekiel, Isaiah, Torah, Talmud (Sanhedrin, etc.)
- Each card tagged by theme: Beast, Antichrist, Messiah, End Times, Mark, Babylon, etc.

### Modern Cards (right side, clean tech aesthetic)
- Person, company, or concept
- Photo/logo
- Key facts (founding date, headcount, valuation, etymology of name)
- Links to sources (wikipedia, linkedin, crunchbase)

### Red Strings (connections)
- Each string = one claimed parallel
- Click string → slides open an evidence panel:
  - The specific textual basis (verse + original language)
  - The modern parallel (with source links)
  - The reasoning chain (etymology, numerology, symbolism, geography)
  - Confidence score (community-voted)
  - "Probability of coincidence" calculation (tongue in cheek but mathematically sound)
- Strings have thickness/glow based on community vote strength

## AI Exploration Layer

### Prompt Bar (bottom of screen, minimal)
- "Find connections between [text/concept] and [modern entity]"
- "What does [Hebrew/Greek word] map to in Silicon Valley?"
- "Who in tech matches [prophecy description]?"
- "Explore [book:chapter:verse]"

### How AI Generation Works
1. User submits a prompt
2. LLM generates a proposed connection WITH citations
3. Every claim must include:
   - Exact verse reference (validated against source text database)
   - Original language word + etymology (validated against lexicon database)
   - Modern fact (validated against knowledge base)
4. **Anti-hallucination**: generated connections go to a verification layer that checks:
   - Does this verse actually exist? (lookup against full text DB)
   - Does the etymology check out? (lookup against Strong's Concordance / BDB Hebrew Lexicon)
   - Are the modern facts accurate? (lookup against curated entity DB)
5. Verified connections enter "Pending Review" state on the board (dimmed strings)
6. Community votes promote to "Established" (bright strings)

### Source Text Database (critical for anti-hallucination)
- Full Bible text (KJV, NIV, ESV) with verse-level indexing
- Septuagint (Greek OT) for original language
- Hebrew Bible (Masoretic text) with word-level parsing
- Strong's Concordance — maps every word to root + definition
- Brown-Driver-Briggs Hebrew Lexicon
- Thayer's Greek Lexicon
- Talmud: Sefaria API (open source, full text, already has great APIs)
- Dead Sea Scrolls relevant passages

### Entity Database (modern side)
- AI companies: founding date, co-founders, headcount, valuation, HQ location
- Key figures: name etymology, nationality, role, key quotes
- Regulatory bodies: EU AI Act, US executive orders, etc.
- Geography: company HQs, data centers, chip fabs mapped to ancient locations

## Community Features

### Submit Connection
- User draws a string between any source card and modern card
- Must provide: which verse, which entity, what's the link
- Optional evidence image attachments (screenshots/photos/doc snippets) supported in MVP
- AI assist for reasoning drafts is post-MVP; MVP is manual submission only
- Goes to "Pending" state

### Vote
- Upvote/downvote on pending connections
- Threshold to promote to "Established"
- Separate vote for "Rigorous" vs "Entertaining" (both valid, different leaderboards)

### Leaderboards
- Top contributors (by accepted connections)
- Most upvoted connections
- "Deepest Rabbit Holes" — longest chains of connected connections
- "Most Improbable" — lowest probability-of-coincidence scores

### Share
- Any connection or cluster of connections → generates a shareable card/image
- Open graph tags so it previews well on twitter/social
- "Share this prophecy" button on every connection
- Board state is URL-encoded — share a link to your exact view/zoom

## Seed Content (Scott Alexander mappings)

### Pre-loaded connections to launch with:
1. Anthropic = The Beast (7 heads = 7 co-founders)
2. Anthropic = decacorn (10 horns = 10 billion valuation)
3. All 7 founder name etymologies → names of blasphemy
4. 666 = Anthropic headcount (ἀνθρώπου = anthropic)
5. Mark of the Beast = biometric proof of personhood (forehead + hand)
6. Woman of Apocalypse = Ursula von der Leyen / EU
7. Dragon/Antichrist = Marc Andreessen (A16Z = Alpha & Omega)
8. Three Frogs = Sacks, Krishnan, Kratsios (MAGA pepe)
9. Lamb/Messiah = SSI
10. Elijah = Ilya Sutskever (Russian form of Elijah)
11. Ilya's forehead = Name of God
12. Whore of Babylon = Tigris chip fab
13. Seven mountains/kings = UAE seven emirates
14. Four beasts of Daniel = four AI labs by founder ethnicity
15. New Jerusalem = orbital megastructure (~moon-sized)
16. 1,260 days from SSI founding = December 2027

### Images needed from Scott's article:
- Andreessen glasses close-up ("horn with human eyes")
- Ilya forehead + flipped version
- Von der Leyen in yellow suit with EU flag
- EU Parliament hemicycle
- Anthropic LinkedIn headcount screenshot
- Decacorn list
- Europe "feet" map with North Africa moon flags
- New Jerusalem artistic depictions

## Visual Design

### Board aesthetic
- Dark cork/wood background texture
- Cards: slightly yellowed paper (source) vs clean white (modern)
- Red string/yarn connecting pins
- Pushpins with slight 3D shadow
- Handwritten-style annotations (optional, toggle)
- Slight parallax on scroll for depth
- Ambient lighting — desk lamp glow in corner

### Typography
- Source cards: serif font (feels biblical/academic)
- Modern cards: clean sans-serif
- Evidence panels: monospace for the "analysis" sections
- Hebrew/Greek in proper fonts with transliteration below

### Interactions
- Drag to pan the board
- Scroll to zoom
- Click card to flip/expand
- Click string to open evidence panel
- Double-click empty space to add a note/card
- Cmd+F to search across all cards

## Tech Stack (suggested)

- **Frontend**: Next.js + React, canvas-based board (react-flow or custom)
- **Text DB (MVP)**: local KJV corpus in Postgres with verse-level indexing for fast lookup
- **Text APIs (post-MVP)**: Sefaria API for Jewish texts and optional Bible APIs for additional translations/enrichments
- **AI (post-MVP)**: Claude API for connection generation, with verification layer
- **Auth**: anonymous + strict rate limits (no quiz/captcha at launch)
- **Storage**: Postgres (Supabase-hosted acceptable) for everything — connections, votes, users, text DB
- **Cache**: Redis deferred to post-MVP. Trigger: p95 read latency or DB CPU thresholds.
- **CDN**: Vercel for hosting
- **Share images**: Satori or Puppeteer for OG image generation
- **Anti-spam (MVP)**: strict rate limits, URL/domain allowlist for source links, basic spam heuristics, fast moderation tools

## MVP vs Full

### Milestone 1A: KJV Ingest + Read-Only Board
- KJV Bible ingest with verse-level indexing in Postgres
- Read APIs for verse lookup, search, context (±3 verses)
- Pre-seeded board with Scott Alexander's 16 connections (see Seed Data Format below)
- Read-only exploration (zoom, click, expand evidence)
- Share button for individual connections
- Mobile-first: `/c/:id` as first-class landing page, optimized before full-board UX
- Mobile-responsive (scroll/pinch instead of drag)

### Milestone 1B: Strong's/Lexicon Linking (optional gate — can slip without blocking 1A launch)
- Strong's Concordance integration — word-level Hebrew/Greek mapping
- BDB Hebrew Lexicon + Thayer's Greek Lexicon linking
- Etymology lookups powering evidence panels
- Sefaria API integration for Talmud/Jewish texts

### V2
- Advanced community systems: moderation queues, contributor reputation, and richer ranking
- User accounts + leaderboards
- Torah/Talmud expansion beyond Revelation
- "Rabbit hole mode" — AI guides you through a chain of connections
- Multiple boards (AI board, crypto board, geopolitics board)
- Daily "prophecy of the day" email/push

### V3
- Other religious texts (Quran, Vedas, I Ching, Norse Eddas)
- Historical mode (map prophecies to past events, not just present)
- API for embedding connections on other sites
- Premium: unlimited AI exploration, early access to community submissions

## Seed Data Format (v1)

Versioned JSON file (`seed/v1.json`) loaded via `npm run seed` command. All 16 Scott Alexander connections reproducible from this file.

```json
{
  "version": 1,
  "entities": [
    { "id": "anthropic", "type": "modern", "name": "Anthropic", "image": "...", "facts": {...} },
    { "id": "rev-13-1", "type": "source", "book": "Revelation", "chapter": 13, "verse": 1, "text": "...", "tags": ["Beast"] }
  ],
  "connections": [
    {
      "id": "anthropic-beast-heads",
      "source_entity": "rev-13-1",
      "modern_entity": "anthropic",
      "claim": "7 heads = 7 co-founders",
      "reasoning": "...",
      "status": "established"
    }
  ],
  "claims": [
    { "id": "...", "connection_id": "anthropic-beast-heads", "text": "Anthropic had exactly 7 co-founders" }
  ],
  "claim_verses": [
    { "claim_id": "...", "book": "Revelation", "chapter": 13, "verse": 1 }
  ],
  "claim_facts": [
    { "claim_id": "...", "source_url": "https://...", "fact": "7 co-founders listed on Anthropic's founding announcement" }
  ],
  "media_assets": [
    { "entity_id": "anthropic", "type": "logo", "url": "...", "caption": "..." }
  ]
}
```

**Loader:** `npm run seed` reads `seed/v1.json`, validates schema, upserts to Postgres. Idempotent (safe to re-run).

## Database Schema (MVP)

- entities(id, type, name, metadata_json, image_url, created_at)
- verses(id, book, chapter, verse, text_kjv, created_at)
- verse_lexicon_refs(id, verse_id, word_index, strongs_id, lemma, created_at) -- introduced in Milestone 1B
- connections(id, source_entity_id, modern_entity_id, claim, reasoning, status, submitted_by, created_at)
- claims(id, connection_id, text, created_at)
- claim_verses(id, claim_id, verse_id, created_at)
- claim_facts(id, claim_id, source_url, fact_text, created_at)
- media_assets(id, type, url, source, attribution, created_at)
- connection_media_assets(id, connection_id, media_asset_id, caption, created_at)
- votes(id, connection_id, user_id, axis, value, created_at)
- audit_log(id, object_type, object_id, action, payload_json, created_at)

## API Contracts (MVP)

- GET /api/entities -> list/search entities.
- GET /api/verses?book=&chapter=&verse= -> verse lookup with context.
- GET /api/connections -> list connections (filterable by status, entity, tag).
- GET /api/connections/:id -> full evidence payload for panel.
- POST /api/connections -> manual submission (required: verse refs, claim text, modern source links; optional image attachments).
- POST /api/uploads -> pre-signed upload URL flow for evidence images.
- POST /api/connections/:id/votes -> up/down vote by axis.

## Validation Rules

- Every connection must reference at least one valid verse ID and one valid entity ID.
- Claim text is required and must be non-empty.
- At least one source link (claim_facts) required per connection.
- Entity references must point to existing entity IDs (or include a moderated create flow).
- Image attachments (if provided) must pass limits and be linked to the submitted connection:
  - max 4 images per submission
  - max 5MB per image
  - MIME allowlist: `image/jpeg`, `image/png`, `image/webp`
  - strip EXIF metadata on ingest
- Connection status defaults to pending for user submissions; seed set is `established`.

### Submission Intake Flow (MVP)
1. Client calls POST /api/uploads for each image and uploads to object storage.
2. Client submits POST /api/connections with claim/citation payload plus uploaded asset IDs.
3. Server validates verse references, required links, and attachment metadata.
4. Server writes connections + claims/citations + connection_media_assets in one transaction.
5. New submission is persisted as pending and visible with clear pending badge/state.

### Client Architecture (MVP)
- Board rendered client-side; initial payload is entity + connection graph (no evidence bodies).
- Evidence panel fetched on demand (`GET /api/connections/:id`).
- Submission form supports drag/drop image evidence and caption fields.
- Mobile mode: single-connection focus route (`/c/:id`).

## Name Ideas
- Exegesis (the academic term for textual interpretation)
- Red String
- The Board
- Prophecy.ai
- Patmos (where John wrote Revelation)
- 666.ai
- Megiddo (site of Armageddon)

## Virality Mechanics
1. **Screenshot-native**: the board IS the content. every view is shareable
2. **Community = content**: users generate the interesting connections, not just us
3. **Deadpan tone**: people share it because they can't tell if it's serious
4. **Progressive revelation**: you start with one connection, each click goes deeper
5. **"Holy shit" moments**: the etymologies and numerology genuinely surprise people
6. **Twitter-native**: each connection fits in a tweet + screenshot
7. **Controversial by nature**: mixing religion + tech + AI = engagement
