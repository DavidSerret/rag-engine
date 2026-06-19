import { NextRequest, NextResponse } from 'next/server'
import { extractAndClean } from '@/lib/pdf'
import { chunkText } from '@/lib/chunker'
import { embedChunks } from '@/lib/embedder'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const text = await extractAndClean(buffer)
  const chunks = chunkText(text)
  const embedded = await embedChunks(chunks)

  return NextResponse.json({
    received: true,
    totalChunks: embedded.length,
    firstEmbedding: embedded[0].embedding.slice(0, 5),
  })
}
