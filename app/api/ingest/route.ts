import { NextRequest, NextResponse } from 'next/server'
import { extractText } from '@/lib/extractor'
import { chunkText } from '@/lib/chunker'
import { embedChunks } from '@/lib/embedder'
import { insertChunks } from '@/lib/db'

export const runtime = 'nodejs'

const ACCEPTED = new Set(['pdf', 'docx', 'txt', 'md'])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const cohereApiKey = formData.get('cohereApiKey') as string | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ACCEPTED.has(ext)) {
      return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 })
    }

    const text = await extractText(file)
    const chunks = chunkText(text)
    const embedded = await embedChunks(chunks, cohereApiKey ?? undefined)
    const inserted = await insertChunks(embedded, file.name)

    return NextResponse.json({ inserted })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
