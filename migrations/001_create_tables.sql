-- Prophecy Board MVP schema

CREATE TABLE IF NOT EXISTS p_entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('source', 'modern')),
  name TEXT NOT NULL,
  metadata_json JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book TEXT NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  text_kjv TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (book, chapter, verse)
);

CREATE TABLE IF NOT EXISTS p_connections (
  id TEXT PRIMARY KEY,
  source_entity_id TEXT REFERENCES p_entities(id),
  modern_entity_id TEXT REFERENCES p_entities(id),
  claim TEXT NOT NULL,
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'established', 'rejected')),
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_claims (
  id TEXT PRIMARY KEY,
  connection_id TEXT REFERENCES p_connections(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_claim_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id TEXT REFERENCES p_claims(id) ON DELETE CASCADE,
  verse_id UUID REFERENCES p_verses(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_claim_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id TEXT REFERENCES p_claims(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  fact_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_media_assets (
  id TEXT PRIMARY KEY,
  type TEXT,
  url TEXT NOT NULL,
  source TEXT,
  attribution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_connection_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id TEXT REFERENCES p_connections(id) ON DELETE CASCADE,
  media_asset_id TEXT REFERENCES p_media_assets(id),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id TEXT REFERENCES p_connections(id) ON DELETE CASCADE,
  user_id TEXT,
  axis TEXT NOT NULL CHECK (axis IN ('rigorous', 'entertaining')),
  value INT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT,
  object_id TEXT,
  action TEXT,
  payload_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_p_verses_book_chapter ON p_verses(book, chapter);
CREATE INDEX IF NOT EXISTS idx_p_connections_status ON p_connections(status);
CREATE INDEX IF NOT EXISTS idx_p_connections_source ON p_connections(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_p_connections_modern ON p_connections(modern_entity_id);
CREATE INDEX IF NOT EXISTS idx_p_claims_connection ON p_claims(connection_id);
CREATE INDEX IF NOT EXISTS idx_p_claim_verses_claim ON p_claim_verses(claim_id);
CREATE INDEX IF NOT EXISTS idx_p_claim_facts_claim ON p_claim_facts(claim_id);
CREATE INDEX IF NOT EXISTS idx_p_votes_connection ON p_votes(connection_id);
CREATE INDEX IF NOT EXISTS idx_p_audit_log_object ON p_audit_log(object_type, object_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_p_connection_media_assets_pair
  ON p_connection_media_assets(connection_id, media_asset_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_p_claim_verses_pair
  ON p_claim_verses(claim_id, verse_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_p_claim_facts_triplet
  ON p_claim_facts(claim_id, source_url, fact_text);
