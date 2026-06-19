export type Lang = 'en' | 'es'

export const strings = {
  en: {
    ready: 'ready to analyze documents',
    tagline: 'Upload a PDF and ask it anything. Precise answers with exact citations.',
    apiKeyLabel: 'Cohere API Key — optional',
    apiKeyPlaceholder: 'sk-… leave empty to use the server key',
    whatDoYouWant: 'What do you want to know?',
    docReady: (name: string, n: number) => `${name} · ${n} fragments indexed`,
    askPlaceholder: 'Ask a question about the document…',
    continuePlaceholder: 'Continue the conversation…',
    send: 'send',
    sources: 'sources',
    generating: 'generating response…',
    replace: 'replace',
    replacing: 'replacing…',
    retry: 'retry',
    onlyPDF: 'Only PDF files are accepted.',
    serverError: 'Could not connect to the server.',
    dropPDF: 'drag a PDF or click',
    replaceDoc: 'replace document',
    processing: (name: string) => `processing ${name}…`,
    fragmentsIndexed: (n: number) => `${n} fragments indexed`,
    frag: 'frag.',
  },
  es: {
    ready: 'listo para analizar documentos',
    tagline: 'Sube un PDF y hazle cualquier pregunta. Respuestas precisas con citas exactas.',
    apiKeyLabel: 'Cohere API Key — opcional',
    apiKeyPlaceholder: 'sk-… deja vacío para usar la key del servidor',
    whatDoYouWant: '¿Qué quieres saber?',
    docReady: (name: string, n: number) => `${name} · ${n} fragmentos indexados`,
    askPlaceholder: 'Haz una pregunta sobre el documento…',
    continuePlaceholder: 'Continúa la conversación…',
    send: 'enviar',
    sources: 'fuentes',
    generating: 'generando respuesta…',
    replace: 'reemplazar',
    replacing: 'reemplazando…',
    retry: 'reintentar',
    onlyPDF: 'Solo se aceptan archivos PDF.',
    serverError: 'No se pudo conectar con el servidor.',
    dropPDF: 'arrastra un PDF o haz clic',
    replaceDoc: 'reemplazar documento',
    processing: (name: string) => `procesando ${name}…`,
    fragmentsIndexed: (n: number) => `${n} fragmentos indexados`,
    frag: 'frag.',
  },
}

export const PREAMBLES: Record<Lang, string> = {
  en: `You are an information retrieval assistant.
Answer ONLY based on the context fragments provided.
You may synthesize and interpret information from the fragments to answer questions.
Only say "I cannot find that information in the provided documents." when the topic does not appear in any fragment.
Do not introduce external facts not found in the fragments.
Cite the fragment number (Fragment 1, Fragment 2, etc.) for each statement you make.`,

  es: `Eres un asistente de recuperación de información.
Responde basándote ÚNICAMENTE en los fragmentos de contexto proporcionados.
Puedes sintetizar e interpretar la información presente en los fragmentos para responder preguntas.
Solo di "No encuentro esa información en los documentos proporcionados." cuando el tema no aparezca en ningún fragmento.
No introduzcas hechos externos que no estén en los fragmentos.
Cita el número de fragmento (Fragmento 1, Fragmento 2, etc.) de cada afirmación que hagas.`,
}
