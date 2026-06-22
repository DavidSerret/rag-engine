import { cohereClient } from './cohere'
import type { RankedCandidate } from './retriever'
import { PREAMBLES } from './i18n'

export type GeneratorResult = {
  answer: string
  sources: Array<{
    fragment: number
    preview: string
    metadata: Record<string, unknown>
  }>
}

export async function generateAnswer(
  question: string,
  chunks: RankedCandidate[],
  apiKey?: string,
  customPreamble?: string
): Promise<GeneratorResult> {
  const cohere = cohereClient(apiKey)
  const preamble = customPreamble ?? PREAMBLES['en']

  const context = chunks
    .map((c, i) => `Fragment ${i + 1}:\n${c.content}`)
    .join('\n\n---\n\n')

  const message = `CONTEXT:\n${context}\n\nQUESTION: ${question}`

  const response = await cohere.chat({
    model: 'command-r-plus-08-2024',
    preamble,
    message,
  })

  return {
    answer: response.text,
    sources: chunks.map((c, i) => ({
      fragment: i + 1,
      preview: c.content.slice(0, 150),
      metadata: c.metadata,
    })),
  }
}
