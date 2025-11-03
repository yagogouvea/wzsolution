'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CreateConversationRedirect() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  useEffect(() => {
    // ✅ Redirecionar para /pt (que tem AIGeneratorSection correto)
    router.replace('/pt');
  }, [router, conversationId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white">Redirecionando para o ambiente correto...</p>
      </div>
    </div>
  );
}
