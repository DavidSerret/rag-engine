import { NextRequest, NextResponse } from 'next/server'
import { embedQuery } from '@/lib/embedder'
import { searchDocuments, rerankDocuments } from '@/lib/retriever'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const { question } = await request.json()

  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  const embedding = await embedQuery(question)
  const candidates = await searchDocuments(embedding)
  const reranked = await rerankDocuments(question, candidates)

  return NextResponse.json({
    question,
    reranked: reranked.map(c => ({
      relevanceScore: c.relevanceScore,
      preview: c.content.slice(0, 120),
    })),
  })
}
