import { NextRequest, NextResponse } from 'next/server'
import { embedQuery } from '@/lib/embedder'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const { question } = await request.json()

  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  const embedding = await embedQuery(question)

  return NextResponse.json({
    question,
    dimensions: embedding.length,
    sample: embedding.slice(0, 5),
  })
}
