/**
 * Componente seguro para exibir preview em iframe
 * Usa srcDoc quando possível para evitar problemas de X-Frame-Options
 * 
 * @version 2.0 - Sandbox sem allow-same-origin
 */

'use client';

import { useState, useEffect } from 'react';

interface PreviewIframeProps {
  siteId: string;
  height?: string;
  className?: string;
}

export default function PreviewIframe({ 
  siteId, 
  height = '500px',
  className = ''
}: PreviewIframeProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Buscar HTML processado da API
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 [PreviewIframe] Buscando preview para ${siteId}`);
        
        // ✅ Adicionar timestamp para forçar atualização quando necessário
        // Se o siteId não mudar mas houver nova versão, o cache será ignorado
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(`/api/preview-html/${siteId}${cacheBuster}`);
        
        console.log(`📡 [PreviewIframe] Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📦 [PreviewIframe] Data recebida:`, { hasHtml: !!data.html, htmlLength: data.html?.length });
          
          if (data.html) {
            console.log(`✅ [PreviewIframe] HTML recebido: ${data.html.length} chars`);
            console.log(`📄 [PreviewIframe] Primeiros 200 chars:`, data.html.substring(0, 200));
            setHtmlContent(data.html);
            setLoading(false);
            return;
          }
        }
        
        console.log(`⚠️ [PreviewIframe] Response não OK ou sem HTML, usando fallback`);
        // Fallback: usar URL direta
        setHtmlContent(null);
        setLoading(false);
      } catch (err) {
        console.error('❌ [PreviewIframe] Erro ao buscar preview:', err);
        setError('Erro ao carregar preview');
        setLoading(false);
      }
    };

    fetchPreview();
  }, [siteId]);
  
  // ✅ Adicionar listener para forçar atualização quando uma nova versão for salva
  useEffect(() => {
    // Escutar eventos de atualização do preview (disparados após modificações)
    const handlePreviewUpdate = () => {
      console.log('🔄 [PreviewIframe] Evento de atualização recebido, recarregando preview...');
      // Forçar recarregamento adicionando timestamp ao siteId
      const fetchPreview = async () => {
        try {
          setLoading(true);
          const cacheBuster = `?t=${Date.now()}`;
          const response = await fetch(`/api/preview-html/${siteId}${cacheBuster}`);
          if (response.ok) {
            const data = await response.json();
            if (data.html) {
              setHtmlContent(data.html);
              setLoading(false);
            }
          }
        } catch (err) {
          console.error('❌ [PreviewIframe] Erro ao atualizar preview:', err);
          setLoading(false);
        }
      };
      fetchPreview();
    };
    
    window.addEventListener('preview-update', handlePreviewUpdate);
    return () => window.removeEventListener('preview-update', handlePreviewUpdate);
  }, [siteId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Carregando preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className}`} style={{ height }}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Usar srcDoc quando possível (evita X-Frame-Options)
  if (htmlContent) {
    console.log(`🎬 [PreviewIframe] Renderizando iframe com srcDoc: ${htmlContent.length} chars`);
    return (
      <iframe
        srcDoc={htmlContent}
        className={`w-full border-0 ${className}`}
        style={{ height }}
        title="Preview do Site Gerado"
        sandbox="allow-scripts allow-forms allow-popups"
        onLoad={() => console.log('✅ [PreviewIframe] Iframe carregado com sucesso')}
        onError={(e) => console.error('❌ [PreviewIframe] Erro ao carregar iframe:', e)}
      />
    );
  }

  // Fallback: usar src com URL relativa
  return (
    <iframe
      src={`/preview/${siteId}`}
      className={`w-full border-0 ${className}`}
      style={{ height }}
      title="Preview do Site Gerado"
      sandbox="allow-scripts allow-forms allow-popups"
    />
  );
}

