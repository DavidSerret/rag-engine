"use client";

import { strings, type Lang } from "@/lib/i18n";
import { type Skin, type SkinId } from "@/lib/skins";
import UploadZone from "./UploadZone";
import SkinSelector from "./SkinSelector";

export default function UploadLanding({
  apiKey,
  lang,
  skin,
  onApiKeyChange,
  onLangToggle,
  onSuccess,
  onSkinChange,
}: {
  apiKey: string;
  lang: Lang;
  skin: Skin;
  onApiKeyChange: (key: string) => void;
  onLangToggle: () => void;
  onSuccess: (info: { name: string; chunks: number }) => void;
  onSkinChange: (id: SkinId) => void;
}) {
  const s = strings[lang];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="shrink-0 px-6 py-4 flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase text-zinc-700">rag-engine</span>
        <LangToggle lang={lang} onToggle={onLangToggle} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-dim)] bg-[var(--accent-bg)] text-[var(--accent)] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            {s.ready}
          </div>

          <h1 className="text-5xl font-medium tracking-tight bg-gradient-to-br from-[var(--accent)] to-amber-400 bg-clip-text text-transparent">
            rag-engine
          </h1>

          <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">{s.tagline}</p>
        </div>

        <div className="w-full max-w-md">
          <SkinSelector currentId={skin.id} onChange={onSkinChange} />
        </div>

        <div className="w-full max-w-md flex flex-col gap-1.5">
          <p className="text-[10px] tracking-widest uppercase text-zinc-700">{skin.uploadLabel}</p>
          <div className="h-44">
            <UploadZone apiKey={apiKey} lang={lang} onSuccess={onSuccess} />
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-1.5">
          <label className="text-[10px] tracking-widest uppercase text-zinc-700">
            {s.apiKeyLabel}
          </label>
          <input
            type="password"
            className="h-9 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 text-xs text-zinc-400 placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors"
            placeholder={s.apiKeyPlaceholder}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
        </div>
      </main>
    </div>
  );
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase"
    >
      <span className={lang === "en" ? "text-[var(--accent)]" : "text-zinc-600 hover:text-zinc-400 transition-colors"}>
        EN
      </span>
      <span className="text-zinc-700">·</span>
      <span className={lang === "es" ? "text-[var(--accent)]" : "text-zinc-600 hover:text-zinc-400 transition-colors"}>
        ES
      </span>
    </button>
  );
}
