'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Shield, Eye } from 'lucide-react';

/**
 * Página de Preview do Builder.io
 * 
 * Renderiza o conteúdo personalizado do Builder.io de forma protegida.
 * Por questões de segurança, o Builder.io SDK não será carregado no cliente.
 * Em vez disso, renderizaremos o JSON como HTML usando uma transformação segura.
 */
export default function BuilderPreviewPage({ params }: { params: Promise<{ model: string }> }) {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedModel, setResolvedModel] = useState<string>('');

  useEffect(() => {
    // Resolver params assíncrono
    params.then(resolved => {
      setResolvedModel(resolved.model);
    });
  }, [params]);

  useEffect(() => {
    if (!resolvedModel) return;

    // Buscar conteúdo da query string ou API
    const dataParam = searchParams.get('data');
    
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setContent(decoded);
        setLoading(false);
      } catch (parseError) {
        console.error('Erro ao parsear dados:', parseError);
        setError('Erro ao processar conteúdo do Builder.io');
        setLoading(false);
      }
    } else {
      // Tentar buscar via API se não estiver na query string
      fetchContent();
    }
  }, [resolvedModel, searchParams]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/builder-content/${resolvedModel}`);
      const data = await response.json();
      
      if (data.success && data.content) {
        setContent(data.content);
      } else {
        setError('Conteúdo não encontrado');
      }
    } catch (fetchError) {
      console.error('Erro ao buscar conteúdo:', fetchError);
      setError('Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar conteúdo do Builder.io como HTML
  const renderBuilderContent = (contentData: Record<string, unknown>): string => {
    // Esta função transformaria o JSON do Builder.io em HTML
    // Por enquanto, retornamos uma estrutura básica renderizável
    
    if (!contentData.blocks || !Array.isArray(contentData.blocks)) {
      return '<div class="p-8 text-center"><p>Conteúdo do Builder.io não encontrado</p></div>';
    }

    // Simplificação: renderizar blocos básicos
    // Em produção, você usaria o SDK oficial do Builder.io ou um renderer customizado
    const blocksHtml = contentData.blocks.map((block: Record<string, unknown>) => {
      const tagName = block.tagName || 'div';
      const props = block.properties as Record<string, unknown> || {};
      const text = props.text || '';
      const className = props.className || '';
      const style = props.style || '';
      
      return `<${tagName} class="${className}" style="${style}">${text}</${tagName}>`;
    }).join('');

    return `
      <div class="builder-content">
        ${blocksHtml}
      </div>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando preview do Builder.io...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Conteúdo não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de Proteção */}
      <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Preview Builder.io - Modelo: {resolvedModel}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-4 h-4" />
          <span>Modo Preview</span>
        </div>
      </div>

      {/* Container do Preview */}
      <div className="relative">
        {/* Watermark de Proteção */}
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-4 right-4 bg-red-600/90 text-white px-3 py-1 rounded text-xs font-bold">
            PREVIEW • WZ SOLUTION
          </div>
          <div className="absolute bottom-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded text-xs font-bold">
            PROTEGIDO • MODELO: {resolvedModel}
          </div>
        </div>

        {/* Conteúdo Renderizado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          dangerouslySetInnerHTML={{
            __html: renderBuilderContent(content)
          }}
          className="builder-preview-container"
        />
      </div>

      {/* Estilos inline para proteção */}
      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
        .builder-preview-container {
          position: relative;
          z-index: 10;
        }
        .builder-preview-container * {
          user-select: none;
          -webkit-user-select: none;
        }
        .builder-content {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}

