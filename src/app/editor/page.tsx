"use client";

import { useState } from "react";
import SitePreview from "@/components/SitePreview";
import ClaudeChatPanel from "@/components/ClaudeChatPanel";
import LayoutSplitView from "@/components/LayoutSplitView";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function EditorPage() {
  const [siteCode, setSiteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate(prompt: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-site-claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.ok) setSiteCode(data.code);
    } catch (error) {
      console.error('Erro ao gerar site:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutSplitView
      left={<SitePreview code={siteCode} />}
      right={<ClaudeChatPanel onSubmitPrompt={handleGenerate} />}
    >
      {loading && <LoadingOverlay message="Gerando site com IA..." />}
    </LayoutSplitView>
  );
}

