"use client";

import { useState } from "react";
import { type Lang } from "@/lib/i18n";
import { skins, type SkinId } from "@/lib/skins";
import UploadLanding from "./components/UploadLanding";
import Chat from "./components/Chat";

type DocInfo = { name: string; chunks: number };

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [docInfo, setDocInfo] = useState<DocInfo | null>(null);
  const [docVersion, setDocVersion] = useState(0);
  const [skinId, setSkinId] = useState<SkinId>("generic");

  const skin = skins[skinId];
  const toggleLang = () => setLang((l) => (l === "en" ? "es" : "en"));

  function handleDocumentLoaded(info: DocInfo) {
    setDocInfo(info);
    setDocVersion((v) => v + 1);
  }

  function handleSkinChange(id: SkinId) {
    setSkinId(id);
    setDocVersion((v) => v + 1);
  }

  const cssVars = {
    "--accent": skin.colors.accent,
    "--accent-dim": skin.colors.accentDim,
    "--accent-bg": skin.colors.accentBg,
  } as React.CSSProperties;

  if (!docInfo) {
    return (
      <div style={cssVars}>
        <UploadLanding
          apiKey={apiKey}
          lang={lang}
          skin={skin}
          onApiKeyChange={setApiKey}
          onLangToggle={toggleLang}
          onSuccess={handleDocumentLoaded}
          onSkinChange={handleSkinChange}
        />
      </div>
    );
  }

  return (
    <div style={cssVars}>
      <Chat
        key={docVersion}
        apiKey={apiKey}
        docInfo={docInfo}
        lang={lang}
        skin={skin}
        onLangToggle={toggleLang}
        onDocumentReplaced={handleDocumentLoaded}
        onSkinChange={handleSkinChange}
      />
    </div>
  );
}
