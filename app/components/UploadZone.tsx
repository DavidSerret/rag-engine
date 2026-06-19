"use client";

import { useRef, useState } from "react";
import { strings, type Lang } from "@/lib/i18n";

type State =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "uploading"; name: string }
  | { status: "success"; name: string; chunks: number }
  | { status: "error"; message: string };

export default function UploadZone({
  apiKey,
  lang,
  onSuccess,
}: {
  apiKey: string;
  lang: Lang;
  onSuccess: (info: { name: string; chunks: number }) => void;
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const s = strings[lang];

  async function upload(file: File) {
    if (file.type !== "application/pdf") {
      setState({ status: "error", message: s.onlyPDF });
      return;
    }

    setState({ status: "uploading", name: file.name });

    const formData = new FormData();
    formData.append("file", file);
    if (apiKey) formData.append("cohereApiKey", apiKey);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      let data: { error?: string; inserted?: number };
      try {
        data = await res.json();
      } catch {
        setState({ status: "error", message: `Server error (${res.status})` });
        return;
      }

      if (!res.ok) {
        setState({ status: "error", message: data.error ?? s.serverError });
        return;
      }

      setState({ status: "success", name: file.name, chunks: data.inserted! });
      onSuccess({ name: file.name, chunks: data.inserted! });
    } catch {
      setState({ status: "error", message: s.serverError });
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setState({ status: "idle" });
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  const isUploading = state.status === "uploading";

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div
        className={`flex-1 rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer select-none
          ${state.status === "dragging" ? "border-teal-500 bg-teal-950/20" : "border-zinc-700 hover:border-zinc-500"}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setState({ status: "dragging" }); }}
        onDragLeave={() => setState({ status: "idle" })}
        onDrop={onDrop}
      >
        {isUploading ? (
          <>
            <Spinner />
            <span className="text-xs text-zinc-400">{s.processing(state.name)}</span>
          </>
        ) : state.status === "success" ? (
          <>
            <svg className="w-7 h-7 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-zinc-600">{s.replaceDoc}</span>
          </>
        ) : (
          <>
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-zinc-600">{s.dropPDF}</span>
          </>
        )}
      </div>

      {state.status === "success" && (
        <div className="rounded-lg border border-teal-800 bg-teal-950/30 px-3 py-2">
          <p className="text-xs text-teal-400">✓ {state.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{s.fragmentsIndexed(state.chunks)}</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2">
          <p className="text-xs text-red-400">{state.message}</p>
          <button
            className="text-xs text-zinc-500 hover:text-zinc-300 mt-1 transition-colors"
            onClick={() => setState({ status: "idle" })}
          >
            {s.retry}
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin text-teal-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
