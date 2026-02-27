export interface Entity {
  id: string;
  type: 'source' | 'modern';
  name: string;
  metadata_json: Record<string, unknown>;
  image_url: string | null;
  created_at: string;
}

export interface Connection {
  id: string;
  source_entity_id: string;
  modern_entity_id: string;
  claim: string;
  reasoning: string | null;
  status: 'pending' | 'established' | 'rejected';
  source_name: string;
  source_type: string;
  source_metadata: Record<string, unknown>;
  modern_name: string;
  modern_type: string;
  modern_metadata: Record<string, unknown>;
  created_at: string;
}

export interface Verse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text_kjv: string;
}

export interface Claim {
  id: string;
  connection_id: string;
  text: string;
  verses: Verse[];
  facts: { id: string; source_url: string; fact_text: string }[];
}

export interface ConnectionDetail extends Connection {
  source_image: string | null;
  modern_image: string | null;
  claims: Claim[];
  media: { id: string; type: string; url: string; caption: string | null }[];
  votes: Record<string, { score: number; count: number }>;
}
