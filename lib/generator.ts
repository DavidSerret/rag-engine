import { cohereClient } from './cohere'
import type { RankedCandidate } from './retriever'

const PREAMBLE = `Eres un asistente de recuperación de información.
Responde basándote ÚNICAMENTE en los fragmentos de contexto proporcionados.
Puedes sintetizar e interpretar la información presente en los fragmentos para responder preguntas.
Solo di "No encuentro esa información en los documentos proporcionados." cuando el tema no aparezca en ningún fragmento.
No introduzcas hechos externos que no estén en los fragmentos.
Cita el número de fragmento (Fragmento 1, Fragmento 2, etc.) de cada afirmación que hagas.`

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
  apiKey?: string
): Promise<GeneratorResult> {
  const cohere = cohereClient(apiKey)

  const context = chunks
    .map((c, i) => `Fragmento ${i + 1}:\n${c.content}`)
    .join('\n\n---\n\n')

  const message = `CONTEXTO:\n${context}\n\nPREGUNTA: ${question}`

  const response = await cohere.chat({
    model: 'command-r-plus-08-2024',
    preamble: PREAMBLE,
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
