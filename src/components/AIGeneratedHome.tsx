'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { convertJSXToHTML, processAIGeneratedCode } from '@/lib/jsx-to-html';

/**
 * Componente que renderiza 100% o HTML puro gerado pela IA
 * Busca DIRETAMENTE do banco de dados (site_versions) sem API intermediária
 * Usa apenas HTML/JavaScript puro, sem recursos do Next.js
 */
interface AIGeneratedHomeProps {
  conversationId?: string; // ConversationId opcional - se não fornecido, busca a versão mais recente
}

export default function AIGeneratedHome({ conversationId: propConversationId }: AIGeneratedHomeProps = {}) {
  const [html, setHtml] = useState<string>('');
  const [styles, setStyles] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevenir múltiplos fetches
    let isMounted = true;
    let fetchInProgress = false;
    
    async function fetchAndRenderHTML() {
      if (!isMounted || fetchInProgress) {
        console.log('⏭️ [AIGeneratedHome] Fetch já em progresso ou componente desmontado, ignorando...');
        return;
      }
      
      fetchInProgress = true;
      
      try {
        // Usar conversationId da prop ou buscar a versão mais recente disponível
        let conversationId = propConversationId;
        console.log('🔍 [AIGeneratedHome] Buscando código DIRETAMENTE do banco...', { conversationId: conversationId || 'BUSCAR MAIS RECENTE' });
        
        // Buscar diretamente do Supabase usando a mesma lógica da rota /preview/[siteId]
        // Tentativa 1: Buscar pelo ID exato (se conversationId for um UUID de versão específica)
        let latestVersion: any = null;
        let dbError: any = null;
        
        if (conversationId) {
          console.log(`🔍 [AIGeneratedHome] Tentativa 1: Buscando pelo ID exato: ${conversationId}`);
          const { data: byIdData, error: byIdError } = await supabase
            .from('site_versions')
            .select('*')
            .eq('id', conversationId)
            .maybeSingle();
          
          if (!byIdError && byIdData) {
            latestVersion = byIdData;
            console.log(`✅ [AIGeneratedHome] Versão encontrada pelo ID exato: ${conversationId}`);
          } else {
            // Tentativa 2: Buscar por conversation_id
            console.log(`🔍 [AIGeneratedHome] Tentativa 2: Buscando por conversation_id: ${conversationId}`);
            const { data: byConvData, error: byConvError } = await supabase
              .from('site_versions')
              .select('*')
              .eq('conversation_id', conversationId)
              .order('version_number', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (!byConvError && byConvData) {
              latestVersion = byConvData;
              console.log(`✅ [AIGeneratedHome] Versão encontrada por conversation_id: ${conversationId}`);
            } else {
              dbError = byConvError || byIdError;
            }
          }
        }
        
        // Se não encontrou ou não foi fornecido conversationId, buscar a versão mais recente
        if (!latestVersion && !dbError) {
          console.log('🔍 [AIGeneratedHome] Tentativa 3: Buscando versão mais recente disponível...');
          const { data: anyVersion, error: anyError } = await supabase
            .from('site_versions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (!anyError && anyVersion) {
            latestVersion = anyVersion;
            console.log('✅ [AIGeneratedHome] Versão mais recente encontrada:', {
              conversation_id: latestVersion.conversation_id,
              version: latestVersion.version_number,
              created_at: latestVersion.created_at
            });
          } else {
            dbError = anyError;
            console.error('❌ [AIGeneratedHome] Erro ao buscar versão mais recente:', anyError);
          }
        }
        
        if (dbError) {
          console.error('❌ [AIGeneratedHome] Erro ao buscar do banco:', dbError);
          setError(`Erro ao buscar site: ${dbError.message}`);
          setLoading(false);
          return;
        }
        
        if (!latestVersion) {
          console.error('❌ [AIGeneratedHome] Nenhuma versão encontrada');
          setError('Site não encontrado no banco de dados. Verifique se há versões cadastradas.');
          setLoading(false);
          return;
        }
        
        if (!latestVersion.site_code) {
          console.error('❌ [AIGeneratedHome] Versão encontrada mas site_code está vazio:', {
            id: latestVersion.id,
            conversation_id: latestVersion.conversation_id,
            version_number: latestVersion.version_number
          });
          setError('Código do site está vazio no banco de dados');
          setLoading(false);
          return;
        }
        
        console.log('✅ [AIGeneratedHome] Código encontrado no banco:', { 
          version: latestVersion.version_number,
          length: latestVersion.site_code.length 
        });
        
        let htmlContent = typeof latestVersion.site_code === 'string' 
          ? latestVersion.site_code 
          : String(latestVersion.site_code ?? '');
        
        // Converter JSX para HTML se necessário (mesma lógica da API)
        const isJSX = htmlContent.includes('import React') || 
                      htmlContent.includes('export default') || 
                      htmlContent.includes('from "react"') ||
                      htmlContent.includes("from 'react'") ||
                      htmlContent.includes('className=') ||
                      (htmlContent.includes('const ') && htmlContent.includes('=> {'));
        
        if (isJSX) {
          console.log('🔄 [AIGeneratedHome] Detectado JSX, convertendo para HTML...');
          try {
            htmlContent = processAIGeneratedCode(htmlContent);
            htmlContent = convertJSXToHTML(htmlContent, {
              removeComplexExpressions: true,
              convertClassName: true,
              preserveInlineStyles: true,
              addTailwind: true
            });
          } catch (conversionError) {
            console.error('❌ [AIGeneratedHome] Erro ao converter JSX:', conversionError);
            setError('Erro ao converter código JSX para HTML');
            setLoading(false);
            return;
          }
        }
        
        // Limpeza mínima de localhost:3001 (feita uma vez aqui)
        console.log('🔒 [AIGeneratedHome] Aplicando limpeza de localhost:3001...');
        htmlContent = htmlContent.replace(/<script[^>]*>[\s\S]*?localhost:3001[\s\S]*?<\/script>/gi, '<!-- Script com localhost:3001 removido -->');
        htmlContent = htmlContent.replace(/(href|src|action)=["'][^"']*localhost:3001[^"']*["']/gi, '$1="#"');
        htmlContent = htmlContent.replace(/window\.location\s*[=\.]\s*["']?[^"';)]*localhost:3001[^"';)]*["']?/gi, 'void(0);');
        htmlContent = htmlContent.replace(/window\.open\s*\([^)]*localhost:3001[^)]*\)/gi, 'void(0);');
        htmlContent = htmlContent.replace(/location\.href\s*=\s*["']?[^"';)]*localhost:3001[^"';)]*["']?/gi, 'void(0);');
        htmlContent = htmlContent.replace(/<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi, '');
        htmlContent = htmlContent.replace(/https?:\/\/localhost:3001[^\s"'<>]*/gi, '#');
        htmlContent = htmlContent.replace(/localhost:3001[^\s"'<>]*/gi, '#');
        htmlContent = htmlContent.replace(/onclick=["'][^"']*localhost:3001[^"']*["']/gi, 'onclick="return false;"');
        
        if (htmlContent) {
          
          // CORREÇÃO MÍNIMA: Apenas corrigir links WhatsApp vazios se necessário
          try {
            const encodedMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços.');
            const whatsappUrl = 'https://wa.me/5511947293221?text=' + encodedMessage;
            
            // Apenas corrigir links vazios do WhatsApp
            htmlContent = htmlContent.replace(/href=["']https?:\/\/wa\.me\/["']/gi, 'href="' + whatsappUrl + '"');
            htmlContent = htmlContent.replace(/href=["']wa\.me\/["']/gi, 'href="' + whatsappUrl + '"');
            htmlContent = htmlContent.replace(/href=["']https?:\/\/wa\.me["']/gi, 'href="' + whatsappUrl + '"');
            
            console.log('✅ [AIGeneratedHome] Links WhatsApp corrigidos');
          } catch (err) {
            console.warn('⚠️ [AIGeneratedHome] Erro ao corrigir links WhatsApp:', err);
          }
          
          // 3. INJETAR SCRIPT DE BLOQUEIO ROBUSTO - interceptar TODAS as formas de navegação
          // Executar ANTES de qualquer outro script para garantir que nada escape
          const blockingScript = String.raw`
            <script>
              !function() {
                'use strict';
                try {
                  if (window.__wzSolutionInstalled) return;
                  window.__wzSolutionInstalled = true;
                  
                  // Função para verificar e bloquear localhost:3001
                  function shouldBlock(url) {
                    if (!url || typeof url !== 'string') return false;
                    return url.indexOf('localhost:3001') !== -1 || url.indexOf('localhost%3A3001') !== -1;
                  }
                  
                  // 0. BLOQUEAR window.top.location se estiver em iframe
                  if (window.top !== window) {
                    try {
                      // Interceptar tentativas de navegação do top window
                      var originalTopLocation = window.top.location;
                      Object.defineProperty(window.top, 'location', {
                        get: function() {
                          return originalTopLocation;
                        },
                        set: function(url) {
                          if (shouldBlock(url)) {
                            console.warn('🚫 Bloqueado window.top.location para localhost:3001');
                            return;
                          }
                          // Permitir outras navegações
                          originalTopLocation.href = url;
                        },
                        configurable: true
                      });
                    } catch(e) {
                      // Ignorar se não conseguir interceptar (sandbox pode bloquear)
                    }
                  }
                  
                  // 1. INTERCEPTAR window.open
                  var originalOpen = window.open;
                  if (typeof originalOpen === 'function') {
                    window.open = function(url, target, features) {
                      if (shouldBlock(url)) {
                        console.warn('🚫 Bloqueado window.open para localhost:3001');
                        return null;
                      }
                      // WhatsApp: abrir no top se estiver em iframe
                      if (typeof url === 'string' && (url.indexOf('wa.me') !== -1 || url.indexOf('whatsapp') !== -1) && window.top !== window) {
                        return window.top.open(url, '_blank', 'noopener,noreferrer');
                      }
                      return originalOpen.call(window, url, target, features);
                    };
                  }
                  
                  // 2. INTERCEPTAR window.location (tentar apenas o que é possível)
                  // NOTA: location.replace e location.assign são somente leitura em sandboxed iframes
                  // Focamos em interceptar cliques e window.open, que são mais eficazes
                  try {
                    // Tentar interceptar apenas location.href se possível
                    // Se falhar, não é crítico - os cliques já são interceptados
                    var locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location') || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'location');
                    if (locationDescriptor && locationDescriptor.set) {
                      var originalLocationSetter = locationDescriptor.set;
                      Object.defineProperty(window, 'location', {
                        set: function(url) {
                          if (shouldBlock(url)) {
                            console.warn('🚫 Bloqueado window.location para localhost:3001');
                            return;
                          }
                          originalLocationSetter.call(window, url);
                        },
                        get: locationDescriptor.get,
                        configurable: true
                      });
                    }
                  } catch(e) {
                    // Ignorar silenciosamente - não é crítico se não conseguir interceptar location
                    // Os cliques e window.open já são interceptados
                  }
                  
                  // 3. INTERCEPTAR cliques em elementos com localhost:3001
                  // IMPORTANTE: Só bloquear elementos que REALMENTE contêm localhost:3001
                  // CRÍTICO: Não bloquear outros botões ou links legítimos
                  function interceptClicks(e) {
                    try {
                      var target = e.target;
                      var maxDepth = 10;
                      var depth = 0;
                      
                      // Verificar o elemento clicado e seus pais
                      while (target && depth < maxDepth) {
                        // Verificar se é um elemento clicável
                        var tagName = target.tagName ? target.tagName.toLowerCase() : '';
                        var isClickable = tagName === 'a' || tagName === 'button' || 
                                         target.getAttribute('onclick') || 
                                         target.getAttribute('data-href') ||
                                         target.getAttribute('role') === 'button';
                        
                        if (isClickable) {
                          // Buscar TODOS os atributos que podem conter URLs
                          var href = target.getAttribute && target.getAttribute('href');
                          var onclick = target.getAttribute && target.getAttribute('onclick');
                          var dataHref = target.getAttribute && target.getAttribute('data-href');
                          var dataUrl = target.getAttribute && target.getAttribute('data-url');
                          
                          // SÓ bloquear se REALMENTE contém localhost:3001 em QUALQUER atributo
                          var hasLocalhost = (href && shouldBlock(href)) || 
                                           (onclick && shouldBlock(onclick)) || 
                                           (dataHref && shouldBlock(dataHref)) ||
                                           (dataUrl && shouldBlock(dataUrl));
                          
                          if (hasLocalhost) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.warn('🚫 Bloqueado clique em elemento com localhost:3001:', {
                              tag: tagName,
                              href: href,
                              onclick: onclick ? onclick.substring(0, 50) : null
                            });
                            return false;
                          }
                          // Se não tem localhost:3001, deixar prosseguir normalmente
                          break; // Encontrou elemento clicável sem localhost, pode prosseguir
                        }
                        
                        target = target.parentElement;
                        depth++;
                      }
                      // Se não encontrou localhost:3001 em nenhum elemento, deixar o evento prosseguir normalmente
                    } catch(err) {
                      // Se houver erro, deixar o evento prosseguir (não bloquear por erro)
                      console.error('Erro ao interceptar clique:', err);
                    }
                  }
                  
                  // Adicionar listener na fase de captura para interceptar ANTES de outros handlers
                  // Mas só para elementos que realmente contêm localhost:3001
                  if (typeof document.addEventListener === 'function') {
                    // Adicionar listener de clique imediatamente (pode executar antes do DOM estar pronto)
                    document.addEventListener('click', interceptClicks, true);
                    
                    // Após DOM carregar, bloquear elementos dinamicamente
                    function setupDOMContent() {
                      // Bloquear elementos dinamicamente após DOM carregar
                      // IMPORTANTE: Só bloquear elementos que REALMENTE contêm localhost:3001
                      function blockLocalhostElements() {
                        try {
                          var allElements = document.querySelectorAll('a, button, [onclick], [data-href]');
                          for (var i = 0; i < allElements.length; i++) {
                            var el = allElements[i];
                            
                            // Pular elementos já bloqueados para evitar loops
                            if (el.getAttribute('data-blocked') === 'true') {
                              continue;
                            }
                            
                            var href = el.getAttribute('href') || el.getAttribute('data-href') || '';
                            var onclick = el.getAttribute('onclick') || '';
                            
                            // SÓ bloquear se realmente contém localhost:3001
                            if (shouldBlock(href) || shouldBlock(onclick)) {
                              el.setAttribute('href', '#');
                              if (onclick && shouldBlock(onclick)) {
                                el.setAttribute('onclick', 'return false;');
                              }
                              el.style.pointerEvents = 'none';
                              el.style.opacity = '0.5';
                              el.setAttribute('data-blocked', 'true');
                            }
                          }
                        } catch(e) {}
                      }
                      
                      blockLocalhostElements();
                      // Executar periodicamente para pegar elementos adicionados dinamicamente
                      // Mas com intervalo maior para não sobrecarregar
                      setInterval(blockLocalhostElements, 2000);
                    }
                    
                    // Executar quando DOM estiver pronto
                    if (document.readyState === 'loading') {
                      document.addEventListener('DOMContentLoaded', setupDOMContent);
                    } else {
                      setupDOMContent();
                    }
                  }
                  
                  // 4. INTERCEPTAR document.createElement para bloquear iframes com localhost:3001
                  var originalCreateElement = document.createElement;
                  document.createElement = function(tagName) {
                    var element = originalCreateElement.call(document, tagName);
                    if (tagName.toLowerCase() === 'iframe') {
                      var originalSetAttribute = element.setAttribute;
                      element.setAttribute = function(name, value) {
                        if (name === 'src' && shouldBlock(value)) {
                          console.warn('🚫 Bloqueado criação de iframe com localhost:3001');
                          return;
                        }
                        originalSetAttribute.call(element, name, value);
                      };
                    }
                    return element;
                  };
                  
                  // 5. CORRIGIR links WhatsApp
                  function fixWhatsAppLinks() {
                    try {
                      if (typeof document.querySelectorAll !== 'function') return;
                      var links = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
                      for (var i = 0; i < links.length; i++) {
                        try {
                          if (!links[i].target || links[i].target === '_self') {
                            links[i].target = '_blank';
                            links[i].rel = 'noopener noreferrer';
                          }
                        } catch(e) {}
                      }
                    } catch(e) {}
                  }
                  
                  if (document.readyState === 'loading') {
                    if (typeof document.addEventListener === 'function') {
                      document.addEventListener('DOMContentLoaded', fixWhatsAppLinks);
                    }
                  } else {
                    fixWhatsAppLinks();
                  }
                } catch(e) {
                  console.error('Erro no script de bloqueio:', e);
                }
              }();
            </script>
          `;
          
          // Injetar script de bloqueio no head de forma segura
          // CRÍTICO: Injetar ANTES de qualquer outro script
          try {
            if (htmlContent.includes('<head>')) {
              // Injetar logo após <head> para garantir que execute primeiro
              htmlContent = htmlContent.replace(/<head[^>]*>/, '<head>' + blockingScript);
            } else if (htmlContent.includes('<html>')) {
              htmlContent = htmlContent.replace(/<html[^>]*>/, '<html><head>' + blockingScript + '</head>');
            } else {
              // Se não há head nem html, injetar no início absoluto
              htmlContent = blockingScript + htmlContent;
            }
          } catch (err) {
            console.warn('⚠️ [AIGeneratedHome] Erro ao injetar script de bloqueio:', err);
            // Tentar injetar no início do body como fallback
            if (htmlContent.includes('<body')) {
              htmlContent = htmlContent.replace(/<body[^>]*>/, '<body>' + blockingScript);
            } else if (htmlContent.includes('</body>')) {
              htmlContent = htmlContent.replace('</body>', blockingScript + '</body>');
            }
          }
          
          setHtml(htmlContent);
          console.log('✅ [AIGeneratedHome] HTML configurado diretamente do banco:', {
            tamanho: htmlContent.length,
            temDOCTYPE: htmlContent.includes('<!DOCTYPE'),
            temHTML: htmlContent.includes('<html'),
            temBody: htmlContent.includes('<body')
          });
        } else {
          setError('Código do site vazio no banco de dados');
        }
      } catch (err) {
        console.error('❌ [AIGeneratedHome] Erro ao buscar HTML:', err);
        if (isMounted) {
          setError(`Erro ao carregar o site: ${err instanceof Error ? err.message : String(err)}`);
        }
      } finally {
        fetchInProgress = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    // Garantir que só executa uma vez
    const timeoutId = setTimeout(() => {
      fetchAndRenderHTML();
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      fetchInProgress = false;
    };
  }, []);

  // useEffect para gerenciar mensagens do iframe (salvar dados e navegação)
  useEffect(() => {
    if (!html) return;
    
    // Flag para prevenir múltiplos processamentos simultâneos
    let isProcessingBudgetForm = false;
    
    // Listener para mensagens do iframe
    const handleMessage = async (event: MessageEvent) => {
      console.log('📨 [AIGeneratedHome] Mensagem recebida do iframe:', event.data.type);
      
      // Salvar dados do chat
      if (event.data.type === 'save-chat-data') {
        const { conversationId, data } = event.data;
        if (typeof window !== 'undefined' && conversationId && data) {
          sessionStorage.setItem(`chat_${conversationId}`, JSON.stringify(data));
        }
      }
      
      // Navegar para o chat quando solicitado pelo iframe
      if (event.data.type === 'navigate-to-chat') {
        const { url, conversationId, data } = event.data;
        
        // Salvar dados no sessionStorage
        if (conversationId && data && typeof window !== 'undefined') {
          sessionStorage.setItem(`chat_${conversationId}`, JSON.stringify(data));
        }
        
        // Redirecionar para a página de chat
        if (url && typeof window !== 'undefined') {
          window.location.href = url;
        }
      }
      
      // ✅ PROCESSAR ERRO DE VALIDAÇÃO DO FORMULÁRIO
      if (event.data.type === 'budget-form-validation-error') {
        const { message, missingFields } = event.data;
        console.error('❌ [AIGeneratedHome] Erro de validação do formulário:', message);
        alert(message);
        return;
      }
      
      // ✅ PROCESSAR FORMULÁRIO DE ORÇAMENTO DO IFRAME
      if (event.data.type === 'submit-budget-form') {
        // Prevenir múltiplos processamentos simultâneos
        if (isProcessingBudgetForm) {
          console.log('⚠️ [AIGeneratedHome] Formulário já está sendo processado, ignorando...');
          return;
        }
        
        isProcessingBudgetForm = true;
        
        const { formData, timestamp } = event.data;
        console.log('📋 [AIGeneratedHome] Formulário de orçamento recebido do iframe:', formData, 'Timestamp:', timestamp);
        
        // Validar dados recebidos
        if (!formData.name || !formData.email || !formData.whatsapp || !formData.projectType || !formData.description) {
          console.error('❌ [AIGeneratedHome] Dados do formulário incompletos:', formData);
          alert('Por favor, preencha todos os campos do formulário.');
          isProcessingBudgetForm = false; // Reabilitar após erro
          return;
        }
        
        try {
          console.log('📤 [AIGeneratedHome] Enviando requisição para /api/send-email...');
          
          // Enviar para API
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              whatsapp: formData.whatsapp,
              projectType: formData.projectType,
              description: formData.description
            }),
          });
          
          console.log('📥 [AIGeneratedHome] Resposta da API:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          });
          
          const responseData = await response.json();
          console.log('📋 [AIGeneratedHome] Dados da resposta:', responseData);
          
          if (response.ok) {
            console.log('✅ [AIGeneratedHome] Email enviado com sucesso!');
            
            // Mostrar mensagem de sucesso apenas uma vez
            alert('✅ Orçamento enviado com sucesso! Entraremos em contato em breve.');
            
            // Enviar mensagem de volta para o iframe para mostrar sucesso
            const iframe = document.getElementById('ai-generated-site-root') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: 'budget-form-success',
                message: 'Orçamento enviado com sucesso!'
              }, '*');
            }
            
            // Resetar flag após sucesso
            isProcessingBudgetForm = false;
          } else {
            console.error('❌ [AIGeneratedHome] Erro ao enviar email:', responseData);
            
            let errorMessage = 'Erro ao enviar solicitação. ';
            if (responseData.error) {
              errorMessage += responseData.error;
            } else if (responseData.message) {
              errorMessage += responseData.message;
            } else {
              errorMessage += 'Tente novamente.';
            }
            
            if (responseData.contact) {
              errorMessage += `\n\nEntre em contato diretamente:\n📧 ${responseData.contact.email}\n📱 ${responseData.contact.whatsapp}`;
            }
            
            alert(errorMessage);
            
            // Enviar mensagem de erro para o iframe
            const iframe = document.getElementById('ai-generated-site-root') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: 'budget-form-error',
                error: responseData.error || 'Erro desconhecido'
              }, '*');
            }
            
            // Resetar flag após erro
            isProcessingBudgetForm = false;
          }
        } catch (error) {
          console.error('❌ [AIGeneratedHome] Erro ao processar formulário:', error);
          alert('Erro ao enviar solicitação. Tente novamente.\n\nErro: ' + (error instanceof Error ? error.message : String(error)));
          
          // Resetar flag após erro
          isProcessingBudgetForm = false;
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [html]);
  
  // useEffect para monitorar e bloquear navegação para localhost:3001 no iframe
  useEffect(() => {
    if (!html) return;
    
    const iframe = document.getElementById('ai-generated-site-root') as HTMLIFrameElement;
    if (!iframe) return;
    
    // Função para verificar e bloquear localhost:3001
    const checkAndBlockLocalhost = () => {
      try {
        if (iframe.contentWindow && iframe.contentWindow.location) {
          const currentUrl = iframe.contentWindow.location.href;
          if (currentUrl && currentUrl.includes('localhost:3001')) {
            console.warn('🚫 [AIGeneratedHome] Tentativa de navegação para localhost:3001 detectada, bloqueando...');
            // Tentar parar a navegação
            try {
              iframe.contentWindow.stop();
            } catch (e) {
              console.warn('⚠️ [AIGeneratedHome] Não foi possível parar navegação:', e);
            }
            // Tentar substituir por about:blank
            try {
              iframe.contentWindow.location.replace('about:blank');
            } catch (e) {
              console.warn('⚠️ [AIGeneratedHome] Não foi possível substituir URL:', e);
            }
          }
        }
      } catch (e) {
        // Ignorar erros de cross-origin
      }
    };
    
    // Monitorar periodicamente a URL do iframe
    const monitorInterval = setInterval(checkAndBlockLocalhost, 500);
    
    // Interceptar eventos beforeunload no iframe
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Verificar se há tentativa de navegação para localhost:3001
      if (window.location.href.includes('localhost:3001')) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    // Tentar adicionar listener no iframe (pode falhar por cross-origin)
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('beforeunload', handleBeforeUnload);
      }
    } catch (e) {
      // Ignorar se não conseguir acessar (cross-origin)
    }
    
    // Listener para quando o iframe carregar
    const handleIframeLoad = () => {
      checkAndBlockLocalhost();
      // NÃO tentar injetar script adicional - o script já foi injetado no HTML
      // Tentar redefinir location causa erros porque é somente leitura em sandboxed iframes
    };
    
    iframe.addEventListener('load', handleIframeLoad);
    
    return () => {
      clearInterval(monitorInterval);
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [html]);

  // useEffect para esconder layout padrão e renderizar HTML completo
  useEffect(() => {
    if (!html) return;
    
    // Função para esconder elementos do layout padrão
    const hideOldLayout = () => {
      // Esconder todos os elementos com classe site-header-footer
      document.querySelectorAll('.site-header-footer').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.height = '0';
        htmlEl.style.overflow = 'hidden';
        htmlEl.style.position = 'absolute';
        htmlEl.style.zIndex = '-9999';
      });
      
      // Esconder Header, Footer, Nav do layout padrão (não do HTML da IA)
      document.querySelectorAll('header, footer, nav').forEach(el => {
        if (!el.closest('#ai-generated-site-root')) {
          const htmlEl = el as HTMLElement;
          htmlEl.style.display = 'none';
          htmlEl.style.visibility = 'hidden';
        }
      });
    };
    
    // Executar imediatamente e repetidamente para garantir
    hideOldLayout();
    const interval = setInterval(hideOldLayout, 100);
    
    
    // Injetar CSS mínimo apenas para esconder elementos antigos
    const cssId = 'ai-generated-layout-fix';
    let cssElement = document.getElementById(cssId);
    
    if (!cssElement) {
      cssElement = document.createElement('style');
      cssElement.id = cssId;
      cssElement.textContent = `
        /* ESCONDER COMPLETAMENTE elementos do layout padrão */
        .site-header-footer,
        body > header:not(#ai-generated-site-root header),
        body > footer:not(#ai-generated-site-root footer),
        body > nav:not(#ai-generated-site-root nav),
        main > header:not(#ai-generated-site-root header),
        main > footer:not(#ai-generated-site-root footer) {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          z-index: -9999 !important;
          opacity: 0 !important;
        }
        
        /* Resetar estilos globais que podem interferir */
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
        
        /* Container do HTML da IA - sem interferir */
        #ai-generated-site-root {
          width: 100vw !important;
          max-width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `;
      document.head.appendChild(cssElement);
    }
    
    return () => {
      clearInterval(interval);
      // Limpar CSS fix ao desmontar
      const cssFixElement = document.getElementById(cssId);
      if (cssFixElement) {
        cssFixElement.remove();
      }
    };
  }, [html]);


  // Early returns APÓS todos os hooks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-white">Carregando site...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-2xl px-4">
          <p className="text-red-400 text-lg mb-4">Erro ao carregar o site</p>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // Garantir que só renderiza UM iframe
  if (!html) {
    return null;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        key="ai-generated-site-root" // Key para garantir que é o mesmo iframe
        id="ai-generated-site-root"
        srcDoc={html}
        style={{ 
          width: '100vw',
          height: '100vh',
          border: 0,
          display: 'block',
          margin: 0,
          padding: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin allow-modals allow-pointer-lock"
        title="Site Gerado pela IA"
        onLoad={(e) => {
          console.log('✅ [AIGeneratedHome] Iframe carregado');
          
          // Verificar imediatamente se há tentativa de navegação para localhost:3001
          const iframe = e.currentTarget as HTMLIFrameElement;
          try {
            if (iframe.contentWindow && iframe.contentWindow.location) {
              const currentUrl = iframe.contentWindow.location.href;
              if (currentUrl && currentUrl.includes('localhost:3001')) {
                console.warn('🚫 [AIGeneratedHome] Detecção de localhost:3001 no onLoad, bloqueando...');
                try {
                  iframe.contentWindow.stop();
                  iframe.contentWindow.location.replace('about:blank');
                } catch (err) {
                  console.warn('⚠️ [AIGeneratedHome] Não foi possível bloquear:', err);
                }
              }
            }
          } catch (err) {
            // Ignorar erros de cross-origin
          }
        }}
        onError={() => {
          console.warn('⚠️ [AIGeneratedHome] Erro no iframe');
        }}
      />
    </div>
  );
}

