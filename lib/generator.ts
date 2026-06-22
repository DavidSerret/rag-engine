import { cohereClient } from './cohere'
import type { RankedCandidate } from './retriever'
import { PREAMBLES, type Lang } from './i18n'

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
  lang: Lang = 'en',
  customPreamble?: string
): Promise<GeneratorResult> {
  const cohere = cohereClient(apiKey)
  const preamble = customPreamble ?? PREAMBLES[lang]

  const fragmentLabel = lang === 'es' ? 'Fragmento' : 'Fragment'
  const contextLabel = lang === 'es' ? 'CONTEXTO' : 'CONTEXT'
  const questionLabel = lang === 'es' ? 'PREGUNTA' : 'QUESTION'

  const context = chunks
    .map((c, i) => `${fragmentLabel} ${i + 1}:\n${c.content}`)
    .join('\n\n---\n\n')

  const message = `${contextLabel}:\n${context}\n\n${questionLabel}: ${question}`

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
