"use client";

import { useState } from "react";
import { type Lang } from "@/lib/i18n";
import UploadLanding from "./components/UploadLanding";
import Chat from "./components/Chat";

type DocInfo = { name: string; chunks: number };

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [docInfo, setDocInfo] = useState<DocInfo | null>(null);
  const [docVersion, setDocVersion] = useState(0);

  const toggleLang = () => setLang((l) => (l === "en" ? "es" : "en"));

  function handleDocumentLoaded(info: DocInfo) {
    setDocInfo(info);
    setDocVersion((v) => v + 1);
  }

  if (!docInfo) {
    return (
      <UploadLanding
        apiKey={apiKey}
        lang={lang}
        onApiKeyChange={setApiKey}
        onLangToggle={toggleLang}
        onSuccess={handleDocumentLoaded}
      />
    );
  }

  return (
    <Chat
      key={docVersion}
      apiKey={apiKey}
      docInfo={docInfo}
      lang={lang}
      onLangToggle={toggleLang}
      onDocumentReplaced={handleDocumentLoaded}
    />
  );
}
