import { CohereClient } from 'cohere-ai'
import type { Chunk } from './chunker'

export type ChunkWithEmbedding = Chunk & { embedding: number[] }

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })

const BATCH_SIZE = 96

export async function embedQuery(text: string): Promise<number[]> {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-multilingual-v3.0',
    inputType: 'search_query',
  })

  const floats = response.embeddings as number[][]
  if (!floats?.length) throw new Error('Cohere did not return embeddings')

  return floats[0]
}

export async function embedChunks(chunks: Chunk[]): Promise<ChunkWithEmbedding[]> {
  const results: ChunkWithEmbedding[] = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    const response = await cohere.embed({
      texts: batch.map(c => c.content),
      model: 'embed-multilingual-v3.0',
      inputType: 'search_document',
    })

    const floats = response.embeddings as number[][]
    if (!floats?.length) throw new Error('Cohere did not return embeddings')

    batch.forEach((chunk, j) => {
      results.push({ ...chunk, embedding: floats[j] })
    })
  }

  return results
}
