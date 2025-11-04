'use client';

import { useEffect, useState, Suspense } from 'react';
import StaticAIGeneratedHome from "@/components/StaticAIGeneratedHome";

export const dynamic = 'force-dynamic';

function HomePTContent() {
  const [ready, setReady] = useState(false);

  // Esconder COMPLETAMENTE Header/Footer/WhatsApp do layout padrão ANTES de renderizar
  useEffect(() => {
    // Esconder IMEDIATAMENTE usando CSS inline no head para evitar flash
    const style = document.createElement('style');
    style.id = 'hide-old-layout-pt';
    style.textContent = `
      .site-header-footer,
      header:not(#ai-generated-site-root header),
      footer:not(#ai-generated-site-root footer),
      [aria-label="Contato via WhatsApp"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
        opacity: 0 !important;
      }
      main {
        padding: 0 !important;
        margin: 0 !important;
        max-width: none !important;
        width: 100% !important;
        min-height: 100vh !important;
      }
      body {
        padding: 0 !important;
        margin: 0 !important;
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(style);

    const hideAllSiteElements = () => {
      // Esconder elementos com classe site-header-footer
      const siteElements = document.querySelectorAll('.site-header-footer');
      siteElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.height = '0';
        htmlEl.style.overflow = 'hidden';
        htmlEl.style.opacity = '0';
      });
      
      // Esconder Header, Footer e WhatsAppButton diretamente também
      const header = document.querySelector('header:not(#ai-generated-site-root header)');
      const footer = document.querySelector('footer:not(#ai-generated-site-root footer)');
      const whatsappBtn = document.querySelector('[aria-label="Contato via WhatsApp"]');
      
      [header, footer, whatsappBtn].forEach(el => {
        if (el) {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = 'none';
          htmlEl.style.visibility = 'hidden';
          htmlEl.style.opacity = '0';
        }
      });
      
      // Remover TODOS os estilos do main que podem interferir
      const main = document.querySelector('main');
      if (main) {
        (main as HTMLElement).style.cssText = `
          padding: 0 !important;
          margin: 0 !important;
          max-width: none !important;
          width: 100% !important;
          min-height: 100vh !important;
        `;
      }
      
      // Garantir que body não tenha padding/margin
      document.body.style.padding = '0';
      document.body.style.margin = '0';
      document.body.style.overflowX = 'hidden';
    };

    // Executar imediatamente e depois em intervalos para garantir
    hideAllSiteElements();
    const interval = setInterval(hideAllSiteElements, 50);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setReady(true);
    }, 200);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      // Remover style ao desmontar
      const styleEl = document.getElementById('hide-old-layout-pt');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  // Só renderizar quando estiver pronto para evitar flash do layout antigo
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderizando 100% o HTML estático baixado
  // Este componente substitui completamente o layout padrão
  // O ambiente de conversa com IA está conectado via links/forms
  return <StaticAIGeneratedHome />;
}

export default function HomePT() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    }>
      <HomePTContent />
    </Suspense>
  );
}



