import { NextRequest, NextResponse } from 'next/server'
import { deleteDocumentsByFilename } from '@/lib/db'

export const runtime = 'nodejs'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params
    await deleteDocumentsByFilename(decodeURIComponent(filename))
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
