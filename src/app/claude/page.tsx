"use client";

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import SitePreview from "@/components/SitePreview";
import ClaudeChatPanel from "@/components/ClaudeChatPanel";
import LayoutSplitView from "@/components/LayoutSplitView";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function ClaudeEditorPage() {
  const [siteCode, setSiteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  // Gerar conversationId ao montar
  useEffect(() => {
    if (!conversationId) {
      setConversationId(crypto.randomUUID());
    }
  }, []);

  async function handleGenerate(prompt: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-site-claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.ok && data.code) {
        setSiteCode(data.code);
      }
    } catch (error) {
      console.error('Erro ao gerar site:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LayoutSplitView
      left={<ClaudeChatPanel onSubmitPrompt={handleGenerate} />}
      right={<SitePreview code={siteCode} />}
    >
      {loading && <LoadingOverlay message="Gerando site com Claude IA..." />}
    </LayoutSplitView>
  );
}

