import type { Lang } from './i18n'

export type Source = {
  fragment: number
  preview: string
  metadata: { index: number; start: number; end: number; filename?: string }
}

export type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; answer: string; sources: Source[]; lang: Lang }
  | { role: 'error'; message: string; question: string }
