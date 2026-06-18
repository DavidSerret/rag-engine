-- Enable pgvector extension
create extension if not exists vector;

-- Documents table for storing chunks and their embeddings
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1024),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- HNSW index for fast cosine similarity search
create index on documents
using hnsw (embedding vector_cosine_ops);

-- Function to search documents by semantic similarity
create or replace function match_documents (
  query_embedding vector(1024),
  match_count int default 15
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  order by embedding <=> query_embedding
  limit match_count;
$$;
