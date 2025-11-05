/**
 * 🎨 Página de Preview do Plasmic
 * 
 * Renderiza componentes Plasmic personalizados com conteúdo gerado pela IA
 */

'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Eye, Shield, AlertCircle } from 'lucide-react';

// ⚠️ NOTA: Esta é uma implementação simplificada
// Para usar o SDK oficial do Plasmic, instale: npm install @plasmicapp/loader-nextjs
// e use: import { PlasmicComponent, initPlasmicLoader } from '@plasmicapp/loader-nextjs'

function PlasmicPreviewContent({ 
  params 
}: { 
  params: Promise<{ component: string }> 
}) {
  const searchParams = useSearchParams();
  const [component, setComponent] = useState<string>('');
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    async function loadPreview() {
      try {
        // Resolver params assíncrono
        const resolvedParams = await params;
        const componentName = resolvedParams.component;
        setComponent(componentName);

        // Buscar dados da query string
        const dataParam = searchParams.get('data');
        
        if (dataParam) {
          try {
            const parsedContent = JSON.parse(decodeURIComponent(dataParam));
            setContent(parsedContent);
            
            // Converter conteúdo Plasmic para HTML renderizável
            const html = convertPlasmicToHtml(parsedContent, componentName);
            setHtmlContent(html);
          } catch (parseError) {
            console.error('Erro ao parsear dados:', parseError);
            setError('Dados de preview inválidos');
          }
        } else {
          setError('Dados de preview não fornecidos');
        }

      } catch (err) {
        console.error('Erro ao carregar preview:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, [params, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando preview do Plasmic...</p>
          <p className="text-slate-400 text-sm mt-2">Componente: {component}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
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

  if (!content || !htmlContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Conteúdo não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-700 opacity-0 animate-fadeIn">
      {/* Header de Proteção */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between text-sm sticky top-0 z-50"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Preview Plasmic - Componente: {component}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-4 h-4" />
          <span>Modo Preview</span>
        </div>
      </motion.div>

      {/* Container do Preview */}
      <div className="relative">
        {/* Watermark de Proteção */}
        <div className="fixed inset-0 pointer-events-none z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-16 right-4 bg-red-600/90 text-white px-3 py-1 rounded text-xs font-bold"
          >
            PREVIEW • WZ SOLUTION
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-4 left-4 bg-blue-600/90 text-white px-3 py-1 rounded text-xs font-bold"
          >
            PROTEGIDO • PLASMIC
          </motion.div>
        </div>

        {/* Conteúdo Renderizado com Fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="plasmic-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Estilos de Animação */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-in forwards;
        }
        
        /* Microtransições para elementos internos */
        .plasmic-content img {
          transition: transform 0.3s ease, opacity 0.5s ease;
        }
        
        .plasmic-content img:hover {
          transform: scale(1.02);
        }
        
        .plasmic-content section {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }
        
        .plasmic-content section:nth-child(1) {
          animation-delay: 0.1s;
        }
        
        .plasmic-content section:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .plasmic-content section:nth-child(3) {
          animation-delay: 0.3s;
        }
        
        .plasmic-content section:nth-child(4) {
          animation-delay: 0.4s;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default function PlasmicPreviewPage({ 
  params 
}: { 
  params: Promise<{ component: string }> 
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando preview do Plasmic...</p>
        </div>
      </div>
    }>
      <PlasmicPreviewContent params={params} />
    </Suspense>
  );
}

/**
 * 🔄 Converter conteúdo Plasmic para HTML renderizável
 * 
 * Esta função converte o JSON do Plasmic em HTML funcional
 * Em produção, use o SDK oficial do Plasmic para renderização
 */
function convertPlasmicToHtml(
  content: Record<string, unknown>,
  componentName: string
): string {
  const props = (content.props as Record<string, unknown>) || {};
  
  // Extrair seções do conteúdo
  const header = (props.header as Record<string, unknown>) || {};
  const hero = (props.hero as Record<string, unknown>) || {};
  const about = (props.about as Record<string, unknown>) || {};
  const services = (props.services as Record<string, unknown>) || {};
  const footer = (props.footer as Record<string, unknown>) || {};
  const cssVariables = (props.cssVariables as Record<string, unknown>) || {};

  // Construir HTML
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Plasmic - ${componentName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${cssVariables['--primary-color'] || '#06b6d4'};
      --accent-color: ${cssVariables['--accent-color'] || '#f59e0b'};
    }
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4 {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="bg-white shadow-md sticky top-0 z-40 py-4 px-6">
    <div class="container mx-auto flex items-center justify-between">
      ${(header.logoUrl as string) ? `
        <img 
          src="${header.logoUrl}" 
          alt="Logo" 
          class="h-10 md:h-12 w-auto flex-shrink-0"
        />
      ` : '<div class="h-10 w-32 bg-gray-200 rounded"></div>'}
      <nav class="hidden md:flex items-center gap-6">
        <a href="#home" class="text-gray-700 hover:text-[var(--primary-color)] transition">Home</a>
        <a href="#sobre" class="text-gray-700 hover:text-[var(--primary-color)] transition">Sobre</a>
        <a href="#servicos" class="text-gray-700 hover:text-[var(--primary-color)] transition">Serviços</a>
        <a href="#contato" class="text-gray-700 hover:text-[var(--primary-color)] transition">Contato</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="home" class="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center">
    ${(hero.backgroundImage as string) ? `
      <div 
        class="absolute inset-0 w-full h-full bg-cover bg-center"
        style="background-image: url('${hero.backgroundImage}');"
      >
        <div class="absolute inset-0 bg-black/40"></div>
      </div>
    ` : `
      <div class="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)]"></div>
    `}
    <div class="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-6xl font-bold mb-4">${(hero.title as string) || 'Bem-vindo'}</h1>
      <p class="text-lg md:text-xl mb-8 opacity-90">${(hero.subtitle as string) || 'Seu site profissional'}</p>
      <button class="bg-white text-[var(--primary-color)] px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
        Começar Agora
      </button>
    </div>
  </section>

  <!-- About Section -->
  ${about.image || about.text ? `
    <section id="sobre" class="py-16 px-6 md:px-12 bg-white">
      <div class="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        ${(about.image as string) ? `
          <div class="w-full h-auto">
            <img 
              src="${about.image}" 
              alt="Sobre Nós" 
              class="w-full h-auto rounded-xl shadow-lg object-cover"
            />
          </div>
        ` : ''}
        <div>
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Sobre Nós</h2>
          <p class="text-gray-600 text-lg leading-relaxed">${(about.text as string) || 'Somos uma empresa comprometida em oferecer soluções de qualidade para nossos clientes.'}</p>
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Services Section -->
  ${(services.items as Array<Record<string, unknown>>)?.length > 0 ? `
    <section id="servicos" class="py-16 px-6 md:px-12 bg-gray-50">
      <div class="container mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800">Nossos Serviços</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${(services.items as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              ${(item.image as string) ? `
                <img 
                  src="${item.image}" 
                  alt="${(item.title as string) || 'Serviço'}" 
                  class="w-full h-[300px] object-cover rounded-lg shadow-md"
                />
              ` : ''}
              <div class="p-6">
                <h3 class="text-xl font-bold mb-2 text-gray-800">${(item.title as string) || 'Serviço'}</h3>
                <p class="text-gray-600">${(item.description as string) || 'Descrição do serviço'}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : ''}

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12 px-6">
    <div class="container mx-auto">
      <div class="grid md:grid-cols-3 gap-8">
        <div>
          ${(footer.logoUrl as string) ? `
            <img 
              src="${footer.logoUrl}" 
              alt="Logo" 
              class="h-8 w-auto opacity-80 mb-4"
            />
          ` : ''}
          <p class="text-gray-400">© ${new Date().getFullYear()} WZ Solution. Todos os direitos reservados.</p>
        </div>
        <div>
          <h4 class="font-bold mb-4">Links</h4>
          <ul class="space-y-2 text-gray-400">
            <li><a href="#home" class="hover:text-white transition">Home</a></li>
            <li><a href="#sobre" class="hover:text-white transition">Sobre</a></li>
            <li><a href="#servicos" class="hover:text-white transition">Serviços</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold mb-4">Contato</h4>
          <p class="text-gray-400">Email: contato@wzsolution.com</p>
          <p class="text-gray-400">Telefone: (11) 99999-9999</p>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>
  `;

  return html;
}

