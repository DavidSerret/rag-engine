"use client";

import { useEffect, useRef, useState } from "react";

type Source = {
  fragment: number;
  preview: string;
  metadata: { index: number; start: number; end: number };
};

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; answer: string; sources: Source[] }
  | { role: "error"; message: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "error", message: data.error ?? "Error al consultar." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", answer: data.answer, sources: data.sources }]);
    } catch {
      setMessages((prev) => [...prev, { role: "error", message: "No se pudo conectar con el servidor." }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Área de mensajes */}
      <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-zinc-700 text-xs">sube un documento para empezar</span>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={i} className="flex justify-end">
                <span className="max-w-[75%] rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-200 leading-relaxed">
                  {msg.text}
                </span>
              </div>
            );
          }

          if (msg.role === "assistant") {
            return (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-[10px] text-teal-600 tracking-widest uppercase">respuesta</span>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {msg.answer}
                </div>

                {msg.sources.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-600 tracking-widest uppercase">
                      fragmentos consultados
                    </span>
                    {msg.sources.map((src) => (
                      <div
                        key={src.fragment}
                        className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 flex gap-3"
                      >
                        <span className="shrink-0 text-[10px] text-teal-500 font-medium mt-0.5">
                          #{src.fragment}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {src.preview}
                          </p>
                          <span className="text-[10px] text-zinc-700">
                            pos. {src.metadata.start}–{src.metadata.end}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={i} className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2">
              <p className="text-xs text-red-400">{msg.message}</p>
            </div>
          );
        })}

        {loading && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-teal-600 tracking-widest uppercase">respuesta</span>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
              <Spinner />
              <span className="text-xs text-zinc-500">generando…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors disabled:opacity-50"
          placeholder="haz una pregunta sobre el documento…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={loading}
        />
        <button
          className="px-4 h-10 rounded-lg text-xs transition-colors disabled:opacity-40
            bg-zinc-900 border border-zinc-800 text-zinc-500
            hover:border-teal-800 hover:text-teal-400
            disabled:hover:border-zinc-800 disabled:hover:text-zinc-500"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          enviar
        </button>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
