'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoginModal from './LoginModal';

/**
 * Componente que renderiza o HTML estático baixado
 * Mantém o ambiente de conversa com IA conectado
 */
export default function StaticAIGeneratedHome() {
  const router = useRouter();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'signup'>('login');
  const [pendingPromptData, setPendingPromptData] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // ✅ Criar funções globais IMEDIATAMENTE, antes de qualquer coisa
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // ✅ Função global para mostrar animação de loading (pode ser chamada de qualquer lugar)
    (window as any).showLoadingAnimation = () => {
      console.log('🎬 [GLOBAL] Mostrando animação de loading...');
      setIsAnimating(true);
      
      // Também criar elemento diretamente no DOM para garantir que apareça mesmo se React não renderizar
      const existingOverlay = document.getElementById('loading-overlay-global');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      const overlay = document.createElement('div');
      overlay.id = 'loading-overlay-global';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease-in;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 28rem;
        margin: 1rem;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.3s ease-out;
      `;
      
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 4rem;
        height: 4rem;
        border: 4px solid #3b82f6;
        border-top-color: transparent;
        border-radius: 50%;
        margin: 0 auto 1rem;
        animation: spin 1s linear infinite;
      `;
      
      const title = document.createElement('h3');
      title.textContent = 'Preparando seu projeto...';
      title.style.cssText = `
        font-size: 1.25rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.5rem;
      `;
      
      const description = document.createElement('p');
      description.textContent = 'Estamos redirecionando você para o assistente de IA';
      description.style.cssText = `
        color: #475569;
        margin-bottom: 1rem;
      `;
      
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        height: 0.25rem;
        background: linear-gradient(to right, #3b82f6, #9333ea);
        border-radius: 9999px;
        animation: progress 0.8s ease-in-out infinite alternate;
      `;
      
      // Adicionar keyframes CSS se não existirem
      if (!document.getElementById('loading-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-styles';
        style.textContent = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `;
        document.head.appendChild(style);
      }
      
      content.appendChild(spinner);
      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(progressBar);
      overlay.appendChild(content);
      document.body.appendChild(overlay);
      
      // Animar entrada
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        content.style.transform = 'scale(1)';
      });
    };
    
    // ✅ Função global para esconder animação
    (window as any).hideLoadingAnimation = () => {
      console.log('🧹 [GLOBAL] Escondendo animação de loading...');
      setIsAnimating(false);
      
      const overlay = document.getElementById('loading-overlay-global');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
        }, 200);
      }
    };
    
    console.log('✅ [GLOBAL] Funções globais de animação criadas');
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).showLoadingAnimation;
        delete (window as any).hideLoadingAnimation;
      }
    };
  }, []); // ✅ Executar apenas uma vez na montagem

  useEffect(() => {
    // Carregar HTML estático do arquivo baixado
    async function loadStaticHTML() {
      try {
        console.log('📥 [LOAD] Iniciando carregamento do HTML...');
        // Buscar o HTML estático
        const response = await fetch('/api/get-static-site-html');
        console.log('📥 [LOAD] Resposta recebida, status:', response.status);
        if (!response.ok) {
          throw new Error(`Erro ao carregar HTML estático: ${response.status}`);
        }
        const htmlContent = await response.text();
        console.log('📥 [LOAD] HTML recebido, tamanho:', htmlContent.length);
        
        // Processar HTML para conectar IA e corrigir problemas de layout/cores
        let processedHTML = htmlContent;
        
        // CORREÇÕES DE LAYOUT E CORES
        
        // 1. Adicionar padding-top no body para compensar header fixo
        processedHTML = processedHTML.replace(
          /<body class="font-sans antialiased">/g,
          '<body class="font-sans antialiased" style="padding-top: 0;">'
        );
        
        // 2. Corrigir cores dos selects na seção IA (options precisam de cor escura)
        processedHTML = processedHTML.replace(
          /<select class="w-full px-6 py-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white transition-all duration-300"/g,
          '<select class="w-full px-6 py-4 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white transition-all duration-300" style="color: white !important;"'
        );
        
        // 3. Adicionar estilos CSS completos para corrigir visibilidade e layout
        processedHTML = processedHTML.replace(
          /<\/style>/g,
          `    /* Correções de visibilidade e layout */
    option { 
      background-color: #1e1b4b !important; 
      color: white !important; 
    }
    select option { 
      background-color: #1e1b4b !important; 
      color: white !important; 
    }
    input::placeholder, textarea::placeholder { 
      color: rgba(196, 181, 253, 0.8) !important; 
    }
    /* Garantir visibilidade do texto na seção IA */
    #ia-site h2,
    #ia-site p,
    #ia-site label,
    #ia-site span {
      color: white !important;
    }
    #ia-site .text-purple-200 {
      color: rgba(196, 181, 253, 1) !important;
    }
    /* Garantir visibilidade nos formulários */
    #ia-site input,
    #ia-site textarea,
    #ia-site select {
      color: white !important;
    }
    #ia-site input::placeholder,
    #ia-site textarea::placeholder {
      color: rgba(196, 181, 253, 0.7) !important;
    }
    /* Evitar sobreposição com header fixo */
    header {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 1000 !important;
    }
    main {
      position: relative !important;
      z-index: 1 !important;
    }
    section {
      position: relative !important;
      z-index: 1 !important;
    }
    /* Espaçamento adequado para primeira seção */
    #home {
      padding-top: 8rem !important;
      margin-top: 0 !important;
    }
    /* Corrigir legibilidade de botões com gradiente */
    a[class*="bg-gradient-to-r"][class*="from-purple-600"],
    button[class*="bg-gradient-to-r"][class*="from-purple-600"],
    .bg-gradient-to-r.from-purple-600 {
      background: linear-gradient(to right, #9333ea, #4f46e5) !important;
      color: white !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
      font-weight: 600 !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    a[class*="bg-gradient-to-r"][class*="from-purple-600"]:hover,
    button[class*="bg-gradient-to-r"][class*="from-purple-600"]:hover,
    .bg-gradient-to-r.from-purple-600:hover {
      background: linear-gradient(to right, #7e22ce, #4338ca) !important;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6) !important;
    }
    /* Garantir que texto branco em botões seja sempre legível */
    a.text-white[class*="bg-gradient"],
    button.text-white[class*="bg-gradient"] {
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
      font-weight: 600 !important;
    }
    /* Corrigir ícones dos cards de serviço - garantir visibilidade */
    .service-card .bg-gradient-to-br {
      background: linear-gradient(to bottom right, var(--grad-start, #9333ea), var(--grad-end, #4f46e5)) !important;
    }
    .service-card .bg-gradient-to-br.from-purple-500.to-indigo-600 {
      background: linear-gradient(to bottom right, #9333ea, #4f46e5) !important;
    }
    .service-card .bg-gradient-to-br.from-blue-500.to-cyan-600 {
      background: linear-gradient(to bottom right, #3b82f6, #06b6d4) !important;
    }
    .service-card .bg-gradient-to-br.from-pink-500.to-rose-600 {
      background: linear-gradient(to bottom right, #ec4899, #e11d48) !important;
    }
    .service-card .bg-gradient-to-br.from-green-500.to-emerald-600 {
      background: linear-gradient(to bottom right, #10b981, #059669) !important;
    }
    /* Garantir que ícones SVG brancos sejam sempre visíveis */
    .service-card svg.text-white {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)) !important;
      color: white !important;
      stroke: white !important;
    }
    /* Corrigir textos dos cards de serviço - garantir visibilidade */
    .service-card h3 {
      color: #111827 !important;
      font-weight: 700 !important;
    }
    .service-card p {
      color: #4b5563 !important;
    }
    .service-card ul li {
      color: #6b7280 !important;
    }
    /* Garantir que não haja degradês brancos nos cards */
    .service-card {
      background: white !important;
      border: 1px solid #e5e7eb !important;
    }
    /* Corrigir qualquer problema de legibilidade nos títulos */
    #servicos h2 {
      color: #111827 !important;
    }
    #servicos p {
      color: #4b5563 !important;
    }
    /* Garantir visibilidade do botão da seção IA */
    #ia-site button[onclick*="ia-criador-site-v3"] {
      background: linear-gradient(to right, #9333ea, #4f46e5) !important;
      color: white !important;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
    }
    #ia-site button[onclick*="ia-criador-site-v3"]:hover {
      background: linear-gradient(to right, #7e22ce, #4338ca) !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.6) !important;
    }
    #ia-site button[onclick*="ia-criador-site-v3"] span,
    #ia-site button[onclick*="ia-criador-site-v3"] svg {
      color: white !important;
      stroke: white !important;
    }
  </style>`
        );
        
        // 4. Garantir visibilidade na seção de orçamento
        processedHTML = processedHTML.replace(
          /<section id="orcamento" class="py-20 px-6 bg-white">/g,
          '<section id="orcamento" class="py-20 px-6 bg-white" style="position: relative; z-index: 1;">'
        );
        
        // 5. Garantir que labels e textos do formulário de orçamento sejam visíveis
        processedHTML = processedHTML.replace(
          /class="block text-sm font-semibold text-gray-700 mb-2"/g,
          'class="block text-sm font-semibold text-gray-700 mb-2" style="color: #374151 !important;"'
        );
        
        // CONEXÃO COM IA
        
        // 10. Modificar link "IA Site" no header para fazer scroll suave até a seção #ia-site na própria página
        processedHTML = processedHTML.replace(
          /href=["']#ia-site["']/gi,
          'href="#ia-site" onclick="event.preventDefault(); const section = document.getElementById(\'ia-site\'); if(section) { const headerHeight = 80; const elementPosition = section.getBoundingClientRect().top + window.pageYOffset; const offsetPosition = elementPosition - headerHeight; window.scrollTo({ top: offsetPosition, behavior: \'smooth\' }); } return false;"'
        );
        
        // ✅ 10.5. Adicionar botão de login no header do HTML estático
        // Estratégia: Inserir dentro do container de botões existente (header-buttons-container)
        const loginButtonHTML = `
            <button id="header-login-button" onclick="window.openLoginModal && window.openLoginModal('login'); return false;" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(to right, #9333ea, #4f46e5); color: white !important; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: all 0.3s; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: none; cursor: pointer;">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: white !important;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              <span style="color: white !important;">Entrar</span>
            </button>
        `;
        
        // Tentativa 1: Procurar pelo container de botões específico (header-buttons-container)
        if (!processedHTML.includes('header-login-button')) {
          processedHTML = processedHTML.replace(
            /(<div[^>]*id=["']header-buttons-container["'][^>]*>[\s\S]*?)(<\/div>)/gi,
            (match, divContent, closingTag) => {
              if (divContent.includes('header-login-button') || divContent.includes('Entrar')) {
                return match;
              }
              return divContent + loginButtonHTML + closingTag;
            }
          );
        }
        
        // Tentativa 2: Procurar por nav dentro do header
        if (!processedHTML.includes('header-login-button')) {
          processedHTML = processedHTML.replace(
            /(<header[^>]*>[\s\S]*?<nav[^>]*>[\s\S]*?)(<\/nav>[\s\S]*?<\/header>)/gi,
            (match, navContent, rest) => {
              if (navContent.includes('header-login-button') || navContent.includes('Entrar')) {
                return match;
              }
              return navContent + loginButtonHTML + '</nav>' + rest;
            }
          );
        }
        
        // Tentativa 3: Se não encontrou nav, procurar por div com classe container/wrapper no header
        if (!processedHTML.includes('header-login-button')) {
          processedHTML = processedHTML.replace(
            /(<header[^>]*>[\s\S]*?<div[^>]*(?:class|className)=["'][^"']*(?:container|wrapper|flex|justify-between)[^"']*["'][^>]*>[\s\S]*?)(<\/div>[\s\S]*?<\/header>)/gi,
            (match, divContent, rest) => {
              if (divContent.includes('header-login-button') || divContent.includes('Entrar')) {
                return match;
              }
              // Inserir antes do último </div> do header
              const lastDiv = divContent.lastIndexOf('</div>');
              if (lastDiv > 0) {
                return divContent.slice(0, lastDiv) + loginButtonHTML + divContent.slice(lastDiv) + rest;
              }
              return divContent + loginButtonHTML + '</div>' + rest;
            }
          );
        }
        
        // Tentativa 4: Se ainda não encontrou, inserir diretamente antes do </header>
        if (!processedHTML.includes('header-login-button')) {
          processedHTML = processedHTML.replace(
            /(<header[^>]*>[\s\S]*?)(<\/header>)/gi,
            (match, headerContent, closingTag) => {
              if (headerContent.includes('header-login-button') || headerContent.includes('Entrar')) {
                return match;
              }
              return headerContent + loginButtonHTML + closingTag;
            }
          );
        }
        
        // 11. Reformular completamente a seção IA - substituir por versão melhorada
        const novaSecaoIA = `
    <!-- IA Site Generator - Versão Reformulada -->
    <section id="ia-site" class="py-20 px-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden" style="color: white !important;">
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      <div class="container mx-auto max-w-5xl relative z-10">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white border-opacity-30">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style="color: white;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span class="text-sm font-semibold" style="color: white !important;">🤖 TECNOLOGIA IA</span>
          </div>
          <h2 class="text-4xl md:text-6xl font-bold mb-4" style="color: white !important; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            Crie Seu Site com Inteligência Artificial
          </h2>
          <p class="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed" style="color: rgba(196, 181, 253, 1) !important;">
            Descreva sua ideia e nossa IA gera um site profissional completo em minutos. Tecnologia de ponta ao seu alcance.
          </p>
        </div>

        <div class="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white border-opacity-20 shadow-2xl">
          <div id="ia-site-form" class="space-y-6">
                  <!-- Campo de Descrição do Projeto -->
                  <div>
                    <label class="block text-sm font-semibold mb-3 text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">
                      <span class="flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: rgba(196, 181, 253, 1);">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Descreva seu projeto
                      </span>
                    </label>
                    <textarea 
                      id="initial-prompt"
                      name="initialPrompt"
                      rows="6" 
                      class="w-full px-6 py-4 bg-white bg-opacity-20 border-2 border-white border-opacity-30 rounded-xl text-white placeholder-purple-300 transition-all duration-300 resize-none focus:bg-opacity-25 focus:border-opacity-50"
                      placeholder="Ex: Preciso de um site para minha clínica odontológica com agendamento online, galeria de tratamentos e blog. Cores azul e branco, design moderno e clean..."
                      aria-label="Campo de descrição do projeto"
                      style="color: white !important;"
                    ></textarea>
                    <p class="text-xs text-purple-300 mt-2" style="color: rgba(196, 181, 253, 0.8) !important;">
                      💡 Seja específico: mencione cores, funcionalidades e o tipo de negócio
                    </p>
                  </div>

                  <!-- Botão de Ação Principal -->
                  <button 
                    type="button"
                    id="submit-button"
                    class="w-full py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 group"
                    style="background: linear-gradient(to right, #9333ea, #4f46e5) !important; color: white !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5) !important; border: none !important;"
                  >
                    <svg class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: white !important; stroke: white !important;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <span id="submit-button-text" style="color: white !important; font-weight: 700 !important;">Gerar Site com IA</span>
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: white !important; stroke: white !important;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

            <!-- Estatísticas -->
            <div class="mt-8 pt-8 border-t border-white border-opacity-20">
              <div class="grid grid-cols-3 gap-6 text-center">
                <div class="transform hover:scale-105 transition-transform duration-300">
                  <p class="text-3xl md:text-4xl font-bold mb-1" style="color: white !important;">2min</p>
                  <p class="text-sm text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">Tempo Médio</p>
                </div>
                <div class="transform hover:scale-105 transition-transform duration-300">
                  <p class="text-3xl md:text-4xl font-bold mb-1" style="color: white !important;">100%</p>
                  <p class="text-sm text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">Personalizável</p>
                </div>
                <div class="transform hover:scale-105 transition-transform duration-300">
                  <p class="text-3xl md:text-4xl font-bold mb-1" style="color: white !important;">24h</p>
                  <p class="text-sm text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">Suporte Dedicado</p>
                </div>
              </div>
            </div>

            <!-- Destaque de Recursos -->
            <div class="mt-6 flex flex-wrap justify-center gap-4">
              <div class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-2 border border-white border-opacity-20">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style="color: rgba(196, 181, 253, 1);">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">Design Responsivo</span>
              </div>
              <div class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-2 border border-white border-opacity-20">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style="color: rgba(196, 181, 253, 1);">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">SEO Otimizado</span>
              </div>
              <div class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-2 border border-white border-opacity-20">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style="color: rgba(196, 181, 253, 1);">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">Código Limpo</span>
              </div>
              <div class="flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-2 border border-white border-opacity-20">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style="color: rgba(196, 181, 253, 1);">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs text-purple-200" style="color: rgba(196, 181, 253, 1) !important;">Pronto para Produção</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
        `;
        
        // Substituir toda a seção IA antiga pela nova
        // Capturar desde o comentário até o fechamento da seção
        const regexSecaoIA = /<!-- IA Site Generator -->[\s\S]*?<section id="ia-site"[^>]*>[\s\S]*?<\/section>/;
        if (regexSecaoIA.test(processedHTML)) {
          processedHTML = processedHTML.replace(
            regexSecaoIA,
            novaSecaoIA.trim()
          );
        } else {
          // Fallback: tentar capturar apenas a seção
          processedHTML = processedHTML.replace(
            /<section id="ia-site"[^>]*>[\s\S]*?<\/section>/,
            novaSecaoIA.trim().replace(/.*?<section/, '<section').replace(/<!-- IA Site Generator - Versão Reformulada -->/, '<!-- IA Site Generator -->')
          );
        }
        
        // 13. Corrigir botões com gradiente para melhor legibilidade
        // Substituir gradientes que podem ficar muito claros
        processedHTML = processedHTML.replace(
          /class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white([^"]*)"/g,
          (match, p1) => {
            return `class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white${p1}" style="background: linear-gradient(to right, #9333ea, #4f46e5) !important; color: white !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.3) !important; font-weight: 600 !important; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; letter-spacing: 0.01em;"`;
          }
        );
        
        // Corrigir especificamente o botão "Contato" no header
        processedHTML = processedHTML.replace(
          /<a href="#contato" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white([^"]*)">Contato<\/a>/g,
          (match, p1) => {
            return `<a href="#contato" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white${p1}" style="background: linear-gradient(to right, #9333ea, #4f46e5) !important; color: white !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.3) !important; font-weight: 600 !important;">Contato</a>`;
          }
        );
        
        // Corrigir botão "Solicitar Orçamento"
        processedHTML = processedHTML.replace(
          /<a href="#orcamento" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white([^"]*)">Solicitar Orçamento<\/a>/g,
          (match, p1) => {
            return `<a href="#orcamento" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white${p1}" style="background: linear-gradient(to right, #9333ea, #4f46e5) !important; color: white !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.3) !important; font-weight: 600 !important;">Solicitar Orçamento</a>`;
          }
        );
        
        // Corrigir botão de submit do formulário
        processedHTML = processedHTML.replace(
          /<button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white([^"]*)">Enviar Solicitação de Orçamento<\/button>/g,
          (match, p1) => {
            return `<button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white${p1}" style="background: linear-gradient(to right, #9333ea, #4f46e5) !important; color: white !important; text-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.3) !important; font-weight: 600 !important;">Enviar Solicitação de Orçamento</button>`;
          }
        );
        
        // 14. Corrigir gradientes dos ícones dos cards de serviço
        // Ícone Sites Profissionais (roxo)
        processedHTML = processedHTML.replace(
          /<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">/g,
          '<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6" style="background: linear-gradient(to bottom right, #9333ea, #4f46e5) !important;">'
        );
        
        // Ícone Aplicativos Mobile (azul)
        processedHTML = processedHTML.replace(
          /<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">/g,
          '<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6" style="background: linear-gradient(to bottom right, #3b82f6, #06b6d4) !important;">'
        );
        
        // Ícone Softwares Personalizados (rosa)
        processedHTML = processedHTML.replace(
          /<div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6">/g,
          '<div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6" style="background: linear-gradient(to bottom right, #ec4899, #e11d48) !important;">'
        );
        
        // Ícone Sistemas Empresariais (verde)
        processedHTML = processedHTML.replace(
          /<div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">/g,
          '<div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6" style="background: linear-gradient(to bottom right, #10b981, #059669) !important;">'
        );
        
        // 15. Garantir que ícones SVG sejam sempre visíveis
        processedHTML = processedHTML.replace(
          /<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">/g,
          '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: white !important; stroke: white !important; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));"'
        );
        
        // 16. Corrigir especificamente o ícone de Sites Profissionais (pode ter problema com stroke-width)
        processedHTML = processedHTML.replace(
          /<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"\/>/g,
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="white" fill="none" style="stroke: white !important; stroke-width: 2.5 !important;" />'
        );
        
        // 12. Adicionar script para capturar formulário e criar conversa
        // ATUALIZADO: Usar IDs corretos (initial-prompt) e função handleIAPromptSubmit
        const scriptToInject = `
          <script>
            (function() {
              // Função para lidar com o envio do formulário da seção IA
              // Esta função será chamada pelo onclick do botão ou onsubmit do form
              // ✅ Função para verificar autenticação
              async function checkAuth() {
                try {
                  // Tentar fazer uma requisição simples para verificar
                  const response = await fetch('/api/auth/check', { method: 'GET' }).catch(() => null);
                  if (response && response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                      return data.user;
                    }
                  }
                  
                  return null;
                } catch (error) {
                  console.error('❌ [AUTH] Erro:', error);
                  return null;
                }
              }
              
              window.handleIAPromptSubmit = async function(event) {
                if (event) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                }
                
                console.log('🛑 [INJECTED] Submit interceptado!');
                
                // ✅ VERIFICAR AUTENTICAÇÃO PRIMEIRO
                console.log('🔐 [INJECTED] Verificando autenticação...');
                const user = await checkAuth();
                
                if (!user) {
                  console.log('🔐 [INJECTED] Usuário não logado, abrindo modal de login...');
                  const textarea = document.getElementById('initial-prompt');
                  const projectDescription = textarea ? textarea.value.trim() : '';
                  
                  if (projectDescription) {
                    sessionStorage.setItem('pending_site_creation', JSON.stringify({
                      selectedType: 'site',
                      idea: projectDescription,
                      companyName: projectDescription.split('para')[1]?.trim() || 'Meu Negócio',
                      businessSector: 'A definir'
                    }));
                  }
                  
                  // Abrir modal de login via função global
                  if ((window as any).openLoginModal) {
                    (window as any).openLoginModal('login');
                  } else {
                    // Fallback: aguardar um pouco e tentar novamente
                    setTimeout(() => {
                      if ((window as any).openLoginModal) {
                        (window as any).openLoginModal('login');
                      }
                    }, 100);
                  }
                  return false;
                }
                
                console.log('✅ [INJECTED] Usuário autenticado');
                
                // Capturar o texto do textarea - usar ID correto
                const textarea = document.getElementById('initial-prompt');
                const projectDescription = textarea ? textarea.value.trim() : '';
                
                if (!projectDescription) {
                  alert('Por favor, descreva seu projeto antes de continuar.');
                  if (textarea) textarea.focus();
                  return false;
                }
                
                // Desabilitar botão durante processamento
                const submitButton = document.getElementById('submit-button');
                const submitButtonText = document.getElementById('submit-button-text');
                
                if (submitButton) {
                  submitButton.disabled = true;
                  if (submitButtonText) {
                    submitButtonText.textContent = 'Criando conversa...';
                  }
                }
                
                try {
                  console.log('📤 [INJECTED] Enviando prompt:', projectDescription);
                  
                  // Criar conversa via API
                  const response = await fetch('/api/start-conversation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      initialPrompt: projectDescription,
                      projectType: 'site',
                      clientName: 'Cliente',
                      clientEmail: '',
                      userId: user.id // ✅ Enviar userId
                    })
                  });
                  
                  const data = await response.json();
                  console.log('📥 [INJECTED] Resposta da API:', data);
                  
          if (data.success && data.conversationId) {
            // Redirecionar para a página de chat com os dados
            const prompt = encodeURIComponent(projectDescription);
            const companyName = encodeURIComponent('Meu Negócio');
            const businessSector = encodeURIComponent('Negócios');
            const chatUrl = '/chat/' + data.conversationId + '?prompt=' + prompt + '&companyName=' + companyName + '&businessSector=' + businessSector;
                    
                    console.log('✅ [INJECTED] Redirecionando para:', chatUrl);
                    
                    // ✅ Mostrar animação ANTES de redirecionar
                    // Aguardar função global estar disponível (pode não estar pronta ainda)
                    const showAnimation = () => {
                      if ((window as any).showLoadingAnimation) {
                        (window as any).showLoadingAnimation();
                      } else {
                        // Tentar novamente após um pequeno delay se não estiver disponível
                        setTimeout(showAnimation, 50);
                      }
                    };
                    showAnimation();
                    
                    // ✅ Aguardar tempo suficiente para a animação aparecer
                    setTimeout(() => {
                      window.location.href = chatUrl;
                    }, 1200);
                  } else {
                    throw new Error(data.error || 'Erro ao criar conversa');
                  }
                } catch (error) {
                  console.error('❌ [INJECTED] Erro ao criar conversa:', error);
                  // ✅ Esconder animação em caso de erro
                  if ((window as any).hideLoadingAnimation) {
                    (window as any).hideLoadingAnimation();
                  }
                  alert('Erro ao iniciar conversa: ' + (error.message || 'Erro desconhecido'));
                  if (submitButton) {
                    submitButton.disabled = false;
                    if (submitButtonText) {
                      submitButtonText.textContent = 'Gerar Site com IA';
                    }
                  }
                }
                
                return false;
              };
              
              // ✅ Função para atualizar botão de login
              async function updateLoginButton() {
                try {
                  const loginButton = document.getElementById('header-login-button');
                  if (!loginButton) return;
                  
                  const response = await fetch('/api/auth/check', { method: 'GET' }).catch(() => null);
                  
                  if (response && response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                      // Usuário logado - substituir o elemento <a> por novos elementos
                      const container = loginButton.parentElement;
                      if (container) {
                        loginButton.remove();
                        container.innerHTML += \`
                          <a href="/cliente" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(147, 51, 234, 0.2); color: rgba(196, 181, 253, 1); border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: all 0.3s; white-space: nowrap; border: 1px solid rgba(147, 51, 234, 0.3);">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span>Painel do Cliente</span>
                          </a>
                          <button id="header-logout-button-injected" style="padding: 0.5rem 1rem; background: transparent; color: rgba(196, 181, 253, 0.8); border: none; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: all 0.3s;">
                            Sair
                          </button>
                        \`;
                        
                        // Configurar evento de logout após injeção
                        setTimeout(() => {
                          const logoutBtn = document.getElementById('header-logout-button-injected');
                          if (logoutBtn) {
                            logoutBtn.onclick = async function(e) {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                // Limpar storage primeiro
                                if (typeof window !== 'undefined') {
                                  try {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                  } catch(storageErr) {
                                    console.warn('Erro ao limpar storage:', storageErr);
                                  }
                                }
                                // Tentar logout no Supabase
                                const { signOut } = await import('@/lib/auth');
                                await signOut();
                              } catch(err) {
                                console.error('Erro ao fazer logout:', err);
                              }
                              // Sempre redirecionar
                              window.location.href = '/';
                            };
                          }
                        }, 100);
                      }
                    }
                  }
                } catch (error) {
                  console.error('Erro ao atualizar botão de login:', error);
                }
              }
              
              function connectIAChat() {
                // Interceptar links "IA Site" no header e navegação para fazer scroll suave
                const iaLinks = document.querySelectorAll('a[href="#ia-site"]');
                iaLinks.forEach(link => {
                  link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Scroll suave até a seção IA considerando altura do header
                    const iaSection = document.getElementById('ia-site');
                    if (iaSection) {
                      const headerHeight = 80;
                      const elementPosition = iaSection.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - headerHeight;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                    return false;
                  });
                });
                
                // ✅ Atualizar botão de login
                setTimeout(updateLoginButton, 500);
              }
              
              // Executar quando DOM estiver pronto
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', connectIAChat);
              } else {
                connectIAChat();
              }
              
              // Re-executar após pequeno delay para garantir que todos os elementos estejam renderizados
              setTimeout(connectIAChat, 100);
              setTimeout(connectIAChat, 500);
              
              // O React vai configurar o botão, então não precisamos fazer nada aqui
              // Apenas garantir que não há form submission
              console.log('✅ [INJECTED] Script injetado executado - React vai configurar o botão');
            })();
          </script>
        `;
        
        // Injetar script antes do fechamento do body
        processedHTML = processedHTML.replace('</body>', scriptToInject + '</body>');
        
        // ✅ REORDENAR SEÇÕES: Banner -> Campo de Prompt -> Nossos Serviços -> Resto
        // Extrair seções
        const homeSectionMatch = processedHTML.match(/<section[^>]*id=["']home["'][^>]*>[\s\S]*?<\/section>/i);
        const iaSiteSectionMatch = processedHTML.match(/<section[^>]*id=["']ia-site["'][^>]*>[\s\S]*?<\/section>/i);
        const servicosSectionMatch = processedHTML.match(/<section[^>]*id=["']servicos["'][^>]*>[\s\S]*?<\/section>/i);
        
        if (homeSectionMatch && iaSiteSectionMatch && servicosSectionMatch) {
          const homeSection = homeSectionMatch[0];
          const iaSiteSection = iaSiteSectionMatch[0];
          const servicosSection = servicosSectionMatch[0];
          
          // Remover as seções do HTML original
          let reorderedHTML = processedHTML
            .replace(/<section[^>]*id=["']home["'][^>]*>[\s\S]*?<\/section>/i, '')
            .replace(/<section[^>]*id=["']ia-site["'][^>]*>[\s\S]*?<\/section>/i, '')
            .replace(/<section[^>]*id=["']servicos["'][^>]*>[\s\S]*?<\/section>/i, '');
          
          // Encontrar onde inserir (após o header, antes do resto)
          // Procurar por </header> ou primeira seção após header
          const headerEndMatch = reorderedHTML.match(/<\/header>/i);
          if (headerEndMatch) {
            const insertPosition = headerEndMatch.index! + headerEndMatch[0].length;
            // Inserir na ordem: home -> ia-site -> servicos
            reorderedHTML = 
              reorderedHTML.slice(0, insertPosition) + 
              '\n' + homeSection + '\n' + 
              iaSiteSection + '\n' + 
              servicosSection + '\n' + 
              reorderedHTML.slice(insertPosition);
            
            console.log('✅ [REORDER] Seções reordenadas: Banner -> Campo Prompt -> Nossos Serviços');
            processedHTML = reorderedHTML;
          } else {
            console.warn('⚠️ [REORDER] Header não encontrado, mantendo ordem original');
          }
        } else {
          console.warn('⚠️ [REORDER] Algumas seções não foram encontradas:', {
            home: !!homeSectionMatch,
            iaSite: !!iaSiteSectionMatch,
            servicos: !!servicosSectionMatch
          });
        }
        
        console.log('✅ [LOAD] HTML processado, tamanho final:', processedHTML.length);
        console.log('✅ [LOAD] Definindo HTML no estado...');
        setHtml(processedHTML);
        console.log('✅ [LOAD] Definindo loading como false...');
        setLoading(false);
        console.log('✅ [LOAD] HTML carregado e processado com sucesso');
      } catch (error) {
        console.error('❌ [LOAD] Erro ao carregar HTML estático:', error);
        console.error('❌ [LOAD] Stack:', error instanceof Error ? error.stack : 'N/A');
        setHtml(''); // Garantir que html é vazio em caso de erro
        setLoading(false);
      }
    }
    
    console.log('📥 [LOAD] Chamando loadStaticHTML...');
    loadStaticHTML().catch((error) => {
      console.error('❌ [LOAD] Erro não capturado:', error);
      setLoading(false);
    });
  }, []);

  // Expor função para abrir modal globalmente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).openLoginModal = (mode: 'login' | 'signup' = 'login') => {
        setLoginModalMode(mode);
        setIsLoginModalOpen(true);
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).openLoginModal;
      }
    };
  }, []);

  // Configurar botão APÓS o HTML ser inserido
  // IMPORTANTE: Este useEffect DEVE estar antes dos returns condicionais
  useEffect(() => {
    if (!html) {
      console.log('⚠️ [REACT] HTML ainda não carregado');
      return;
    }
    
    console.log('🔍 [REACT] Iniciando configuração do botão...');
    
    let isConfigured = false; // Flag para evitar múltiplas configurações
    
    // ✅ Função para verificar autenticação (React)
    const checkAuthReact = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth');
        const user = await getCurrentUser();
        return user;
      } catch (error) {
        console.error('❌ [REACT] Erro ao verificar autenticação:', error);
        return null;
      }
    };
    
    // Função principal que será chamada ao clicar (definida fora para ser reutilizável)
    const handleButtonClick = async function(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('🖱️ [REACT] Botão clicado!');
        
        const promptEl = document.getElementById('initial-prompt') as HTMLTextAreaElement;
        const buttonEl = document.getElementById('submit-button') as HTMLButtonElement;
        const buttonTextEl = document.getElementById('submit-button-text');
        
        if (!promptEl) {
          console.error('❌ [REACT] Campo initial-prompt não encontrado');
          alert('Campo não encontrado');
          return false;
        }
        
        const prompt = promptEl.value.trim();
        if (!prompt) {
          alert('Por favor, descreva seu projeto.');
          promptEl.focus();
          return false;
        }
        
        console.log('📝 [REACT] Prompt capturado:', prompt);
        
        // Desabilitar botão
        if (buttonEl) {
          buttonEl.disabled = true;
          buttonEl.style.opacity = '0.7';
          buttonEl.style.cursor = 'not-allowed';
        }
        if (buttonTextEl) {
          buttonTextEl.textContent = 'Verificando...';
        }
        
        // ✅ VERIFICAR AUTENTICAÇÃO PRIMEIRO (antes de mostrar animação)
        console.log('🔐 [REACT] Verificando autenticação...');
        const user = await checkAuthReact();
        
        if (!user) {
          console.log('🔐 [REACT] Usuário não logado, abrindo modal de login...');
          
          // Salvar dados pendentes (mantém prompt)
          const pendingData = {
            selectedType: 'site',
            idea: prompt,
            companyName: prompt.split('para')[1]?.trim() || 'Meu Negócio',
            businessSector: 'A definir'
          };
          setPendingPromptData(pendingData);
          sessionStorage.setItem('pending_site_creation', JSON.stringify(pendingData));
          
          // ✅ NÃO mostrar animação - apenas abrir modal de login
          setLoginModalMode('login');
          setIsLoginModalOpen(true);
          
          // Reabilitar botão
          if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.style.opacity = '1';
            buttonEl.style.cursor = 'pointer';
          }
          if (buttonTextEl) {
            buttonTextEl.textContent = 'Gerar Site com IA';
          }
          return false;
        }
        
        // ✅ USUÁRIO ESTÁ LOGADO - Agora sim mostrar animação e enviar prompt
        console.log('✅ [REACT] Usuário autenticado:', user.email);
        
        // ✅ MOSTRAR ANIMAÇÃO AGORA que confirmamos que está logado
        setIsAnimating(true);
        if ((window as any).showLoadingAnimation) {
          (window as any).showLoadingAnimation();
        }
        
        // Atualizar texto do botão
        if (buttonTextEl) {
          buttonTextEl.textContent = 'Preparando...';
        }
        
        try {
          console.log('📤 [REACT] Enviando para API...');
          
          const apiBaseUrl = window.location.origin;
          
          // Preparar payload com userId
          const payload: any = {
            initialPrompt: prompt,
            projectType: 'site',
            clientName: 'Cliente'
          };
          
          if (user && user.id && typeof user.id === 'string') {
            payload.userId = user.id;
            console.log('📤 [REACT] Enviando com userId:', user.id);
          }
          
          const response = await fetch(`${apiBaseUrl}/api/start-conversation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          console.log('📥 [REACT] Resposta recebida, status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('✅ [REACT] Dados recebidos:', data);
          
          if (data.success && data.conversationId) {
            const chatUrl = `${apiBaseUrl}/chat/${data.conversationId}?prompt=${encodeURIComponent(prompt)}&companyName=${encodeURIComponent('Meu Negócio')}&businessSector=${encodeURIComponent('Negócios')}`;
            console.log('🚀 [REACT] Redirecionando para:', chatUrl);
            
            // ✅ Redirecionar IMEDIATAMENTE (animação já está visível)
            // Pequeno delay apenas para garantir que a animação foi renderizada
            setTimeout(() => {
              window.location.href = chatUrl;
            }, 300); // ✅ Delay mínimo apenas para garantir renderização
          } else {
            throw new Error(data.error || 'Erro ao criar conversa');
          }
        } catch (error: any) {
          console.error('❌ [REACT] Erro completo:', error);
          // ✅ Resetar estado de animação em caso de erro
          setIsAnimating(false);
          if ((window as any).hideLoadingAnimation) {
            (window as any).hideLoadingAnimation();
          }
          alert('Erro: ' + (error.message || 'Erro desconhecido'));
          if (buttonEl) {
            buttonEl.disabled = false;
            buttonEl.style.opacity = '1';
            buttonEl.style.cursor = 'pointer';
          }
          if (buttonTextEl) {
            buttonTextEl.textContent = 'Gerar Site com IA';
          }
        }
        
        return false;
      };
    
    // ✅ Função para lidar com logout
    const handleLogoutClick = async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        // Limpar storage primeiro
        if (typeof window !== 'undefined') {
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (storageErr) {
            console.warn('Erro ao limpar storage:', storageErr);
          }
        }
        // Tentar logout no Supabase
        const { signOut } = await import('@/lib/auth');
        await signOut();
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
      }
      // Sempre redirecionar
      window.location.href = '/';
    };

    // ✅ Função para atualizar botão de login no header
    const updateHeaderLoginButton = async () => {
      try {
        const loginButton = document.getElementById('header-login-button');
        if (!loginButton) {
          console.log('⚠️ [REACT] Botão header-login-button não encontrado');
          return;
        }
        
        const { getCurrentUser } = await import('@/lib/auth');
        const user = await getCurrentUser();
        
        if (user) {
          // Usuário logado - substituir o botão por links de área do cliente
          const container = loginButton.parentElement;
          if (container) {
            loginButton.remove();
            const areaClienteBtn = document.createElement('a');
            areaClienteBtn.href = '/cliente';
            areaClienteBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(147, 51, 234, 0.2); color: rgba(196, 181, 253, 1); border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: all 0.3s; white-space: nowrap; border: 1px solid rgba(147, 51, 234, 0.3);';
            areaClienteBtn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg><span>Painel do Cliente</span>';
            container.appendChild(areaClienteBtn);
            
            const sairBtn = document.createElement('button');
            sairBtn.id = 'header-logout-button';
            sairBtn.textContent = 'Sair';
            sairBtn.onclick = handleLogoutClick;
            sairBtn.style.cssText = 'padding: 0.5rem 1rem; background: transparent; color: rgba(196, 181, 253, 0.8); border: none; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: all 0.3s;';
            container.appendChild(sairBtn);
          }
        } else {
          // Não logado - garantir que o botão abre o modal
          // Remover botões de logout e painel se existirem
          const existingLogout = document.getElementById('header-logout-button');
          const existingLogoutInjected = document.getElementById('header-logout-button-injected');
          if (existingLogout) existingLogout.remove();
          if (existingLogoutInjected) existingLogoutInjected.remove();
          
          // Remover link do painel se existir
          const container = loginButton.parentElement;
          if (container) {
            const existingPanelLink = container.querySelector('a[href="/cliente"]');
            if (existingPanelLink) existingPanelLink.remove();
          }
          
          if (loginButton.tagName === 'A' || loginButton.getAttribute('href')) {
            const btn = document.createElement('button');
            btn.id = 'header-login-button';
            btn.onclick = () => {
              if ((window as any).openLoginModal) {
                (window as any).openLoginModal('login');
              }
            };
            btn.style.cssText = loginButton.getAttribute('style') || 'display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(to right, #9333ea, #4f46e5); color: white !important; border-radius: 0.5rem; font-weight: 600; font-size: 0.875rem; transition: all 0.3s; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: none; cursor: pointer;';
            btn.innerHTML = loginButton.innerHTML;
            loginButton.parentNode?.replaceChild(btn, loginButton);
          }
        }
      } catch (error) {
        console.error('❌ [REACT] Erro ao atualizar botão de login:', error);
      }
    };
    
    // ✅ Listener de mudanças de autenticação para atualizar header automaticamente
    const setupAuthListener = async () => {
      try {
        const { supabaseAuth } = await import('@/lib/auth');
        if (supabaseAuth && supabaseAuth.auth) {
          supabaseAuth.auth.onAuthStateChange((event, session) => {
            console.log('🔄 [REACT] Mudança de autenticação detectada:', event);
            // Atualizar botão do header quando há mudança de autenticação
            setTimeout(() => {
              updateHeaderLoginButton();
            }, 300);
          });
        }
      } catch (error) {
        console.warn('⚠️ [REACT] Erro ao configurar listener de auth:', error);
      }
    };
    
    // ✅ Listener de evento customizado para atualizar header após login
    const handleAuthStateChanged = () => {
      console.log('🔄 [REACT] Evento auth-state-changed recebido');
      setTimeout(() => {
        updateHeaderLoginButton();
      }, 300);
    };
    
    // Configurar listeners
    setupAuthListener();
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthStateChanged);
    }

    // Função para configurar o botão
    const setupButton = () => {
      // Evitar múltiplas configurações
      if (isConfigured) {
        console.log('⏭️ [REACT] Botão já configurado, pulando...');
        return true;
      }
      
      // ✅ Atualizar botão de login no header
      setTimeout(updateHeaderLoginButton, 300);
      
      const button = document.getElementById('submit-button');
      const textarea = document.getElementById('initial-prompt');
      
      if (!button) {
        console.warn('⚠️ [REACT] Botão submit-button não encontrado');
        return false;
      }
      
      if (!textarea) {
        console.warn('⚠️ [REACT] Textarea initial-prompt não encontrado');
        return false;
      }
      
      console.log('✅ [REACT] Elementos encontrados, configurando botão...');
      
      // Remover TODOS os listeners antigos clonando o botão
      const newButton = button.cloneNode(true) as HTMLButtonElement;
      button.parentNode?.replaceChild(newButton, button);
      
      const finalButton = document.getElementById('submit-button') as HTMLButtonElement;
      if (!finalButton) {
        console.error('❌ [REACT] Erro ao recriar botão');
        return false;
      }
      
      // Garantir que é type="button"
      finalButton.setAttribute('type', 'button');
      
      // Remover qualquer onclick inline
      finalButton.removeAttribute('onclick');
      
      // Adicionar handler via addEventListener (mais confiável que onclick)
      finalButton.addEventListener('click', handleButtonClick, false);
      
      // Marcar como configurado
      isConfigured = true;
      
      console.log('✅ [REACT] Handler addEventListener adicionado com sucesso');
      console.log('✅ [REACT] Botão configurado com sucesso!');
      return true;
    };
    
    // Aguardar um pouco para garantir que o DOM foi atualizado
    const trySetup = () => {
      if (setupButton()) {
        console.log('✅ [REACT] Setup completo!');
      } else {
        console.warn('⚠️ [REACT] Setup falhou, tentando novamente...');
      }
    };
    
    // Usar MutationObserver para detectar quando o HTML é inserido
    const root = document.getElementById('ai-generated-site-root');
    if (root) {
      console.log('👀 [REACT] MutationObserver configurado');
      const observer = new MutationObserver((mutations) => {
        console.log('🔄 [REACT] DOM mudou, verificando botão...');
        trySetup();
      });
      
      observer.observe(root, {
        childList: true,
        subtree: true
      });
      
      // Desconectar após 5 segundos para evitar vazamento de memória
      setTimeout(() => {
        observer.disconnect();
        console.log('🔌 [REACT] MutationObserver desconectado');
      }, 5000);
    }
    
    // Tentar configurar múltiplas vezes com delays crescentes
    setTimeout(trySetup, 0);
    setTimeout(trySetup, 100);
    setTimeout(trySetup, 300);
    setTimeout(trySetup, 500);
    setTimeout(trySetup, 1000);
    setTimeout(trySetup, 2000);
    
    // Cleanup do useEffect
    return () => {
      console.log('🧹 [REACT] Cleanup do useEffect');
      // Remover listener de evento customizado
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-state-changed', handleAuthStateChanged);
      }
    };
  }, [html]);

  // Configurar formulário de orçamento
  useEffect(() => {
    if (!html) return;
    
    let isOrcamentoConfigured = false;
    
    const setupOrcamentoForm = () => {
      if (isOrcamentoConfigured) return true;
      
      const form = document.getElementById('orcamento-form') as HTMLFormElement;
      if (!form) {
        return false;
      }
      
      console.log('✅ [ORCAMENTO] Formulário encontrado, configurando...');
      
      // Remover listeners antigos clonando o form
      const newForm = form.cloneNode(true) as HTMLFormElement;
      form.parentNode?.replaceChild(newForm, form);
      
      const finalForm = document.getElementById('orcamento-form') as HTMLFormElement;
      if (!finalForm) {
        console.error('❌ [ORCAMENTO] Erro ao recriar formulário');
        return false;
      }
      
      // Handler para o submit do formulário
      const handleOrcamentoSubmit = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📧 [ORCAMENTO] Formulário submetido');
        
        const nomeEl = document.getElementById('orcamento-nome') as HTMLInputElement;
        const emailEl = document.getElementById('orcamento-email') as HTMLInputElement;
        const whatsappEl = document.getElementById('orcamento-whatsapp') as HTMLInputElement;
        const empresaEl = document.getElementById('orcamento-empresa') as HTMLInputElement;
        const tipoEl = document.getElementById('orcamento-tipo') as HTMLSelectElement;
        const orcamentoEl = document.getElementById('orcamento-orcamento') as HTMLSelectElement;
        const descricaoEl = document.getElementById('orcamento-descricao') as HTMLTextAreaElement;
        const termosEl = document.getElementById('orcamento-termos') as HTMLInputElement;
        const submitBtn = document.getElementById('orcamento-submit') as HTMLButtonElement;
        const submitText = document.getElementById('orcamento-submit-text');
        const messageEl = document.getElementById('orcamento-message');
        
        // Validar campos obrigatórios
        if (!nomeEl?.value.trim() || !emailEl?.value.trim() || !whatsappEl?.value.trim() || 
            !tipoEl?.value || !descricaoEl?.value.trim() || !termosEl?.checked) {
          if (messageEl) {
            messageEl.className = 'mt-4 p-4 rounded-xl text-center bg-red-100 text-red-700';
            messageEl.textContent = 'Por favor, preencha todos os campos obrigatórios e aceite os termos.';
            messageEl.classList.remove('hidden');
          }
          return false;
        }
        
        // Desabilitar botão
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          submitBtn.style.cursor = 'not-allowed';
        }
        if (submitText) {
          submitText.textContent = 'Enviando...';
        }
        
        // Limpar mensagem anterior
        if (messageEl) {
          messageEl.classList.add('hidden');
        }
        
        try {
          const formData = {
            name: nomeEl.value.trim(),
            email: emailEl.value.trim(),
            whatsapp: whatsappEl.value.trim(),
            projectType: tipoEl.value,
            description: descricaoEl.value.trim(),
            empresa: empresaEl?.value.trim() || '',
            orcamento: orcamentoEl?.value || ''
          };
          
          console.log('📤 [ORCAMENTO] Enviando dados:', formData);
          
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          console.log('📥 [ORCAMENTO] Status da resposta:', response.status);
          console.log('📥 [ORCAMENTO] Response OK:', response.ok);
          
          let data: any;
          try {
            data = await response.json();
            console.log('📥 [ORCAMENTO] Resposta completa:', JSON.stringify(data, null, 2));
          } catch (parseError) {
            console.error('❌ [ORCAMENTO] Erro ao parsear JSON:', parseError);
            const text = await response.text();
            console.error('❌ [ORCAMENTO] Resposta em texto:', text);
            throw new Error('Erro ao processar resposta do servidor');
          }
          
          // Verificar se foi sucesso (pode ser success: true OU apenas status 200)
          if (response.ok) {
            // Sucesso - pode ser success: true ou apenas status 200
            if (messageEl) {
              messageEl.className = 'mt-4 p-4 rounded-xl text-center bg-green-100 text-green-700';
              messageEl.textContent = '✅ Solicitação enviada com sucesso! Entraremos em contato em até 24 horas.';
              messageEl.classList.remove('hidden');
            }
            
            // Limpar formulário
            finalForm.reset();
            
            // Scroll até a mensagem
            messageEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            // Erro HTTP
            const errorMessage = data?.error || data?.message || `Erro HTTP ${response.status}: ${response.statusText}`;
            console.error('❌ [ORCAMENTO] Erro na resposta:', errorMessage);
            throw new Error(errorMessage);
          }
        } catch (error: any) {
          console.error('❌ [ORCAMENTO] Erro:', error);
          if (messageEl) {
            messageEl.className = 'mt-4 p-4 rounded-xl text-center bg-red-100 text-red-700';
            messageEl.textContent = '❌ Erro ao enviar solicitação: ' + (error.message || 'Erro desconhecido');
            messageEl.classList.remove('hidden');
          }
        } finally {
          // Reabilitar botão
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
          }
          if (submitText) {
            submitText.textContent = 'Enviar Solicitação de Orçamento';
          }
        }
        
        return false;
      };
      
      // Adicionar listener
      finalForm.addEventListener('submit', handleOrcamentoSubmit, false);
      
      isOrcamentoConfigured = true;
      console.log('✅ [ORCAMENTO] Formulário configurado com sucesso!');
      return true;
    };
    
    const trySetupOrcamento = () => {
      if (setupOrcamentoForm()) {
        console.log('✅ [ORCAMENTO] Setup completo!');
      }
    };
    
    // Tentar configurar múltiplas vezes
    setTimeout(trySetupOrcamento, 0);
    setTimeout(trySetupOrcamento, 100);
    setTimeout(trySetupOrcamento, 500);
    setTimeout(trySetupOrcamento, 1000);
  }, [html]);

  // Retornos condicionais APÓS todos os hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Erro ao carregar o site</p>
          <button 
            onClick={() => router.push('/ia-criador-site-v3')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Acessar Gerador de Sites com IA
          </button>
        </div>
      </div>
    );
  }

  // Função para processar criação pendente após login
  const handleLoginSuccess = async () => {
    console.log('✅ [REACT] Login bem-sucedido, processando criação pendente...');
    
    // Capturar snapshot dos dados pendentes antes de qualquer alteração de estado
    const promptData = pendingPromptData && pendingPromptData.idea && pendingPromptData.idea.trim().length > 0
      ? { ...pendingPromptData }
      : null;

    // Fechar modal imediatamente
    setIsLoginModalOpen(false);

    // Apenas mostrar animação se realmente houver prompt pendente para processar
    if (promptData) {
      setIsAnimating(true);
      if ((window as any).showLoadingAnimation) {
        (window as any).showLoadingAnimation();
      }
    } else {
      setIsAnimating(false);
    }

    // Atualizar header após login
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
    
    setTimeout(async () => {
      try {
        const loginButton = document.getElementById('header-login-button');
        if (loginButton) {
          const { getCurrentUser } = await import('@/lib/auth');
          const user = await getCurrentUser();
          if (user) {
            const container = loginButton.parentElement;
            if (container) {
              loginButton.remove();
              const existingLogout = document.getElementById('header-logout-button');
              const existingLogoutInjected = document.getElementById('header-logout-button-injected');
              if (existingLogout) existingLogout.remove();
              if (existingLogoutInjected) existingLogoutInjected.remove();

              const existingPanelLink = container.querySelector('a[href="/cliente"]');
              if (!existingPanelLink) {
                const areaClienteBtn = document.createElement('a');
                areaClienteBtn.href = '/cliente';
                areaClienteBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(147, 51, 234, 0.2); color: rgba(196, 181, 253, 1); border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: all 0.3s; white-space: nowrap; border: 1px solid rgba(147, 51, 234, 0.3);';
                areaClienteBtn.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg><span>Painel do Cliente</span>';
                container.appendChild(areaClienteBtn);
              }

              const existingLogoutBtn = container.querySelector('#header-logout-button') as HTMLButtonElement;
              if (!existingLogoutBtn) {
                const sairBtn = document.createElement('button');
                sairBtn.id = 'header-logout-button';
                sairBtn.textContent = 'Sair';
                sairBtn.onclick = async (e: Event) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    if (typeof window !== 'undefined') {
                      try {
                        localStorage.clear();
                        sessionStorage.clear();
                      } catch (storageErr) {
                        console.warn('Erro ao limpar storage:', storageErr);
                      }
                    }
                    const { signOut } = await import('@/lib/auth');
                    await signOut();
                  } catch (err) {
                    console.error('Erro ao fazer logout:', err);
                  }
                  window.location.href = '/';
                };
                sairBtn.style.cssText = 'padding: 0.5rem 1rem; background: transparent; color: rgba(196, 181, 253, 0.8); border: none; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: all 0.3s;';
                container.appendChild(sairBtn);
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ [REACT] Erro ao atualizar header após login:', error);
      }
    }, 500);

    // Se não há prompt pendente, apenas limpar estado e encerrar
    if (!promptData) {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('pending_site_creation');
        } catch (storageErr) {
          console.warn('⚠️ Erro ao limpar pending_site_creation:', storageErr);
        }
      }
      setPendingPromptData(null);
      console.log('ℹ️ [REACT] Nenhum prompt pendente – login concluído sem iniciar geração automática.');
      return;
    }

    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const user = await getCurrentUser();

      if (user) {
        const response = await fetch('/api/start-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initialPrompt: promptData.idea,
            projectType: 'site',
            clientName: 'Cliente',
            userId: user.id
          })
        });

        const data = await response.json();

        if (data.success && data.conversationId) {
          const chatUrl = `/chat/${data.conversationId}?prompt=${encodeURIComponent(promptData.idea)}&companyName=${encodeURIComponent(promptData.companyName || 'Meu Negócio')}&businessSector=${encodeURIComponent(promptData.businessSector || 'Negócios')}`;
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem('pending_site_creation');
            } catch (storageErr) {
              console.warn('⚠️ Erro ao limpar pending_site_creation:', storageErr);
            }
          }
          setPendingPromptData(null);

          setTimeout(() => {
            window.location.href = chatUrl;
          }, 300);
        } else {
          console.warn('⚠️ [REACT] Não foi possível iniciar conversa após login.');
          setIsAnimating(false);
        }
      } else {
        console.warn('⚠️ [REACT] Usuário não encontrado após login.');
        setIsAnimating(false);
      }
    } catch (error) {
      console.error('Erro ao processar criação pendente:', error);
      setIsAnimating(false);
    }
  };

  // Renderizar HTML usando dangerouslySetInnerHTML
  return (
    <>
      {/* ✅ Overlay de Loading durante submissão */}
      {/* ✅ Animação só aparece quando usuário está logado e prompt está sendo enviado */}
      {isAnimating && !isLoginModalOpen && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            key="loading-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
          >
            <motion.div
              key="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <motion.h3 
              key="title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-slate-900 mb-2"
            >
              Preparando seu projeto...
            </motion.h3>
            <motion.p 
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 mb-4"
            >
              Estamos redirecionando você para o assistente de IA
            </motion.p>
            <motion.div
              key="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}

      <div 
        id="ai-generated-site-root"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ minHeight: '100vh' }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingPromptData(null);
        }}
        onSuccess={handleLoginSuccess}
        initialMode={loginModalMode}
        pendingData={pendingPromptData}
      />
    </>
  );
}

