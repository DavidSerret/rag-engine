"use client";

import { useEffect, useRef, useState } from "react";
import { strings, type Lang } from "@/lib/i18n";

type Source = {
  fragment: number;
  preview: string;
  metadata: { index: number; start: number; end: number };
};

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; answer: string; sources: Source[] }
  | { role: "error"; message: string; question: string };

type DocInfo = { name: string; chunks: number };

export default function Chat({
  apiKey,
  docInfo,
  lang,
  onLangToggle,
  onDocumentReplaced,
}: {
  apiKey: string;
  docInfo: DocInfo;
  lang: Lang;
  onLangToggle: () => void;
  onDocumentReplaced: (info: DocInfo) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const s = strings[lang];

  const hasMessages = messages.length > 0 || loading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
        body: JSON.stringify({ question, cohereApiKey: apiKey || undefined, lang }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "error", message: data.error ?? s.serverError, question },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", answer: data.answer, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "error", message: s.serverError, question },
      ]);
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

  /* ── Empty state ─────────────────────────────────────────────── */
  if (!hasMessages) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col">
        <ChatHeader
          docInfo={docInfo}
          apiKey={apiKey}
          lang={lang}
          onLangToggle={onLangToggle}
          onDocumentReplaced={onDocumentReplaced}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-teal-400" />
            </div>
            <h2 className="text-2xl text-zinc-200 font-medium">{s.whatDoYouWant}</h2>
            <p className="text-xs text-zinc-600">{s.docReady(docInfo.name, docInfo.chunks)}</p>
          </div>

          <div className="w-full max-w-2xl flex gap-2">
            <input
              className="flex-1 h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-teal-800/60 transition-colors"
              placeholder={s.askPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
            />
            <button
              className="px-5 h-12 rounded-xl text-sm font-medium transition-colors
                bg-teal-500/10 border border-teal-800/50 text-teal-400
                hover:bg-teal-500/20 hover:border-teal-600
                disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={send}
              disabled={!input.trim()}
            >
              {s.send}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Messages state ──────────────────────────────────────────── */
  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      <ChatHeader
        docInfo={docInfo}
        apiKey={apiKey}
        lang={lang}
        onLangToggle={onLangToggle}
        onDocumentReplaced={onDocumentReplaced}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-6">
          {messages.map((msg, i) => {
            if (msg.role === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.role === "assistant") {
              return (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    </div>
                    <span className="text-[10px] text-teal-500 tracking-widest uppercase font-medium">rag</span>
                  </div>

                  <div className="pl-7 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {msg.answer}
                  </div>

                  {msg.sources.length > 0 && (
                    <div className="pl-7 flex flex-col gap-2">
                      <span className="text-[10px] text-amber-600/80 tracking-widest uppercase">
                        {s.sources}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.sources.map((src) => (
                          <div
                            key={src.fragment}
                            className="rounded-lg border border-amber-900/30 bg-amber-950/10 px-3 py-2 flex gap-3"
                          >
                            <span className="shrink-0 text-[11px] text-amber-500 font-medium mt-0.5">
                              #{src.fragment}
                            </span>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <p className="text-xs text-zinc-500 leading-relaxed">{src.preview}</p>
                              <span className="text-[10px] text-zinc-700">
                                pos. {src.metadata.start}–{src.metadata.end}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3">
                <span className="text-red-500 text-xs shrink-0 mt-0.5">✕</span>
                <p className="text-xs text-red-400 flex-1">{msg.message}</p>
                <button
                  className="shrink-0 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  onClick={() => setInput(msg.question)}
                >
                  {s.retry}
                </button>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-teal-500 tracking-widest uppercase font-medium">rag</span>
              </div>
              <div className="pl-7 flex items-center gap-2">
                <Spinner />
                <span className="text-xs text-zinc-600">{s.generating}</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-800/60 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
            placeholder={s.continuePlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <button
            className="px-5 h-11 rounded-xl text-sm transition-colors
              bg-zinc-900 border border-zinc-800 text-zinc-500
              hover:border-teal-800 hover:text-teal-400
              disabled:opacity-40 disabled:cursor-not-allowed
              disabled:hover:border-zinc-800 disabled:hover:text-zinc-500"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            {s.send}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ChatHeader with inline document replacement ─────────────── */
function ChatHeader({
  docInfo,
  apiKey,
  lang,
  onLangToggle,
  onDocumentReplaced,
}: {
  docInfo: DocInfo;
  apiKey: string;
  lang: Lang;
  onLangToggle: () => void;
  onDocumentReplaced: (info: DocInfo) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = strings[lang];

  async function replaceDoc(file: File) {
    if (file.type !== "application/pdf") {
      setUploadError(s.onlyPDF);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (apiKey) formData.append("cohereApiKey", apiKey);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? s.serverError);
        return;
      }
      onDocumentReplaced({ name: file.name, chunks: data.inserted });
    } catch {
      setUploadError(s.serverError);
    } finally {
      setUploading(false);
    }
  }

  return (
    <header className="shrink-0 border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-teal-400 tracking-widest uppercase text-xs font-medium shrink-0">
          rag-engine
        </span>
        <span className="text-zinc-700 text-xs shrink-0">—</span>
        <span className="text-zinc-500 text-xs truncate">{docInfo.name}</span>
        <span className="text-zinc-700 text-[10px] shrink-0">·</span>
        <span className="text-zinc-700 text-[10px] shrink-0">{docInfo.chunks} {s.frag}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {uploadError && (
          <span className="text-[10px] text-red-400">{uploadError}</span>
        )}

        <button
          className={`text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5
            ${uploading ? "text-zinc-600 cursor-not-allowed" : "text-zinc-600 hover:text-amber-400"}`}
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading && <MiniSpinner />}
          {uploading ? s.replacing : s.replace}
        </button>

        <LangToggle lang={lang} onToggle={onLangToggle} />

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) replaceDoc(file);
            e.target.value = "";
          }}
        />
      </div>
    </header>
  );
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase">
      <span className={lang === "en" ? "text-teal-400" : "text-zinc-600 hover:text-zinc-400 transition-colors"}>
        EN
      </span>
      <span className="text-zinc-700">·</span>
      <span className={lang === "es" ? "text-teal-400" : "text-zinc-600 hover:text-zinc-400 transition-colors"}>
        ES
      </span>
    </button>
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

function MiniSpinner() {
  return (
    <svg className="w-3 h-3 animate-spin text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
