import UploadZone from "./components/UploadZone";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-800 px-6 py-3 flex items-center gap-3">
        <span className="text-teal-400 tracking-widest uppercase text-xs font-medium">
          rag-engine
        </span>
        <span className="text-zinc-700 text-xs">—</span>
        <span className="text-zinc-500 text-xs">motor de preguntas sobre documentos PDF</span>
      </header>

      {/* Main: dos zonas */}
      <main className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Zona izquierda: subida de documentos */}
        <section className="lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col p-5 gap-4">
          <h2 className="text-xs tracking-widest uppercase text-zinc-500">
            Documentos
          </h2>

          <UploadZone />
        </section>

        {/* Zona derecha: chat */}
        <section className="flex-1 flex flex-col min-h-0 p-5 gap-4">
          <h2 className="text-xs tracking-widest uppercase text-zinc-500">
            Consulta
          </h2>

          {/* Área de mensajes */}
          <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
            <span className="text-zinc-700 text-xs">
              sube un documento para empezar
            </span>
          </div>

          {/* Input placeholder */}
          <div className="flex gap-2">
            <div className="flex-1 h-10 rounded-lg bg-zinc-900 border border-zinc-800" />
            <button className="px-4 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 hover:border-teal-800 hover:text-teal-400 transition-colors">
              enviar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
