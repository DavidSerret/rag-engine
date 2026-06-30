"use client";

import { strings } from "@/lib/i18n";
import { type Skin, type SkinId } from "@/lib/skins";
import UploadZone from "./UploadZone";
import SkinSelector from "./SkinSelector";

const s = strings["en"];

export default function UploadLanding({
  apiKey,
  skin,
  onApiKeyChange,
  onSuccess,
  onSkinChange,
}: {
  apiKey: string;
  skin: Skin;
  onApiKeyChange: (key: string) => void;
  onSuccess: (filename: string) => void;
  onSkinChange: (id: SkinId) => void;
}) {
  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-0 ${
          skin.pattern === "grid" ? "skin-pattern-grid" : skin.pattern === "dots" ? "skin-pattern-dots" : ""
        } [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]`}
      />

      <header className="relative shrink-0 px-4 sm:px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-zinc-700">RAG Engine</span>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center gap-8 px-4 sm:px-6 py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-dim)] bg-[var(--accent-bg)] text-[var(--accent)] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            {s.ready}
          </div>

          <h1 className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[0.18em] bg-gradient-to-br from-[var(--accent)] to-amber-400 bg-clip-text text-transparent">
              RAG
            </span>
            <span className="mt-1 sm:mt-2 text-lg sm:text-2xl md:text-3xl font-light tracking-[0.55em] pl-[0.55em] text-zinc-300">
              ENGINE
            </span>
          </h1>

          <SkinHero skinId={skin.id} />
        </div>

        <div className="w-full max-w-md">
          <SkinSelector currentId={skin.id} onChange={onSkinChange} />
        </div>

        <div className="w-full max-w-md flex flex-col gap-1.5">
          <p className="text-[10px] tracking-widest uppercase text-zinc-700">{skin.uploadLabel}</p>
          <div className="h-44">
            <UploadZone
              apiKey={apiKey}
              radius={skin.radius}
              onSuccess={(info) => onSuccess(info.name)}
            />
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-1.5">
          <label className="text-[10px] tracking-widest uppercase text-zinc-700">
            {s.apiKeyLabel}
          </label>
          <input
            type="password"
            className={`h-9 ${skin.radius} bg-zinc-900/60 border border-zinc-800 px-3 text-xs text-zinc-400 placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors`}
            placeholder={s.apiKeyPlaceholder}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
        </div>
      </main>
    </div>
  );
}

function SkinHero({ skinId }: { skinId: SkinId }) {
  if (skinId === "cleantech") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl">⚡</span>
        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
          Upload technical energy documentation — datasheets, regulations, reports
        </p>
      </div>
    );
  }

  if (skinId === "physics") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl">⚛</span>
        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
          Upload physics or math material — lecture notes, textbooks, problem sets
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
        Upload any PDF and ask it anything
      </p>
    </div>
  );
}
