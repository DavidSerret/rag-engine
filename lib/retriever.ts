import { createClient } from '@supabase/supabase-js'
import { cohereClient } from './cohere'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Candidate = {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export async function searchDocuments(
  embedding: number[],
  count = 15
): Promise<Candidate[]> {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: count,
  })

  if (error) throw new Error(`Supabase search error: ${error.message}`)

  return data as Candidate[]
}

export type RankedCandidate = Candidate & { relevanceScore: number }

export async function rerankDocuments(
  query: string,
  candidates: Candidate[],
  topN = 5,
  apiKey?: string
): Promise<RankedCandidate[]> {
  const cohere = cohereClient(apiKey)
  const response = await cohere.rerank({
    query,
    documents: candidates.map(c => c.content),
    model: 'rerank-multilingual-v3.0',
    topN,
  })

  return response.results.map(r => ({
    ...candidates[r.index],
    relevanceScore: r.relevanceScore,
  }))
}
