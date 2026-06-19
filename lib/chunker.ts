const CHUNK_TOKENS = 600
const OVERLAP_TOKENS = 100
const CHARS_PER_TOKEN = 4

const CHUNK_SIZE = CHUNK_TOKENS * CHARS_PER_TOKEN   // ~2400 chars
const OVERLAP_SIZE = OVERLAP_TOKENS * CHARS_PER_TOKEN // ~400 chars

export type Chunk = {
  content: string
  metadata: {
    index: number
    start: number
    end: number
  }
}

function findSplitPoint(text: string, maxLen: number): number {
  if (text.length <= maxLen) return text.length

  const slice = text.slice(0, maxLen)

  const para = slice.lastIndexOf('\n\n')
  if (para > maxLen * 0.5) return para + 2

  const sentence = slice.lastIndexOf('. ')
  if (sentence > maxLen * 0.5) return sentence + 2

  const space = slice.lastIndexOf(' ')
  if (space > 0) return space + 1

  return maxLen
}

export function chunkText(text: string): Chunk[] {
  const chunks: Chunk[] = []
  let pos = 0

  while (pos < text.length) {
    const splitPoint = findSplitPoint(text.slice(pos), CHUNK_SIZE)
    const end = pos + splitPoint

    chunks.push({
      content: text.slice(pos, end).trim(),
      metadata: {
        index: chunks.length,
        start: pos,
        end,
      },
    })

    pos = Math.max(pos + 1, end - OVERLAP_SIZE)
  }

  return chunks.filter(c => c.content.length > 0)
}
