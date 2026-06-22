"use client";

import { useEffect, useRef, useState } from "react";
import { strings } from "@/lib/i18n";
import { type Skin, type SkinId } from "@/lib/skins";
import { type Message } from "@/lib/types";
import SkinSelector from "./SkinSelector";

const s = strings["en"];

function truncateFilename(name: string, max = 22): string {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  return name.slice(0, max - ext.length - 1) + "…" + ext;
}

export default function Chat({
  apiKey,
  skin,
  messages,
  loadedDocs,
  onSkinChange,
  onMessagesChange,
  onDocumentAdded,
  onDocumentRemoved,
  onReplaceAll,
}: {
  apiKey: string;
  skin: Skin;
  messages: Message[];
  loadedDocs: string[];
  onSkinChange: (id: SkinId) => void;
  onMessagesChange: (updater: (prev: Message[]) => Message[]) => void;
  onDocumentAdded: (filename: string) => void;
  onDocumentRemoved: (filename: string) => void;
  onReplaceAll: () => void;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addDocUploading, setAddDocUploading] = useState(false);
  const [addDocError, setAddDocError] = useState<string | null>(null);
  const [replaceAllLoading, setReplaceAllLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const addDocInputRef = useRef<HTMLInputElement>(null);

  const hasMessages = messages.length > 0 || loading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    onMessagesChange((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          cohereApiKey: apiKey || undefined,
          preamble: skin.preamble.en,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        onMessagesChange((prev) => [
          ...prev,
          { role: "error", message: data.error ?? s.serverError, question },
        ]);
        return;
      }

      onMessagesChange((prev) => [
        ...prev,
        { role: "assistant", answer: data.answer, sources: data.sources },
      ]);
    } catch {
      onMessagesChange((prev) => [
        ...prev,
        { role: "error", message: s.serverError, question },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setAddDocError(null);
    setAddDocUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    if (apiKey) formData.append("cohereApiKey", apiKey);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setAddDocError(data.error ?? s.serverError);
        return;
      }
      onDocumentAdded(file.name);
    } catch {
      setAddDocError(s.serverError);
    } finally {
      setAddDocUploading(false);
    }
  }

  async function handleReplaceAll() {
    setReplaceAllLoading(true);
    try {
      await fetch("/api/documents", { method: "DELETE" });
      onReplaceAll();
    } catch {
      // Silently fail
    } finally {
      setReplaceAllLoading(false);
    }
  }

  async function handleRemoveDoc(filename: string) {
    try {
      await fetch(`/api/documents/${encodeURIComponent(filename)}`, { method: "DELETE" });
      onDocumentRemoved(filename);
    } catch {
      // Ignore — pill stays visible
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  /* ── Shared header ───────────────────────────────────────────── */
  const header = (
    <header className="shrink-0 border-b border-zinc-800/60 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {loadedDocs.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] min-w-0"
          >
            <span className="truncate max-w-[140px]">{truncateFilename(name)}</span>
            <button
              className="text-zinc-600 hover:text-zinc-300 transition-colors ml-0.5 shrink-0"
              onClick={() => handleRemoveDoc(name)}
              title={`Remove ${name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <SkinSelector currentId={skin.id} onChange={onSkinChange} compact />
      </div>
    </header>
  );

  /* ── Action row ──────────────────────────────────────────────── */
  const actionRow = (
    <div className="flex items-center justify-between px-1 mt-1.5">
      <div className="flex items-center gap-2">
        <button
          className="text-[10px] tracking-widest uppercase text-zinc-600 hover:text-[var(--accent)] transition-colors flex items-center gap-1.5 disabled:opacity-40"
          onClick={() => addDocInputRef.current?.click()}
          disabled={addDocUploading}
        >
          {addDocUploading ? <MiniSpinner /> : <span>+</span>}
          {addDocUploading ? "uploading…" : "add document"}
        </button>
        {addDocError && <span className="text-[10px] text-red-400">{addDocError}</span>}
      </div>
      <button
        className="text-[10px] tracking-widest uppercase text-zinc-600 hover:text-amber-400 transition-colors disabled:opacity-40"
        onClick={handleReplaceAll}
        disabled={replaceAllLoading}
      >
        {replaceAllLoading ? "clearing…" : "replace all ↺"}
      </button>
      <input
        ref={addDocInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={handleAddDoc}
      />
    </div>
  );

  /* ── Empty state ─────────────────────────────────────────────── */
  if (!hasMessages) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col">
        {header}

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-dim)] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
            </div>
            <h2 className="text-2xl text-zinc-200 font-medium">{s.whatDoYouWant}</h2>
            <p className="text-xs text-zinc-600">
              {loadedDocs.length} document{loadedDocs.length !== 1 ? "s" : ""} in corpus
            </p>
          </div>

          <div className="w-full max-w-2xl flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                className="flex-1 h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-[var(--accent-dim)] transition-colors"
                placeholder={skin.placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
              />
              <button
                className="px-5 h-12 rounded-xl text-sm font-medium transition-colors
                  bg-[var(--accent-bg)] border border-[var(--accent-dim)] text-[var(--accent)]
                  hover:border-[var(--accent)]
                  disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={send}
                disabled={!input.trim()}
              >
                {s.send}
              </button>
            </div>
            {actionRow}
          </div>
        </div>
      </div>
    );
  }

  /* ── Messages state ──────────────────────────────────────────── */
  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      {header}

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
                    <div className="w-5 h-5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-dim)] flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    </div>
                    <span className="text-[10px] text-[var(--accent-dim)] tracking-widest uppercase font-medium">rag</span>
                  </div>

                  <div className="pl-7 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {msg.answer}
                  </div>

                  {msg.sources.length > 0 && (
                    <div className="pl-7 flex flex-col gap-2">
                      <span className="text-[10px] text-zinc-600 tracking-widest uppercase">
                        {s.sources}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {msg.sources.map((src) => (
                          <div
                            key={src.fragment}
                            className="rounded-lg border border-[var(--accent-dim)]/20 bg-[var(--accent-bg)] px-3 py-2 flex gap-3"
                          >
                            <span className="shrink-0 text-[11px] text-[var(--accent)] font-medium mt-0.5">
                              #{src.fragment}
                            </span>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              {src.metadata.filename && (
                                <span className="text-[10px] text-zinc-600">
                                  {src.metadata.filename} · Fragment {src.fragment}
                                </span>
                              )}
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
                <div className="w-5 h-5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-dim)] flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                </div>
                <span className="text-[10px] text-[var(--accent-dim)] tracking-widest uppercase font-medium">rag</span>
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

      <div className="shrink-0 border-t border-zinc-800/60 px-4 pt-3 pb-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-0">
          <div className="flex gap-2">
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
                hover:border-[var(--accent-dim)] hover:text-[var(--accent)]
                disabled:opacity-40 disabled:cursor-not-allowed
                disabled:hover:border-zinc-800 disabled:hover:text-zinc-500"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              {s.send}
            </button>
          </div>
          {actionRow}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24">
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
