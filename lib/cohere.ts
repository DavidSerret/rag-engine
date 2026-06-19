import { CohereClient } from 'cohere-ai'

export function cohereClient(apiKey?: string): CohereClient {
  return new CohereClient({ token: apiKey || process.env.COHERE_API_KEY })
}
