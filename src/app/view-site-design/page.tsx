'use client';

import { useEffect, useState } from 'react';

export default function ViewSiteDesign() {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHTML() {
      try {
        const res = await fetch('/api/fetch-site-design?conversationId=cff1c752-dda2-4859-aa4e-34ade1b8b4e7');
        const data = await res.json();
        if (data.success) {
          setHtml(data.html);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHTML();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">HTML Gerado pela IA</h1>
      <pre className="bg-slate-900 text-white p-4 rounded overflow-auto max-h-screen text-xs">
        {html.substring(0, 5000)}
      </pre>
      <div className="mt-4">
        <p>Tamanho total: {html.length} caracteres</p>
      </div>
    </div>
  );
}







