import { NextResponse } from 'next/server'
import { getLoadedDocuments, clearDocuments } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const filenames = await getLoadedDocuments()
    return NextResponse.json({ filenames })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearDocuments()
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
