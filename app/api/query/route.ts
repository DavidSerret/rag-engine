import { NextRequest, NextResponse } from 'next/server'
import { embedQuery } from '@/lib/embedder'
import { searchDocuments, rerankDocuments } from '@/lib/retriever'
import { generateAnswer } from '@/lib/generator'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'question is required' }, { status: 400 })
    }

    const embedding = await embedQuery(question)
    const candidates = await searchDocuments(embedding)
    const reranked = await rerankDocuments(question, candidates)
    const result = await generateAnswer(question, reranked)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
