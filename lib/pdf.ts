import { PDFParse } from 'pdf-parse'

export async function extractAndClean(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText({ pageJoiner: '\n\n' })

  return result.text
    .replace(/-\n/g, '')
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
