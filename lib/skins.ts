export type SkinId = 'generic' | 'cleantech' | 'physics'

export interface Skin {
  id: SkinId
  label: string
  description: string
  colors: {
    accent: string
    accentDim: string
    accentBg: string
  }
  preamble: {
    en: string
    es: string
  }
  placeholder: string
  uploadLabel: string
}

export const skins: Record<SkinId, Skin> = {
  generic: {
    id: 'generic',
    label: 'General',
    description: 'Ask anything about your document',
    colors: {
      accent: '#5ec8b8',
      accentDim: '#3a8c80',
      accentBg: '#0d1f1e',
    },
    preamble: {
      en: `You are a helpful assistant. Answer strictly based on the provided document fragments. If the answer is not in the context, say so explicitly. Cite the fragment number for each claim.`,
      es: `Eres un asistente útil. Responde estrictamente basándote en los fragmentos proporcionados. Si la respuesta no está en el contexto, indícalo. Cita el número de fragmento para cada afirmación.`,
    },
    placeholder: 'Ask anything about the document...',
    uploadLabel: 'Upload any PDF document',
  },
  cleantech: {
    id: 'cleantech',
    label: 'Cleantech',
    description: 'Technical assistant for energy & industrial docs',
    colors: {
      accent: '#4ade80',
      accentDim: '#16a34a',
      accentBg: '#0a1a0f',
    },
    preamble: {
      en: `You are a technical assistant specializing in energy systems, district heating, renewable energy, and industrial efficiency. Answer strictly based on the provided technical documentation, using precise engineering terminology. If the answer is not in the context, say so explicitly. Cite the specific fragment number for each technical claim.`,
      es: `Eres un asistente técnico especializado en sistemas de energía, calefacción urbana, energías renovables y eficiencia industrial. Responde estrictamente basándote en la documentación técnica proporcionada, usando terminología precisa. Si la respuesta no está en el contexto, indícalo. Cita el número de fragmento para cada afirmación técnica.`,
    },
    placeholder: 'Ask about energy systems, specs, or efficiency...',
    uploadLabel: 'Upload technical energy documentation',
  },
  physics: {
    id: 'physics',
    label: 'Physics',
    description: 'Academic assistant for scientific documents',
    colors: {
      accent: '#818cf8',
      accentDim: '#4f46e5',
      accentBg: '#0d0e1f',
    },
    preamble: {
      en: `You are an academic assistant specializing in physics and mathematics. Answer strictly based on the provided document fragments. When relevant, reference equations, theorems, or derivations present in the context. If the answer is not in the context, say so explicitly. Cite the fragment number for each claim.`,
      es: `Eres un asistente académico especializado en física y matemáticas. Responde estrictamente basándote en los fragmentos del documento. Cuando sea relevante, referencia ecuaciones, teoremas o derivaciones presentes en el contexto. Si la respuesta no está en el contexto, indícalo. Cita el número de fragmento para cada afirmación.`,
    },
    placeholder: 'Ask about equations, derivations, or concepts...',
    uploadLabel: 'Upload physics or math study material',
  },
}
