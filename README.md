# rag-engine

Production-ready RAG (Retrieval-Augmented Generation) engine for document Q&A. Upload a PDF, ask anything, get cited answers grounded strictly in the document.

**Live demo:** _add your Vercel URL here_

---

## Pipeline

### Ingestion

```
PDF Upload → Text Extraction → Recursive Chunking → Embedding → pgvector
  (browser)    (pdf-parse)      600 tok / 100 tok    (Cohere)   (Supabase)
                                    overlap
```

### Query

```
Question → Embedding → Vector Search → Reranking → Generation → Answer + Citations
            (Cohere)    top 15 chunks   top 5 chunks  (Cohere)
           search_query  cosine / HNSW  rerank-v3.0   command-r-plus
```

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 — App Router, TypeScript |
| Database | Supabase — PostgreSQL + pgvector |
| Embeddings | Cohere `embed-multilingual-v3.0` (1024 dims) |
| Reranking | Cohere `rerank-multilingual-v3.0` |
| Generation | Cohere `command-r-plus-08-2024` |
| PDF parsing | `pdf-parse` v2 |
| UI | Tailwind CSS v4, DM Mono |

---

## Key Technical Decisions

**Chunking strategy** — Recursive splitting at paragraph → sentence → word boundaries (~600 tokens, ~100 token overlap, min 100 chars). Prevents mid-sentence cuts while keeping semantic coherence across chunks.

**Two-phase retrieval** — Vector search (cosine similarity via HNSW) retrieves the top 15 candidates. A cross-encoder reranker then re-scores them and returns the top 5. This balances recall (ANN is fast but imprecise) with precision (reranker is slow but accurate).

**Input type distinction** — Cohere requires `search_document` for ingestion and `search_query` for queries. Using the wrong type silently degrades retrieval quality.

**Document isolation** — The table is cleared before each ingestion. One active document at a time keeps the demo focused; multi-document support would require a `source` metadata filter on the RPC call.

**Language toggle** — The EN/ES switch changes both UI strings and the model preamble sent to the LLM, so cited answers are generated in the selected language.

**CJS/ESM interop** — `pdf-parse` v2 is ESM-first and incompatible with Turbopack's default bundling. Fixed with `serverExternalPackages: ['pdf-parse']` in `next.config.ts`.

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

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema above applied
- A [Cohere](https://cohere.com) API key

### Setup

```bash
git clone <repo-url>
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
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import it in [vercel.com/new](https://vercel.com/new)
3. Add the four environment variables from `.env.local` in the Vercel dashboard
4. Deploy

> **Note:** Vercel's default API route payload limit is 4.5 MB. For larger PDFs, configure `bodySizeLimit` in `next.config.ts`.

---

## Project Structure

```
app/
  api/
    ingest/route.ts   # PDF → chunks → embeddings → Supabase
    query/route.ts    # question → embed → search → rerank → generate
  components/
    Chat.tsx          # conversation UI, inline document replacement
    UploadLanding.tsx # initial upload screen
    UploadZone.tsx    # drag & drop PDF upload
  page.tsx            # state machine: landing ↔ chat
lib/
  chunker.ts          # recursive text splitting
  cohere.ts           # shared Cohere client factory
  db.ts               # Supabase insert + clear
  embedder.ts         # embed queries and document chunks
  generator.ts        # LLM answer generation
  i18n.ts             # EN/ES strings and model preambles
  pdf.ts              # PDF extraction and cleaning
  retriever.ts        # vector search + reranking
supabase/
  schema.sql          # full database schema
```
