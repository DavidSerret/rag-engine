import { createClient } from '@supabase/supabase-js'
import type { ChunkWithEmbedding } from './embedder'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BATCH_SIZE = 100

export async function insertChunks(chunks: ChunkWithEmbedding[]): Promise<number> {
  let inserted = 0

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    const rows = batch.map(c => ({
      content: c.content,
      embedding: c.embedding,
      metadata: c.metadata,
    }))

    const { error } = await supabase.from('documents').insert(rows)
    if (error) throw new Error(`Supabase insert error: ${error.message}`)

    inserted += batch.length
  }

  return inserted
}
