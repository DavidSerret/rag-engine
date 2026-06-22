import { extractText as extractPdfText } from 'unpdf'
import mammoth from 'mammoth'

export async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'pdf') {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { text } = await extractPdfText(new Uint8Array(buffer), { mergePages: true })
    return clean(text as string)
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return clean(result.value)
  }

  if (ext === 'txt' || ext === 'md') {
    return clean(await file.text())
  }

  throw new Error(`Unsupported file type: .${ext}`)
}

function clean(text: string): string {
  return text
    .replace(/-\n/g, '')
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
