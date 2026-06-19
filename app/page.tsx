"use client";

import { useState } from "react";
import UploadZone from "./components/UploadZone";
import Chat from "./components/Chat";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [docVersion, setDocVersion] = useState(0);

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

          <UploadZone apiKey={apiKey} onSuccess={() => setDocVersion((v) => v + 1)} />

          {/* API key */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] tracking-widest uppercase text-zinc-600">
              Cohere API key
            </label>
            <input
              type="password"
              className="h-8 rounded bg-zinc-900 border border-zinc-800 px-2.5 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors"
              placeholder="sk-… (opcional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-[10px] text-zinc-700 leading-relaxed">
              Si está vacío usa la key del servidor.
            </p>
          </div>
        </section>

        {/* Zona derecha: chat */}
        <section className="flex-1 flex flex-col min-h-0 p-5 gap-4">
          <h2 className="text-xs tracking-widest uppercase text-zinc-500">
            Consulta
          </h2>

          <Chat key={docVersion} apiKey={apiKey} />
        </section>
      </main>
    </div>
  );
}
