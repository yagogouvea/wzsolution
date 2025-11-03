'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestChatPage() {
  const router = useRouter();

  useEffect(() => {
    // Gerar um ID de conversação de teste
    const testConversationId = 'test-chat-layout-' + Date.now();
    
    // Dados de teste (sem prompt para não gerar site)
    const testData = {
      companyName: 'Empresa Teste',
      businessSector: 'Tecnologia',
      additionalPrompt: '' // Sem prompt = não gera site automaticamente
    };

    // Salvar no sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`chat_${testConversationId}`, JSON.stringify(testData));
    }

    // Redirecionar para o chat
    const chatUrl = `/chat/${testConversationId}?companyName=${encodeURIComponent(testData.companyName)}&businessSector=${encodeURIComponent(testData.businessSector)}`;
    router.push(chatUrl);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-white">Redirecionando para o chat de teste...</p>
      </div>
    </div>
  );
}

