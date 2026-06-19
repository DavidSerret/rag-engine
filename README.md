# rag-engine

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ecf8e?logo=supabase&logoColor=white)
![Cohere](https://img.shields.io/badge/Cohere-RAG-d4a017)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel&logoColor=white)

**[→ Live demo](https://rag-engine-gamma.vercel.app)**

Upload any PDF and ask it anything. Answers are grounded strictly in the document and include exact citations.

---

## Pipeline

```
INGESTION

  PDF Upload ──► Text Extraction ──► Recursive Chunking ──► Embedding ──► Supabase
   (browser)        (unpdf)          ~600 tok / 100 tok      (Cohere)    pgvector
                                          overlap           embed-v3.0    HNSW idx


QUERY

  Question ──► Embedding ──► Vector Search ──► Reranking ──► Generation ──► Answer
               (Cohere)       cosine sim        top 5 of     (Cohere)     + citations
             search_query      top 15          rerank-v3   command-r-plus
```

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16, TypeScript | App Router, server actions |
| Database | Supabase + pgvector | HNSW index, `match_documents` RPC |
| Embeddings | Cohere `embed-multilingual-v3.0` | 1024 dims, `search_document` / `search_query` |
| Reranking | Cohere `rerank-multilingual-v3.0` | top 15 → top 5 |
| Generation | Cohere `command-r-plus-08-2024` | grounded, citation-aware prompt |
| PDF parsing | `unpdf` | works in serverless, no native deps |
| UI | Tailwind CSS v4, DM Mono | dark theme, teal/amber palette |

---

## Features

- **Drag & drop** PDF upload with real-time progress feedback
- **Semantic search** via pgvector cosine similarity
- **Cross-encoder reranking** for precision on top of vector recall
- **Cited answers** — every claim references a specific fragment and its position in the document
- **Language toggle** — EN / ES switch affects both UI strings and the model preamble
- **Inline document replacement** — swap PDFs mid-conversation without navigating away
- **BYO API key** — users can provide their own Cohere key in the UI

---

## Key Technical Decisions

**Two-phase retrieval** — ANN vector search (fast, high recall) retrieves 15 candidates. A cross-encoder reranker (slow, high precision) re-scores them and returns the top 5. Neither alone is sufficient for production quality.

**Input type distinction** — Cohere requires `search_document` at ingestion time and `search_query` at query time. Mixing them silently degrades retrieval.

**Recursive chunking** — Text is split at paragraph → sentence → word boundaries (~600 tokens, ~100 token overlap, min 100 chars), preserving semantic coherence across chunks.

**Document isolation** — The table is cleared before each ingestion. One active document at a time keeps the demo focused and avoids cross-document contamination.

**Language-aware generation** — The EN/ES toggle changes both UI strings and the model preamble, so fragment citations (`Fragment 1` vs `Fragmento 1`) are consistent with the answer language.

---

## Database Schema

```sql
create extension if not exists vector;

create table documents (
  id         uuid primary key default gen_random_uuid(),
  content    text not null,
  embedding  vector(1024),
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index on documents using hnsw (embedding vector_cosine_ops);

create or replace function match_documents (
  query_embedding vector(1024),
  match_count     int default 15
)
returns table (id uuid, content text, metadata jsonb, similarity float)
language sql stable as $$
  select id, content, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  order by embedding <=> query_embedding
  limit match_count;
$$;

grant all on table documents to service_role;
```

---

## Running Locally

**Prerequisites:** Node.js 18+, a [Supabase](https://supabase.com) project with the schema above, a [Cohere](https://cohere.com) API key.

```bash
git clone https://github.com/your-user/rag-engine
cd rag-engine
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
COHERE_API_KEY=...
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new) — set **Root Directory** to `rag-engine`
3. Add the four environment variables from `.env.local` in the Vercel dashboard
4. Deploy

> Vercel's default API route payload limit is 4.5 MB. For larger PDFs, set `bodySizeLimit` in `next.config.ts`.

---

## Project Structure

```
app/
  api/
    ingest/route.ts      # PDF → chunks → embeddings → Supabase
    query/route.ts       # question → embed → search → rerank → generate
  components/
    Chat.tsx             # conversation UI + inline document replacement
    UploadLanding.tsx    # initial upload screen
    UploadZone.tsx       # drag & drop PDF upload
  page.tsx               # state machine: landing ↔ chat
lib/
  chunker.ts             # recursive text splitting
  cohere.ts              # shared Cohere client factory
  db.ts                  # Supabase insert + clear
  embedder.ts            # embed queries and document chunks
  generator.ts           # LLM answer generation
  i18n.ts                # EN/ES strings and model preambles
  pdf.ts                 # PDF extraction and cleaning
  retriever.ts           # vector search + reranking
supabase/
  schema.sql             # full database schema
```
