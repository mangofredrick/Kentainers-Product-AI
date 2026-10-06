-- KPIA PostgreSQL + pgvector schema
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGSERIAL PRIMARY KEY,
  source_document TEXT NOT NULL,
  source_page INTEGER,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_title TEXT,
  source_type TEXT,
  verified_at TIMESTAMPTZ,
  embedding vector(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 20);

CREATE INDEX IF NOT EXISTS document_chunks_source_page_idx
ON document_chunks(source_document, source_page);
