"use client";

import { useEffect, useState } from "react";
import { skins, type SkinId } from "@/lib/skins";
import { type Message } from "@/lib/types";
import UploadLanding from "./components/UploadLanding";
import Chat from "./components/Chat";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [skinId, setSkinId] = useState<SkinId>("generic");
  const [loadedDocs, setLoadedDocs] = useState<string[] | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<SkinId, Message[]>>({
    generic: [],
    cleantech: [],
    physics: [],
  });

  const skin = skins[skinId];

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setLoadedDocs(d.filenames ?? []))
      .catch(() => setLoadedDocs([]));
  }, []);

  function handleSkinChange(id: SkinId) {
    setSkinId(id);
  }

  function handleDocumentAdded(filename: string) {
    setLoadedDocs((prev) =>
      prev && !prev.includes(filename) ? [...prev, filename] : prev
    );
  }

  function handleDocumentRemoved(filename: string) {
    setLoadedDocs((prev) => (prev ? prev.filter((f) => f !== filename) : prev));
  }

  function handleReplaceAll() {
    setLoadedDocs([]);
    setChatHistories({ generic: [], cleantech: [], physics: [] });
  }

  function handleMessagesChange(updater: (prev: Message[]) => Message[]) {
    setChatHistories((prev) => ({
      ...prev,
      [skinId]: updater(prev[skinId]),
    }));
  }

  const cssVars = {
    "--accent": skin.colors.accent,
    "--accent-dim": skin.colors.accentDim,
    "--accent-bg": skin.colors.accentBg,
  } as React.CSSProperties;

  if (loadedDocs === null) {
    return <div className="min-h-screen bg-zinc-950" style={cssVars} />;
  }

  if (loadedDocs.length === 0) {
    return (
      <div style={cssVars}>
        <UploadLanding
          apiKey={apiKey}
          skin={skin}
          onApiKeyChange={setApiKey}
          onSuccess={handleDocumentAdded}
          onSkinChange={handleSkinChange}
        />
      </div>
    );
  }

  return (
    <div style={cssVars}>
      <Chat
        key={skinId}
        apiKey={apiKey}
        skin={skin}
        messages={chatHistories[skinId]}
        loadedDocs={loadedDocs}
        onSkinChange={handleSkinChange}
        onMessagesChange={handleMessagesChange}
        onDocumentAdded={handleDocumentAdded}
        onDocumentRemoved={handleDocumentRemoved}
        onReplaceAll={handleReplaceAll}
      />
    </div>
  );
}
