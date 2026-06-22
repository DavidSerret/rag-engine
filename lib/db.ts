import { createClient } from '@supabase/supabase-js'
import type { ChunkWithEmbedding } from './embedder'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BATCH_SIZE = 100

export async function clearDocuments(): Promise<void> {
  const { error } = await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw new Error(`Supabase clear error: ${error.message}`)
}

export async function insertChunks(chunks: ChunkWithEmbedding[], filename: string): Promise<number> {
  let inserted = 0

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    const rows = batch.map(c => ({
      content: c.content,
      embedding: c.embedding,
      metadata: { ...c.metadata, filename },
    }))

    const { error } = await supabase.from('documents').insert(rows)
    if (error) throw new Error(`Supabase insert error: ${error.message}`)

    inserted += batch.length
  }

  return inserted
}

export async function getLoadedDocuments(): Promise<string[]> {
  const { data, error } = await supabase.from('documents').select('metadata')
  if (error) throw new Error(`Supabase select error: ${error.message}`)

  const seen = new Set<string>()
  for (const row of data ?? []) {
    const f = (row.metadata as { filename?: string })?.filename
    if (f) seen.add(f)
  }
  return [...seen]
}

export async function deleteDocumentsByFilename(filename: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .filter('metadata->>filename', 'eq', filename)
  if (error) throw new Error(`Supabase delete error: ${error.message}`)
}
