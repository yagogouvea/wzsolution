'use client';

// ✅ Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, User, Bot, Image as ImageIcon, Monitor, Eye, X, XCircle, Copy, Check } from 'lucide-react';
import PreviewIframe from '@/components/PreviewIframe';
import AIThinkingIndicator from '@/components/AIThinkingIndicator';
import { moderateMessage, getRedirectMessage } from '@/lib/message-moderation';
import { canMakeModification, getWhatsAppUrl, generateProjectId, PROJECT_LIMITS } from '@/lib/project-limits';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'site_preview';
  metadata?: Record<string, unknown>;
  siteCodeId?: string;
}

function ChatPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = params.conversationId as string;
  
  // ✅ Buscar dados iniciais dos query params ou sessionStorage
  // ✅ Para prompts longos, usar sessionStorage em vez de query params para evitar problemas de serialização
  const getInitialData = () => {
    // ✅ Valores padrão seguros
    const defaultData = {
      companyName: 'Meu Negócio',
      businessSector: 'Negócios',
      additionalPrompt: ''
    };

    // ✅ Se está no cliente, tentar buscar do sessionStorage primeiro
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`chat_data_${conversationId}`) || 
                      sessionStorage.getItem(`chat_${conversationId}`);
        
        if (stored) {
          try {
            const data = JSON.parse(stored);
            return {
              companyName: data.companyName || searchParams.get('companyName') || defaultData.companyName,
              businessSector: data.businessSector || searchParams.get('businessSector') || defaultData.businessSector,
              additionalPrompt: data.additionalPrompt || data.prompt || ''
            };
          } catch (e) {
            console.error('❌ Erro ao parsear sessionStorage:', e);
          }
        }
      } catch (e) {
        console.error('❌ Erro ao acessar sessionStorage:', e);
      }
    }
    
    // ✅ Se não tem no sessionStorage, tentar query params
    // ✅ LIMITAR tamanho do prompt da URL para evitar problemas de serialização
    const promptFromUrl = searchParams.get('prompt') || '';
    const MAX_URL_PROMPT_LENGTH = 500; // ✅ Limite seguro para evitar problemas
    
    // ✅ Se o prompt for muito longo, tentar buscar do sessionStorage
    if (promptFromUrl.length > MAX_URL_PROMPT_LENGTH && typeof window !== 'undefined') {
      try {
        const storedPrompt = sessionStorage.getItem(`prompt_${conversationId}`);
        if (storedPrompt) {
          return {
            companyName: searchParams.get('companyName') || defaultData.companyName,
            businessSector: searchParams.get('businessSector') || defaultData.businessSector,
            additionalPrompt: storedPrompt
          };
        }
      } catch (e) {
        console.error('❌ Erro ao buscar prompt do sessionStorage:', e);
      }
    }
    
    return {
      companyName: searchParams.get('companyName') || defaultData.companyName,
      businessSector: searchParams.get('businessSector') || defaultData.businessSector,
      // ✅ Truncar prompt da URL se muito longo para evitar problemas
      additionalPrompt: promptFromUrl.length > MAX_URL_PROMPT_LENGTH 
        ? promptFromUrl.substring(0, MAX_URL_PROMPT_LENGTH) + '... [Prompt truncado - muito longo para URL]'
        : promptFromUrl
    };
  };

  const [initialData, setInitialData] = useState(getInitialData());

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false); // ✅ Estado para inicialização inicial
  const [currentSiteCode, setCurrentSiteCode] = useState<string>('');
  const [conversationInitialized, setConversationInitialized] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File; imageUrl: string } | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [modificationsUsed, setModificationsUsed] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasEndedManually, setHasEndedManually] = useState(false); // ✅ Novo estado para rastrear encerramento manual
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // ✅ Proteção contra múltiplas chamadas
  const [activeRequestsCount, setActiveRequestsCount] = useState(0); // ✅ Contador de requisições ativas
  const [copiedId, setCopiedId] = useState(false); // ✅ Estado para copiar ID da conversa
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null); // ✅ Tempo de início da geração
  const [elapsedTime, setElapsedTime] = useState(0); // ✅ Tempo decorrido em segundos
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationLockRef = useRef(false); // ✅ Lock para prevenir múltiplas gerações simultâneas
  const abortControllersRef = useRef<AbortController[]>([]); // ✅ Controllers para cancelar requisições
  const isPageVisibleRef = useRef(true); // ✅ Rastrear visibilidade da página (para iPhone)
  const generationStateRef = useRef<{ conversationId: string; prompt: string } | null>(null); // ✅ Persistir estado de geração

  // Esconder Header, Footer e WhatsAppButton quando estiver no chat
  useEffect(() => {
    const hideSiteElements = () => {
      const siteElements = document.querySelectorAll('.site-header-footer');
      siteElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    };

    const showSiteElements = () => {
      const siteElements = document.querySelectorAll('.site-header-footer');
      siteElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };

    hideSiteElements();

    return () => {
      showSiteElements();
    };
  }, []);

  // ✅ Buscar dados do sessionStorage se não vierem por query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // ✅ Tentar múltiplas chaves para compatibilidade
        const stored = sessionStorage.getItem(`chat_${conversationId}`) || 
                      sessionStorage.getItem(`chat_data_${conversationId}`);
        
        if (stored) {
          try {
            const data = JSON.parse(stored);
            console.log('💾 [Chat] Dados carregados do sessionStorage:', {
              companyName: data.companyName,
              businessSector: data.businessSector,
              promptLength: data.additionalPrompt?.length || 0
            });
            
            setInitialData(prev => {
              const newData = {
                companyName: data.companyName || prev.companyName,
                businessSector: data.businessSector || prev.businessSector,
                additionalPrompt: data.additionalPrompt || data.prompt || prev.additionalPrompt
              };
              console.log('💾 [Chat] InitialData atualizado:', {
                companyName: newData.companyName,
                businessSector: newData.businessSector,
                promptLength: newData.additionalPrompt?.length || 0
              });
              return newData;
            });
          } catch (parseError) {
            console.error('❌ Erro ao parsear sessionStorage:', parseError);
          }
        } else {
          // ✅ Se não tem no sessionStorage mas tem prompt longo na URL, tentar salvar
          const promptFromUrl = searchParams.get('prompt') || '';
          if (promptFromUrl.length > 1000) {
            console.log('💾 [Chat] Prompt longo detectado na URL, salvando no sessionStorage...');
            try {
              sessionStorage.setItem(`prompt_${conversationId}`, promptFromUrl);
              setInitialData(prev => ({
                ...prev,
                additionalPrompt: promptFromUrl
              }));
            } catch (storageError) {
              console.error('❌ Erro ao salvar prompt no sessionStorage:', storageError);
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao acessar sessionStorage:', error);
      }
    }
  }, [conversationId, searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Atualizar tempo decorrido em tempo real quando estiver gerando
  useEffect(() => {
    if (!generationStartTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - generationStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [generationStartTime]);

  // ✅ Ref para armazenar o intervalo de retry
  const previewCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ Monitorar quando preview é adicionado e limpar timer quando visível
  useEffect(() => {
    // ✅ Procurar por mensagem do tipo site_preview nas mensagens
    const previewMessage = messages.find(msg => msg.type === 'site_preview' && msg.siteCodeId);
    
    if (previewMessage && isGenerating && generationStartTime !== null) {
      console.log('🔍 [useEffect] Preview encontrado no estado, verificando visibilidade no DOM...', {
        messageId: previewMessage.id,
        siteCodeId: previewMessage.siteCodeId
      });
      
      // ✅ Limpar intervalo anterior se existir
      if (previewCheckIntervalRef.current) {
        clearInterval(previewCheckIntervalRef.current);
        previewCheckIntervalRef.current = null;
      }
      
      // ✅ Função para verificar preview - PROCURAR ESPECIFICAMENTE PELO BOTÃO DO PREVIEW
      const checkPreview = () => {
        // ✅ Procurar pelo elemento da mensagem
        const previewElement = document.querySelector(`[data-message-id="${previewMessage.id}"]`) as HTMLElement | null;
        
        if (!previewElement) {
          console.log('⏳ [useEffect] Elemento da mensagem ainda não encontrado no DOM');
          return false;
        }
        
        // ✅ Verificar se o elemento está visível
        const rect = previewElement.getBoundingClientRect();
        const isElementVisible = rect.width > 0 && rect.height > 0 && 
                                rect.top < window.innerHeight && 
                                rect.bottom > 0;
        
        if (!isElementVisible) {
          console.log('⏳ [useEffect] Elemento da mensagem encontrado mas não está visível');
          return false;
        }
        
        // ✅ PROCURAR ESPECIFICAMENTE PELO BOTÃO "Ver Preview do Site"
        // Este botão é o indicador mais confiável de que o preview está completamente renderizado
        const previewButton = Array.from(previewElement.querySelectorAll('button')).find(btn => {
          const buttonText = btn.textContent || btn.innerText || '';
          return buttonText.includes('Ver Preview') || buttonText.includes('Preview do Site');
        });
        
        if (previewButton) {
          // ✅ Verificar se o botão está visível e tem dimensões válidas
          const buttonRect = previewButton.getBoundingClientRect();
          const isButtonVisible = buttonRect.width > 0 && buttonRect.height > 0 &&
                                 buttonRect.top < window.innerHeight &&
                                 buttonRect.bottom > 0;
          
          if (isButtonVisible) {
            console.log('✅ [useEffect] Botão do preview encontrado e visível - LIMPANDO TIMER AGORA!', {
              buttonText: previewButton.textContent?.substring(0, 50),
              buttonRect: {
                width: buttonRect.width,
                height: buttonRect.height,
                top: buttonRect.top,
                bottom: buttonRect.bottom
              }
            });
            
            // ✅ LIMPAR TIMER IMEDIATAMENTE - preview está pronto!
            setGenerationStartTime(null);
            setElapsedTime(0);
            setIsGenerating(false);
            
            // ✅ Limpar intervalo se existir
            if (previewCheckIntervalRef.current) {
              clearInterval(previewCheckIntervalRef.current);
              previewCheckIntervalRef.current = null;
            }
            return true; // ✅ Preview encontrado e pronto
          } else {
            console.log('⏳ [useEffect] Botão encontrado mas ainda não está visível');
          }
        } else {
          console.log('⏳ [useEffect] Botão do preview ainda não encontrado no DOM');
        }
        
        return false; // ✅ Preview não encontrado ainda
      };
      
      // ✅ Aguardar um pouco para o React renderizar e verificar imediatamente
      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      let animationFrameId: number | null = null;
      let secondFrameId: number | null = null;
      
      animationFrameId = requestAnimationFrame(() => {
        // ✅ Aguardar mais um frame para garantir renderização completa
        secondFrameId = requestAnimationFrame(() => {
          if (checkPreview()) {
            return; // ✅ Preview já encontrado, não precisa de retry
          }
          
          // ✅ Se não encontrou, verificar novamente a cada 200ms (mais rápido)
          // Mas limitar a 25 tentativas (5 segundos máximo)
          let retryCount = 0;
          const maxRetries = 25;
          
          previewCheckIntervalRef.current = setInterval(() => {
            retryCount++;
            
            if (checkPreview()) {
              return; // ✅ Preview encontrado
            }
            
            if (retryCount >= maxRetries) {
              console.log('⚠️ [useEffect] Timeout após 5 segundos - limpando timer de segurança');
              setGenerationStartTime(null);
              setElapsedTime(0);
              setIsGenerating(false);
              
              if (previewCheckIntervalRef.current) {
                clearInterval(previewCheckIntervalRef.current);
                previewCheckIntervalRef.current = null;
              }
            }
          }, 200); // ✅ Verificar a cada 200ms (mais responsivo)
        });
      });
      
      // ✅ Cleanup: limpar tanto o requestAnimationFrame quanto o setInterval se existir
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        if (secondFrameId !== null) {
          cancelAnimationFrame(secondFrameId);
        }
        if (previewCheckIntervalRef.current) {
          clearInterval(previewCheckIntervalRef.current);
          previewCheckIntervalRef.current = null;
        }
      };
    }
  }, [messages, isGenerating, generationStartTime]);

  // ✅ Calcular se deve mostrar o timer de geração
  // ✅ Timer só desaparece quando generationStartTime for null (limpo explicitamente)
  // NÃO depende de isLoading - isso é setado como false no finally antes do preview aparecer
  // NÃO desaparece quando currentSiteCode é definido - isso acontece antes do preview ser renderizado
  // ✅ REGRA SIMPLES: Se generationStartTime não é null E isGenerating é true, mostrar timer
  // A verificação de visibilidade do preview acontece no useEffect acima
  const shouldShowGenerationTimer = isGenerating && generationStartTime !== null;

  // ✅ Carregar mensagens existentes do banco de dados
  const loadExistingMessages = async (): Promise<{ hasMessages: boolean; formattedMessages: Message[] }> => {
    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`);
      const data = await response.json();
      
      console.log('📥 [loadExistingMessages] Resposta da API:', {
        success: data.success,
        messagesCount: data.messages?.length || 0,
        hasProjectData: !!data.projectData
      });
      
      if (data.success && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        // Converter mensagens do banco para o formato da página
        const formattedMessages: Message[] = data.messages.map((msg: {
          id: string;
          sender_type: 'user' | 'ai';
          content: string;
          message_type?: string;
          metadata?: Record<string, unknown> | string;
          created_at: string;
        }) => {
          // ✅ Parsear metadados se vierem como string JSON
          let parsedMetadata: Record<string, unknown> = {};
          if (msg.metadata) {
            if (typeof msg.metadata === 'string') {
              try {
                parsedMetadata = JSON.parse(msg.metadata);
              } catch (e) {
                console.warn('⚠️ [loadExistingMessages] Erro ao parsear metadados como JSON:', e);
                parsedMetadata = {};
              }
            } else {
              parsedMetadata = msg.metadata as Record<string, unknown>;
            }
          }
          
          return {
            id: msg.id,
            sender: msg.sender_type,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            type: (msg.message_type as 'text' | 'image' | 'site_preview') || 'text',
            // ✅ Garantir que metadados estão incluídos (incluindo showCreateButton)
            metadata: parsedMetadata,
            siteCodeId: parsedMetadata?.siteCodeId as string | undefined
          };
        });
        
        console.log('📨 [loadExistingMessages] Mensagens formatadas:', formattedMessages.map(m => ({
          sender: m.sender,
          type: m.type,
          hasPreview: !!m.siteCodeId,
          previewContent: m.content.includes('gerado com sucesso'),
          hasMetadata: !!m.metadata,
          metadataType: typeof m.metadata,
          metadataRaw: m.metadata,
          showCreateButton: m.metadata?.showCreateButton,
          hasCompleteProjectData: m.metadata?.hasCompleteProjectData,
          userConfirmed: m.metadata?.userConfirmed
        })));
        
        // ✅ Log detalhado da primeira mensagem da IA para debug
        const firstAIMessage = formattedMessages.find(m => m.sender === 'ai');
        if (firstAIMessage) {
          console.log('🔍 [loadExistingMessages] Primeira mensagem da IA (detalhada):', {
            id: firstAIMessage.id,
            content: firstAIMessage.content.substring(0, 100),
            metadata: firstAIMessage.metadata,
            metadataKeys: firstAIMessage.metadata ? Object.keys(firstAIMessage.metadata) : [],
            showCreateButton: firstAIMessage.metadata?.showCreateButton,
            showCreateButtonType: typeof firstAIMessage.metadata?.showCreateButton
          });
        }
        
        setMessages(formattedMessages);
        
        // ✅ Verificar se há um site gerado e definir currentSiteCode
        // Primeiro tentar encontrar nas mensagens
        const previewMessage = formattedMessages.find((msg: Message) => 
          msg.type === 'site_preview' && msg.siteCodeId
        );
        
        if (previewMessage && previewMessage.siteCodeId) {
          console.log('✅ [loadExistingMessages] Site encontrado nas mensagens:', previewMessage.siteCodeId);
          setCurrentSiteCode(previewMessage.siteCodeId);
        } 
        // Se não encontrou nas mensagens, verificar nos dados do projeto
        else if (data.projectData) {
          // Verificar se há versões do site geradas
          try {
            const { DatabaseService } = await import('@/lib/supabase');
            const versions = await DatabaseService.getSiteVersions(conversationId);
            if (versions && versions.length > 0) {
              // Usar o conversationId como siteCodeId (padrão do sistema)
              console.log('✅ [loadExistingMessages] Site encontrado nas versões:', conversationId);
              setCurrentSiteCode(conversationId);
            }
          } catch (versionError: any) {
            // ✅ Tratar erro de Supabase não configurado (variáveis de ambiente não disponíveis)
            const errorMessage = versionError?.message || String(versionError);
            if (errorMessage.includes('supabaseUrl is required') || errorMessage.includes('supabaseAnonKey is required')) {
              console.warn('⚠️ [loadExistingMessages] Supabase não configurado no cliente - ignorando busca de versões');
            } else {
              console.warn('⚠️ [loadExistingMessages] Erro ao buscar versões:', versionError);
            }
            // Se houver current_site_code ou preview_url nos dados do projeto, usar
            if (data.projectData.current_site_code) {
              console.log('✅ [loadExistingMessages] Site encontrado em projectData.current_site_code');
              setCurrentSiteCode(data.projectData.current_site_code);
            } else if (data.projectData.preview_url) {
              // Extrair conversationId do preview_url se possível
              const urlMatch = data.projectData.preview_url.match(/\/preview\/([^\/]+)/);
              if (urlMatch && urlMatch[1]) {
                console.log('✅ [loadExistingMessages] Site encontrado em projectData.preview_url');
                setCurrentSiteCode(urlMatch[1]);
              } else {
                console.log('✅ [loadExistingMessages] Usando conversationId como fallback');
                setCurrentSiteCode(conversationId);
              }
            }
          }
        }
        
        console.log(`✅ Carregadas ${formattedMessages.length} mensagem(ns) existente(s)`);
        return { hasMessages: true, formattedMessages }; // Indica que havia mensagens
      }
      console.log('📭 [loadExistingMessages] Nenhuma mensagem encontrada');
      return { hasMessages: false, formattedMessages: [] }; // Não havia mensagens
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      return { hasMessages: false, formattedMessages: [] };
    }
  };

  useEffect(() => {
    // ✅ Aguardar um pouco para garantir que initialData foi atualizado
    const timer = setTimeout(() => {
      // ✅ Primeiro tentar carregar mensagens existentes
      if (conversationId && messages.length === 0 && !conversationInitialized) {
        console.log('🚀 [Chat] Inicializando página de chat...');
        console.log('📋 [Chat] ConversationId:', conversationId);
        console.log('💡 [Chat] Prompt inicial:', initialData.additionalPrompt);
        console.log('🏢 [Chat] Empresa:', initialData.companyName);
        console.log('📂 [Chat] Setor:', initialData.businessSector);
        console.log('📊 [Chat] InitialData completo:', initialData);
        
        setConversationInitialized(true);
        loadExistingMessages().then(({ hasMessages, formattedMessages }) => {
          console.log('📨 [Chat] Mensagens existentes:', hasMessages ? 'Sim' : 'Não');
          console.log('📨 [Chat] Total de mensagens carregadas:', formattedMessages.length);
          
          // ✅ Verificar se já existe um site gerado usando as mensagens carregadas
          const hasSitePreview = formattedMessages.some((msg: Message) => 
            msg.type === 'site_preview' || 
            msg.content.includes('gerado com sucesso') ||
            msg.metadata?.siteCodeId
          );
          
          console.log('🔍 [Chat] Site já gerado?', hasSitePreview);
          console.log('🔍 [Chat] Mensagens carregadas:', formattedMessages.length);
          
          // ✅ Se tem mensagens existentes (vindo do painel do cliente), apenas exibir
          if (hasMessages) {
            console.log('✅ [Chat] Histórico completo carregado do banco de dados');
            // Não precisa fazer mais nada, as mensagens já foram carregadas
            // e o currentSiteCode já foi definido em loadExistingMessages
            return;
          }
          
          // ✅ Se não tinha mensagens e tem prompt inicial, inicializar do zero
          if (!hasMessages && initialData.additionalPrompt && !generationLockRef.current) {
            console.log('✅ [Chat] Nenhuma mensagem encontrada. Iniciando geração do site...');
            generationLockRef.current = true;
            initializeConversation().finally(() => {
              generationLockRef.current = false;
            });
          } 
          // ✅ Se não tem mensagens nem prompt, mostrar mensagem informativa
          else if (!hasMessages && !initialData.additionalPrompt) {
            console.log('⚠️ [Chat] Nenhuma mensagem encontrada e sem prompt inicial.');
            console.log('⚠️ [Chat] Aguardando interação do usuário...');
          }
        }).catch((error) => {
          console.error('❌ Erro ao carregar mensagens:', error);
          // Em caso de erro, tentar inicializar se tiver prompt
          if (initialData.additionalPrompt && !generationLockRef.current) {
            console.log('✅ [Chat] Tentando inicializar após erro...');
            generationLockRef.current = true;
            initializeConversation().finally(() => {
              generationLockRef.current = false;
            });
          }
        });
      }
    }, 100); // Pequeno delay para garantir que initialData foi atualizado
    
    return () => clearTimeout(timer);
  }, [conversationId, conversationInitialized, initialData.additionalPrompt]);

  useEffect(() => {
    if (conversationId) {
      checkLimits();
    }
  }, [conversationId, currentSiteCode]);

  // ✅ Page Visibility API - Detectar quando usuário sai/volta da tela (iPhone/iOS)
  // ✅ SOLUÇÃO ROBUSTA: Polling quando volta ao foco para recuperar geração interrompida
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    let checkTimeout: NodeJS.Timeout | null = null;

    const checkGenerationStatus = async () => {
      try {
        console.log('🔍 [PageVisibility] Verificando status de geração...');
        const response = await fetch(`/api/generation-status?conversationId=${conversationId}`);
        const data = await response.json();

        console.log('📊 [PageVisibility] Status:', data);

        // Se geração completou enquanto estava em background
        if (data.hasCompleted && data.latestVersion && !currentSiteCode) {
          console.log('✅ [PageVisibility] Geração completou enquanto estava em background! Recuperando...');
          
          // Buscar código do site
          const previewResponse = await fetch(`/api/preview-html/${conversationId}`);
          if (previewResponse.ok) {
            const previewData = await previewResponse.json();
            if (previewData.html) {
              // Atualizar estado como se tivesse completado normalmente
              setCurrentSiteCode(conversationId);
              setIsGenerating(false);
              setIsLoading(false);
              generationLockRef.current = false;
              generationStateRef.current = null;

              // Adicionar mensagem de sucesso
              const successMessage: Message = {
                id: crypto.randomUUID(),
                sender: 'ai',
                content: `🎉 **Seu site foi gerado com sucesso pela WZ Solutions IA!**

Criei um site profissional e responsivo baseado nas suas especificações.

✅ **Empresa:** ${initialData.companyName}
✅ **Setor:** ${initialData.businessSector}
📝 **Seu prompt:** ${initialData.additionalPrompt.length > 500 
  ? `${initialData.additionalPrompt.substring(0, 500)}...` 
  : initialData.additionalPrompt}

**👆 Veja o preview abaixo!** 

Você tem ${PROJECT_LIMITS.MODIFICATIONS} modificações gratuitas disponíveis. Quer fazer alguma modificação? É só me dizer! 🚀`,
                timestamp: new Date(),
                type: 'site_preview',
                siteCodeId: conversationId,
                metadata: { showEndButton: true }
              };

              setMessages(prev => {
                // Evitar duplicatas
                const alreadyExists = prev.some(m => 
                  m.type === 'site_preview' && m.siteCodeId === conversationId
                );
                if (alreadyExists) return prev;
                return [...prev, successMessage];
              });

              console.log('✅ [PageVisibility] Geração recuperada com sucesso!');
              return true; // Sucesso - parar polling
            }
          }
        }

        // Se ainda está gerando, continuar verificando
        if (data.isGenerating || data.recentlyCompleted) {
          console.log('⏳ [PageVisibility] Geração ainda em andamento ou acabou de completar...');
          return false; // Continuar polling
        }

        return false;
      } catch (error) {
        console.error('❌ [PageVisibility] Erro ao verificar status:', error);
        return false;
      }
    };

    const handleVisibilityChange = async () => {
      const isVisible = !document.hidden;
      isPageVisibleRef.current = isVisible;
      
      console.log('👁️ [PageVisibility] Mudança de visibilidade:', {
        isVisible,
        isGenerating,
        hasGenerationState: !!generationStateRef.current,
        currentSiteCode: !!currentSiteCode
      });
      
      // ✅ Se página voltou a ficar visível e havia geração em andamento
      if (isVisible && (isGenerating || generationStateRef.current) && !currentSiteCode) {
        console.log('🔄 [PageVisibility] Página voltou a ficar visível durante geração. Iniciando polling...');
        
        // Verificar imediatamente
        const completed = await checkGenerationStatus();
        
        if (!completed) {
          // Se não completou, fazer polling a cada 2 segundos (máximo 30 segundos = 15 tentativas)
          let attempts = 0;
          const maxAttempts = 15;
          
          pollingInterval = setInterval(async () => {
            attempts++;
            console.log(`🔄 [PageVisibility] Polling tentativa ${attempts}/${maxAttempts}...`);
            
            const completed = await checkGenerationStatus();
            
            if (completed || attempts >= maxAttempts) {
              if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
              }
              if (attempts >= maxAttempts) {
                console.warn('⚠️ [PageVisibility] Polling esgotado. Geração pode ter falhado ou ainda está em andamento.');
                // Resetar estado para permitir nova tentativa
                setIsGenerating(false);
                setIsLoading(false);
                generationLockRef.current = false;
              }
            }
          }, 2000); // Polling a cada 2 segundos
        }
      }
      
      // ✅ Se página ficou invisível durante geração, salvar estado
      if (!isVisible && isGenerating && !generationStateRef.current && !currentSiteCode) {
        generationStateRef.current = {
          conversationId,
          prompt: initialData.additionalPrompt || 'Geração em andamento...'
        };
        console.log('💾 [PageVisibility] Estado de geração salvo (página em background)');
      }

      // ✅ Parar polling se página ficou invisível novamente
      if (!isVisible && pollingInterval) {
        console.log('⏸️ [PageVisibility] Parando polling (página em background)');
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // ✅ Verificar estado inicial quando componente monta
    if (!document.hidden && (isGenerating || generationStateRef.current) && !currentSiteCode) {
      console.log('🔍 [PageVisibility] Verificando status inicial...');
      checkTimeout = setTimeout(() => {
        checkGenerationStatus();
      }, 1000);
    }
    
    // ✅ Verificar estado inicial
    isPageVisibleRef.current = !document.hidden;
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [conversationId, isGenerating, currentSiteCode, initialData]);
  
  // ✅ Limpar estado de geração quando completar
  useEffect(() => {
    if (!isGenerating && generationStateRef.current && currentSiteCode) {
      console.log('✅ [PageVisibility] Geração completada, limpando estado persistido');
      generationStateRef.current = null;
    }
  }, [isGenerating, currentSiteCode]);

  const checkLimits = async () => {
    try {
      const limits = await canMakeModification(conversationId);
      setProjectId(limits.projectId);
      setModificationsUsed(limits.modificationsUsed);
      setIsBlocked(!limits.allowed);
      
      // Mostrar mensagem de ID de projeto quando site for gerado
      if (limits.projectId && currentSiteCode && messages.length > 0) {
        const hasIdMessage = messages.some(msg => msg.content.includes('ID de Projeto'));
        if (!hasIdMessage) {
          const idMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: `🎯 **Seu ID de Projeto:** \`${limits.projectId}\`

📝 **Modificações utilizadas:** ${limits.modificationsUsed}/${PROJECT_LIMITS.MODIFICATIONS}

Guarde este número! Você precisará dele caso queira adquirir seu site completo ou solicitar mais modificações.`,
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, idMessage]);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar limites:', error);
    }
  };

  const getBlockedMessage = (projectId: number, modificationsUsed: number, endedManually: boolean = false): string => {
    const whatsappUrl = getWhatsAppUrl(projectId);
    
    if (endedManually) {
      return `✅ **Modificações Encerradas**

Você optou por encerrar as modificações gratuitas.

Clique no link abaixo para entrar em contato com a equipe WZ:

🔢 **Seu ID de Projeto:** \`${projectId}\`

[Contatar Equipe WZ Solution](${whatsappUrl})

**Serviços disponíveis:**
• Mais modificações personalizadas
• Receber seu código
• Publicar seu site`;
    }
    
    return `🚫 **Suas Modificações Gratuitas Encerraram**

Você utilizou todas as ${PROJECT_LIMITS.MODIFICATIONS} modificações gratuitas do seu projeto.

📊 **Resumo:**
• Prompt inicial: ✅ Usado
• Modificações: ${modificationsUsed}/${PROJECT_LIMITS.MODIFICATIONS} utilizadas

Clique no link abaixo para:

🔢 **Seu ID de Projeto:** \`${projectId}\`

[Contatar Equipe WZ Solution](${whatsappUrl})

**Serviços disponíveis:**
• Mais modificações personalizadas
• Receber seu código
• Publicar seu site`;
  };

  const initializeConversation = async () => {
    try {
      console.log('🔄 [initializeConversation] Iniciando...');
      console.log('📝 [initializeConversation] Prompt:', initialData.additionalPrompt);
      console.log('📊 [initializeConversation] Mensagens atuais:', messages.length);
      
      // ✅ Só inicializar se não houver mensagens e tiver prompt inicial
      if (initialData.additionalPrompt && messages.length === 0) {
        console.log('📝 [initializeConversation] Iniciando conversa com prompt inicial...');
        
        // ✅ FLUXO CORRETO: Chamar API /api/chat POST para que a IA pergunte informações primeiro
        // A IA vai perguntar nome, componentes, etc, e só depois gerar o preview
        try {
          setIsLoading(true);
          
          // Criar mensagem do usuário localmente primeiro
          const userMessageText = `Quero criar: ${initialData.additionalPrompt}`;
          const localUserMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'user',
            content: userMessageText,
            timestamp: new Date(),
            type: 'text'
          };
          
          setMessages(prev => [...prev, localUserMessage]);
          
          // ✅ Obter usuário logado para associar à conversa
          const { getCurrentUser } = await import('@/lib/auth');
          const currentUser = await getCurrentUser();
          
          // ✅ Chamar API /api/chat POST para que a IA responda perguntando informações
          console.log('📨 [initializeConversation] Enviando mensagem para IA...');
          const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              message: userMessageText,
              stage: 1,
              userId: currentUser?.id || null, // ✅ Enviar userId no body
              formData: {
                companyName: initialData.companyName,
                businessSector: initialData.businessSector,
                additionalPrompt: initialData.additionalPrompt
              }
            })
          });
          
          const chatData = await chatResponse.json();
          
          console.log('📥 [initializeConversation] Resposta da API:', {
            success: chatData.success,
            shouldGeneratePreview: chatData.shouldGeneratePreview,
            hasCompleteData: chatData.hasCompleteData,
            responseLength: chatData.response?.length || 0,
            responsePreview: chatData.response?.substring(0, 100) || ''
          });
          
          if (chatData.success && chatData.response) {
            // ✅ Verificar duplicatas antes de adicionar
            setMessages(prev => {
              const responseContent = chatData.response?.trim() || '';
              const recentMessages = prev.slice(-5);
              const isDuplicate = recentMessages.some(m => 
                m.sender === 'ai' && 
                m.type === 'text' &&
                m.content?.trim() === responseContent
              );
              
              if (isDuplicate) {
                console.log('⚠️ [initializeConversation] Mensagem duplicada detectada, não adicionando');
                return prev;
              }
              
              // Adicionar resposta da IA
              const aiMessage: Message = {
                id: crypto.randomUUID(),
                sender: 'ai',
                content: chatData.response,
                timestamp: new Date(),
                type: 'text',
                // ✅ Incluir metadados para mostrar botão "Pode criar" se necessário
                metadata: chatData.metadata || {}
              };
              
              return [...prev, aiMessage];
            });
            
            // ✅ Se a IA indicar que deve gerar preview (shouldGeneratePreview), gerar agora
            // ✅ TAMBÉM verificar se a mensagem indica que vai gerar (fallback para casos onde a flag não vem)
            const responseIndicatesGeneration = chatData.response && (
              chatData.response.includes('Gerando seu site') ||
              chatData.response.includes('STATUS: Gerando') ||
              chatData.response.includes('criando um site') ||
              chatData.response.includes('preparo seu site') ||
              chatData.response.includes('Vou gerar seu site') ||
              chatData.response.includes('vou gerar') ||
              chatData.response.includes('gerando agora') ||
              chatData.response.includes('pronto em instantes') ||
              chatData.response.includes('visualizar o preview') ||
              chatData.response.includes('exibir o site') ||
              chatData.response.toLowerCase().includes('vou criar') ||
              chatData.response.toLowerCase().includes('estou criando')
            );
            
            const shouldGenerate = chatData.shouldGeneratePreview === true || responseIndicatesGeneration;
            
            console.log('🔍 [initializeConversation] Análise de geração:', {
              shouldGeneratePreviewFlag: chatData.shouldGeneratePreview,
              responseIndicatesGeneration,
              shouldGenerate,
              responseSnippet: chatData.response?.substring(0, 200)
            });
            
            if (shouldGenerate) {
              console.log('✅ [initializeConversation] IA indicou que deve gerar preview agora!');
              console.log('📊 [initializeConversation] shouldGeneratePreview flag:', chatData.shouldGeneratePreview);
              console.log('📊 [initializeConversation] responseIndicatesGeneration:', responseIndicatesGeneration);
              console.log('⏳ [initializeConversation] Aguardando 500ms antes de iniciar geração...');
              
              // ✅ Usar setTimeout com verificação adicional
              setTimeout(() => {
                console.log('🚀 [initializeConversation] Chamando generateSitePreview agora...');
                console.log('📝 [initializeConversation] Prompt:', initialData.additionalPrompt?.substring(0, 100));
                console.log('🔒 [initializeConversation] Estado atual - isGenerating:', isGenerating, 'generationLockRef:', generationLockRef.current);
                
                // ✅ Verificar novamente se não está gerando antes de chamar
                if (!isGenerating && !generationLockRef.current) {
                  console.log('✅ [initializeConversation] Condições OK, iniciando geração...');
                  generateSitePreview(initialData.additionalPrompt || '').catch((error) => {
                    console.error('❌ [initializeConversation] Erro ao gerar preview:', error);
                    // ✅ Adicionar mensagem de erro para o usuário
                    const errorMessage: Message = {
                      id: crypto.randomUUID(),
                      sender: 'ai',
                      content: `⚠️ **Erro ao gerar site**

Ocorreu um erro ao iniciar a geração. Por favor, tente novamente ou digite "gerar" para tentar novamente.`,
                      timestamp: new Date(),
                      type: 'text'
                    };
                    setMessages(prev => [...prev, errorMessage]);
                  });
                } else {
                  console.warn('⚠️ [initializeConversation] Geração já em andamento, pulando chamada duplicada');
                }
              }, 500);
            } else {
              console.log('📝 [initializeConversation] IA vai fazer perguntas primeiro. Aguardando resposta do usuário...');
              console.log('📊 [initializeConversation] shouldGeneratePreview:', chatData.shouldGeneratePreview);
              console.log('📊 [initializeConversation] hasCompleteData:', chatData.hasCompleteData);
              console.log('📊 [initializeConversation] responseIndicatesGeneration:', responseIndicatesGeneration);
              
              // ✅ Se não tem dados completos mas a IA disse que vai gerar, informar o que falta
              if (!chatData.hasCompleteData && initialData.additionalPrompt && initialData.additionalPrompt.length > 100) {
                console.log('⚠️ [initializeConversation] Prompt completo mas dados insuficientes - verificando o que falta...');
                // A resposta da IA já deve ter informado o que falta, mas podemos verificar depois
              }
            }
          } else {
            console.error('❌ [initializeConversation] Erro na resposta da IA:', chatData);
          }
          
          // ✅ Desativar estado de inicialização após receber resposta
          setIsInitializing(false);
          setIsLoading(false);
        } catch (error) {
          console.error('❌ [initializeConversation] Erro ao inicializar conversa:', error);
          setIsInitializing(false);
          setIsLoading(false);
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: 'Desculpe, ocorreu um erro ao iniciar a conversa. Por favor, tente novamente.',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('⚠️ [initializeConversation] Condições não atendidas:', {
          hasPrompt: !!initialData.additionalPrompt,
          messagesCount: messages.length
        });
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
    }
  };

  // ✅ Função para copiar ID da conversa
  const copyConversationId = async () => {
    try {
      await navigator.clipboard.writeText(conversationId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar ID:', error);
    }
  };

  // ✅ Função para cancelar todas as requisições em andamento
  const cancelAllRequests = () => {
    const count = abortControllersRef.current.length;
    console.log(`🛑 Cancelando ${count} requisição(ões) em andamento...`);
    
    // Cancelar todos os controllers
    abortControllersRef.current.forEach((controller, index) => {
      try {
        controller.abort();
        console.log(`✅ Requisição ${index + 1} cancelada`);
      } catch (error) {
        console.error(`❌ Erro ao cancelar requisição ${index + 1}:`, error);
      }
    });
    
    // Limpar array de controllers
    abortControllersRef.current = [];
    setActiveRequestsCount(0);
    
    // Resetar estados
    setIsLoading(false);
    setIsGenerating(false);
    generationLockRef.current = false;
    
    // Adicionar mensagem informativa
    const cancelMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'ai',
      content: `🛑 **Todas as requisições foram canceladas**

Você pode iniciar uma nova geração ou modificação quando quiser.`,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, cancelMessage]);
  };

  const generateSitePreview = async (prompt: string) => {
    console.log('🎯 [generateSitePreview] ============================================');
    console.log('🎯 [generateSitePreview] FUNÇÃO CHAMADA!');
    console.log('🎯 [generateSitePreview] ============================================');
    
    const projectId = generateProjectId(conversationId);
    console.log('🎯 [generateSitePreview] Iniciando geração do site...');
    console.log('🆔 [generateSitePreview] IDs do projeto:', {
      projectId: projectId,
      conversationId: conversationId,
      previewUrl: `/preview/${conversationId}`,
      chatUrl: `/chat/${conversationId}`
    });
    console.log('📝 [generateSitePreview] Prompt recebido:', prompt?.substring(0, 100));
    console.log('🔒 [generateSitePreview] Estado ANTES da verificação:', {
      isGenerating,
      generationLockRef: generationLockRef.current,
      timestamp: new Date().toISOString()
    });
    
    // ✅ Proteção contra múltiplas chamadas simultâneas
    if (isGenerating || generationLockRef.current) {
      console.warn('⚠️ [generateSitePreview] ============================================');
      console.warn('⚠️ [generateSitePreview] BLOQUEADO: Geração já em andamento!');
      console.warn('⚠️ [generateSitePreview] ============================================');
      console.warn('⚠️ [generateSitePreview] Detalhes:', {
        isGenerating,
        generationLockRef: generationLockRef.current,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log('✅ [generateSitePreview] Estado verificado - pode prosseguir!');
    console.log('✅ [generateSitePreview] Definindo locks e iniciando processo...');
    
    // ✅ IMPORTANTE: Definir locks ANTES de qualquer outra coisa
    setIsGenerating(true);
    generationLockRef.current = true;
    setIsLoading(true); // ✅ Ativar loading ANTES de qualquer outra coisa
    setGenerationStartTime(new Date()); // ✅ Registrar tempo de início
    
    console.log('✅ [generateSitePreview] Locks definidos, processo iniciado:', {
      isGenerating: true,
      generationLockRef: true,
      timestamp: new Date().toISOString()
    });

    // ✅ Não criar mensagem de boas-vindas aqui - já foi criada em initializeConversation
    // Apenas garantir que o loading está visível
    console.log('📨 [generateSitePreview] Iniciando geração do site...');

    // ✅ Criar AbortController para esta requisição (fora do try para estar disponível no catch)
    const abortController = new AbortController();
    abortControllersRef.current.push(abortController);
    setActiveRequestsCount(abortControllersRef.current.length);

    try {
      // ✅ Obter usuário logado para associar à conversa
      const { getCurrentUser } = await import('@/lib/auth');
      const currentUser = await getCurrentUser();
      
      // ✅ NOVO: Buscar dados do projeto do banco ANTES de gerar
      // Isso garante que dados extraídos do prompt completo sejam usados
      console.log('🔍 [generateSitePreview] Buscando dados do projeto no banco...');
      let projectDataFromDB: any = null;
      try {
        const { DatabaseService } = await import('@/lib/supabase');
        projectDataFromDB = await DatabaseService.getProjectData(conversationId);
        console.log('✅ [generateSitePreview] Dados do projeto carregados:', {
          company_name: projectDataFromDB?.company_name,
          business_type: projectDataFromDB?.business_type,
          design_style: projectDataFromDB?.design_style,
          pages_needed: projectDataFromDB?.pages_needed,
          design_colors: projectDataFromDB?.design_colors,
          functionalities: projectDataFromDB?.functionalities
        });
      } catch (dbError) {
        console.warn('⚠️ [generateSitePreview] Erro ao buscar dados do banco (continuando):', dbError);
      }

      // ✅ Buscar histórico completo da conversa para incluir alterações
      let conversationHistory: any[] = [];
      try {
        const { DatabaseService } = await import('@/lib/supabase');
        conversationHistory = await DatabaseService.getMessages(conversationId);
        console.log('📚 [generateSitePreview] Histórico completo carregado do banco:', conversationHistory.length, 'mensagens');
      } catch (historyError) {
        console.warn('⚠️ [generateSitePreview] Erro ao buscar histórico do banco (usando mensagens locais):', historyError);
        // ✅ FALLBACK: Usar mensagens já carregadas no componente
        conversationHistory = messages.map(msg => ({
          sender_type: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
        }));
        console.log('📚 [generateSitePreview] Usando mensagens locais como histórico:', conversationHistory.length, 'mensagens');
      }

      // ✅ Construir prompt completo com TODOS os dados disponíveis + histórico da conversa
      // Prioridade: dados do banco > histórico da conversa > initialData > prompt simples
      const fullPrompt = buildCompletePrompt(
        prompt,
        projectDataFromDB,
        initialData,
        conversationHistory // ✅ Passar histórico completo incluindo alterações
      );

      console.log('🌐 [generateSitePreview] Fazendo requisição para /api/generate-ai-site...');
      console.log('📤 [generateSitePreview] Dados enviados:', {
        conversationId,
        prompt: fullPrompt.substring(0, 200) + '...',
        companyName: projectDataFromDB?.company_name || initialData.companyName,
        businessSector: projectDataFromDB?.business_type || projectDataFromDB?.business_sector || initialData.businessSector,
        designStyle: projectDataFromDB?.design_style,
        pagesNeeded: projectDataFromDB?.pages_needed,
        designColors: projectDataFromDB?.design_colors,
        functionalities: projectDataFromDB?.functionalities,
        userId: currentUser?.id || 'não logado'
      });

      // ✅ Salvar estado de geração antes de iniciar (para recuperação no iOS)
      generationStateRef.current = {
        conversationId,
        prompt: fullPrompt
      };
      
      const response = await fetch('/api/generate-ai-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          prompt: fullPrompt, // ✅ Usar prompt completo
          userId: currentUser?.id || null, // ✅ Enviar userId no body
          // ✅ Passar TODOS os dados extraídos para a API
          companyName: projectDataFromDB?.company_name || initialData.companyName,
          businessSector: projectDataFromDB?.business_type || projectDataFromDB?.business_sector || initialData.businessSector || 'Negócios',
          designStyle: projectDataFromDB?.design_style,
          pagesNeeded: projectDataFromDB?.pages_needed,
          designColors: projectDataFromDB?.design_colors,
          functionalities: projectDataFromDB?.functionalities,
          businessObjective: projectDataFromDB?.business_objective,
          targetAudience: projectDataFromDB?.target_audience,
          shortDescription: projectDataFromDB?.short_description,
          slogan: projectDataFromDB?.slogan,
          ctaText: projectDataFromDB?.cta_text,
          siteStructure: projectDataFromDB?.site_structure
        }),
        signal: abortController.signal, // ✅ Permitir cancelamento
        // ⚠️ iOS pode pausar requisições longas mesmo com keepalive
        // Solução: Polling via /api/generation-status quando volta ao foco
        keepalive: true // Ajuda, mas não garante 100% no iOS
      });
      
      console.log('📥 [generateSitePreview] Resposta recebida:', response.status, response.ok);

      // ✅ Remover controller da lista após completar
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== abortController);
      setActiveRequestsCount(abortControllersRef.current.length);

      console.log('📥 [generateSitePreview] Status da resposta:', response.status, response.ok);
      
      const data = await response.json();
      console.log('📥 [generateSitePreview] Dados da resposta:', data);

      if (response.ok && data.ok) {
        const projectIdAfterGen = generateProjectId(conversationId);
        console.log('✅ [generateSitePreview] Site gerado com sucesso!');
        console.log('🆔 [generateSitePreview] IDs após geração:', {
          projectId: projectIdAfterGen,
          conversationId: conversationId,
          versionId: data.versionId,
          previewId: data.previewId || conversationId,
          previewUrl: `/preview/${conversationId}`,
          chatUrl: `/chat/${conversationId}`
        });
        const previewId = data.previewId || conversationId || data.versionId || 'preview';
        
        const fullPrompt = initialData.additionalPrompt || prompt;
        const promptDisplay = fullPrompt.length > 500
          ? `${fullPrompt.substring(0, 500)}... (${fullPrompt.length - 500} caracteres restantes)`
          : fullPrompt;
        
        // ✅ Verificar se já existe mensagem de preview para evitar duplicatas
        // ✅ TAMBÉM verificar se já existe mensagem de confirmação duplicada
        setMessages(prev => {
          const hasPreview = prev.some(m => m.type === 'site_preview' && m.siteCodeId === (data.versionId || previewId));
          if (hasPreview) {
            console.log('⚠️ [generateSitePreview] Mensagem de preview já existe, não duplicando');
            // ✅ Limpar timer mesmo se já existe preview (para evitar timer infinito)
            setTimeout(() => {
              setGenerationStartTime(null);
              setElapsedTime(0);
              setIsGenerating(false); // ✅ Limpar isGenerating também
            }, 100);
            return prev;
          }
          
          // ✅ Remover APENAS mensagens que REALMENTE são de confirmação (mais específico)
          // Padrões mais específicos para evitar remover mensagens normais
          const confirmationPatterns = [
            /^vou criar/i, // Começa com "vou criar"
            /^estou criando/i, // Começa com "estou criando"
            /gerando (seu|o) (site|código)/i,
            /^confirmado!?$/i, // Apenas "confirmado" sozinho
            /^iniciando (a )?gera(ção|r)/i, // Começa com "iniciando geração"
            /^criando (seu|o) (site|código)/i,
            /^processando (seu|o) (site|código)/i,
            /em instantes (você|o) (verá|ver)/i,
            /aguarde (enquanto|que)/i,
            /^perfeito!?\s*(vou|estou|vamos|vamos criar|vou gerar|vou iniciar)/i, // "perfeito" seguido de ação de criação
            /^perfeito!?\s*🎉\s*(vou|estou|vamos)/i, // "perfeito 🎉" seguido de ação
            /^opa!?\s*🎉\s*\*\*confirmado/i, // "Opa! 🎉 **Confirmado"
            /^confirmado!?\s*\*\*/i, // "Confirmado! **"
          ];
          
          // ✅ Remover APENAS mensagens de confirmação recentes antes de adicionar preview
          let filteredPrev = prev.filter((m) => {
            // Verificar se é mensagem de confirmação duplicada (últimas 5 mensagens)
            const isRecent = prev.indexOf(m) >= prev.length - 5;
            if (isRecent && m.sender === 'ai' && m.type === 'text') {
              const content = m.content || '';
              // ✅ Verificar se a mensagem corresponde a um padrão de confirmação específico
              const isConfirmation = confirmationPatterns.some(pattern => pattern.test(content));
              if (isConfirmation) {
                console.log('🗑️ [generateSitePreview] Removendo mensagem de confirmação duplicada:', m.content.substring(0, 50));
                return false; // Remover mensagem de confirmação
              }
            }
            return true; // Manter outras mensagens
          });
          
          // ✅ Log se houve remoção
          if (filteredPrev.length < prev.length) {
            console.log(`⚠️ [generateSitePreview] Removidas ${prev.length - filteredPrev.length} mensagem(ns) de confirmação duplicada(s)`);
          }
          
          const previewMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: `🎉 **Seu site foi gerado com sucesso pela WZ Solutions IA!**

Criei um site profissional e responsivo baseado nas suas especificações.

✅ **Empresa:** ${initialData.companyName}
✅ **Setor:** ${initialData.businessSector}
📝 **Seu prompt:** ${promptDisplay}

**👆 Veja o preview abaixo!** 

Você tem ${PROJECT_LIMITS.MODIFICATIONS} modificações gratuitas disponíveis. Quer fazer alguma modificação? É só me dizer! 🚀`,
            timestamp: new Date(),
            type: 'site_preview',
            siteCodeId: data.versionId || previewId,
            metadata: { showEndButton: true } // ✅ Marcar para mostrar botão de encerrar
          };
          
          // ✅ ADICIONAR preview ao estado PRIMEIRO
          const newMessages = [...filteredPrev, previewMessage];
          
          // ✅ IMPORTANTE: Capturar timestamp do preview ANTES de adicionar ao estado
          const previewTimestamp = previewMessage.timestamp.getTime();
          
          // ✅ NÃO definir currentSiteCode ainda - aguardar preview ser renderizado
          // O timer continuará até que o preview esteja realmente visível
          
          // ✅ IMPORTANTE: NÃO definir currentSiteCode aqui - isso faz o timer desaparecer antes do preview
          // O timer só deve desaparecer quando generationStartTime for null (limpo explicitamente)
          
          // ✅ IMPORTANTE: NÃO limpar o timer aqui!
          // O timer será limpo pelo useEffect que monitora quando preview é adicionado ao estado
          // O useEffect verifica quando uma mensagem do tipo 'site_preview' aparece em messages
          
          // ✅ Definir currentSiteCode após preview ser adicionado ao estado (mas timer continua)
          setCurrentSiteCode(previewId);
          
          console.log('✅ [generateSitePreview] Preview adicionado ao estado - useEffect irá verificar visibilidade');
          
          return newMessages;
        });
      }
    } catch (error: any) {
      // ✅ Remover controller da lista mesmo em caso de erro
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== abortController);
      setActiveRequestsCount(abortControllersRef.current.length);
      
      // ✅ Se foi cancelado, não mostrar erro
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.log('ℹ️ Requisição cancelada pelo usuário');
        // ✅ Limpar timer em caso de cancelamento
        setGenerationStartTime(null);
        setElapsedTime(0);
        setIsGenerating(false); // ✅ Limpar isGenerating também
        return;
      }
      
      console.error('❌ Erro ao gerar preview:', error);
      
      // ✅ Limpar timer em caso de erro
      setGenerationStartTime(null);
      setElapsedTime(0);
      setIsGenerating(false); // ✅ Limpar isGenerating também
      
      // ✅ Tratar erro de rate limit especificamente
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMessage.includes('rate_limit') || 
                         errorMessage.includes('Rate limit');
      
      if (isRateLimit) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          sender: 'ai',
          content: `⏸️ **Limite de requisições atingido temporariamente**

O serviço de IA está processando muitas solicitações no momento. Por favor, aguarde alguns minutos e tente novamente.

⏰ **Aguarde alguns minutos antes de tentar novamente.**`,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      // ✅ NÃO definir setIsGenerating(false) aqui - deixar o timer controlar isso
      // O setIsGenerating(false) será chamado apenas quando o timer for limpo (após preview aparecer)
      // Isso garante que o timer continue visível até o preview ser renderizado
      generationLockRef.current = false; // ✅ Unlock após completar
      // ✅ NÃO limpar timer aqui - já foi limpo quando preview ficou pronto ou em caso de erro
      generationStateRef.current = null; // ✅ Limpar estado de geração após completar
    }
  };

  const modifySite = async (modification: string, imageData?: { imageUrl?: string; fileName?: string }) => {
    const projectId = generateProjectId(conversationId);
    console.log('🔧 [modifySite] Iniciando modificação...');
    console.log('🆔 [modifySite] IDs do projeto:', {
      projectId: projectId,
      conversationId: conversationId,
      previewUrl: `/preview/${conversationId}`,
      chatUrl: `/chat/${conversationId}`
    });
    
    if (!currentSiteCode) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `⚠️ **Nenhum site gerado ainda**

Digite seu prompt primeiro para gerar o site.`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const limits = await canMakeModification(conversationId);
    console.log('📊 [modifySite] Limites antes da modificação:', {
      projectId: projectId,
      modificationsUsed: limits.modificationsUsed,
      modificationsRemaining: limits.modificationsRemaining,
      allowed: limits.allowed
    });
    if (!limits.allowed) {
      setIsBlocked(true);
      setModificationsUsed(limits.modificationsUsed);
      setProjectId(limits.projectId);
      
      const blockedMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(limits.projectId, limits.modificationsUsed),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, blockedMessage]);
      return;
    }

    setIsLoading(true);

    // ✅ Criar AbortController para esta requisição (fora do try para estar disponível no catch)
    const abortController = new AbortController();
    abortControllersRef.current.push(abortController);
    setActiveRequestsCount(abortControllersRef.current.length);

    try {
      const response = await fetch('/api/modify-ai-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          modification,
          currentVersionId: currentSiteCode,
          imageData: imageData || null
        }),
        signal: abortController.signal // ✅ Permitir cancelamento
      });

      // ✅ Remover controller da lista após completar
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== abortController);
      setActiveRequestsCount(abortControllersRef.current.length);

      const data = await response.json();

      if (response.ok && data.ok) {
        // ✅ Atualizar currentSiteCode (mesmo que seja o mesmo ID, força re-render)
        if (!currentSiteCode && data.previewId) {
          setCurrentSiteCode(data.previewId);
        } else if (data.previewId) {
          // ✅ Sempre atualizar mesmo que seja o mesmo ID, para forçar re-render
          setCurrentSiteCode(data.previewId);
        }
        
        // ✅ CORRIGIDO: Usar versionNumber retornado pela API para contagem correta
        // A versão inicial é sempre 1, então modificações = versionNumber - 1
        // Se versionNumber = 1 (geração inicial) -> 0 modificações
        // Se versionNumber = 2 (1ª modificação) -> 1 modificação
        // Se versionNumber = 3 (2ª modificação) -> 2 modificações
        const expectedModifications = data.versionNumber && data.versionNumber > 1 
          ? data.versionNumber - 1  // Subtrair 1 porque versão 1 é a geração inicial
          : modificationsUsed + 1;   // Fallback: incrementar contador atual
        
        console.log('🔍 [modifySite] Usando versionNumber da API para contagem:', {
          versionNumber: data.versionNumber,
          expectedModifications,
          previousCount: modificationsUsed
        });
        
        // ✅ Primeiro: Tentar usar contagem baseada no versionNumber retornado
        // Isso é mais confiável que buscar do banco (evita problemas de cache/replicação)
        let updatedLimits = {
          modificationsUsed: expectedModifications,
          modificationsRemaining: Math.max(0, PROJECT_LIMITS.MODIFICATIONS - expectedModifications),
          allowed: expectedModifications < PROJECT_LIMITS.MODIFICATIONS,
          projectId: generateProjectId(conversationId)
        };
        
        // ✅ Verificar no banco para confirmar (com retry para replicação)
        const initialCount = modificationsUsed;
        let retries = 0;
        const maxRetries = 8; // Aumentar para 8 tentativas (até 8 segundos)
        
        console.log('🔍 [modifySite] Verificando contagem no banco para confirmar:', {
          expectedFromAPI: expectedModifications,
          previousCount: initialCount
        });
        
        // Buscar versões diretamente para debug
        let versions: any[] = [];
        let dbCount = 0;
        try {
          const { DatabaseService } = await import('@/lib/supabase');
          versions = await DatabaseService.getSiteVersions(conversationId);
          console.log('📊 [modifySite] Versões no banco (primeira verificação):', {
            total: versions?.length || 0,
            versions: versions?.map(v => ({ version: v.version_number, id: v.id?.substring(0, 8) }))
          });
          
          // ✅ CORRIGIDO: Contar modificações corretamente
          // Versão 1 = geração inicial (0 modificações)
          // Versão 2 = 1ª modificação (1 modificação)
          // Versão 3 = 2ª modificação (2 modificações)
          // Modificações = total de versões - 1 (subtrair a versão inicial)
          dbCount = versions && versions.length > 0 ? Math.max(0, versions.length - 1) : 0;
          
          console.log('🔍 [modifySite] Contagem detalhada:', {
            totalVersions: versions?.length || 0,
            dbCount,
            expectedModifications,
            versionNumbers: versions?.map(v => v.version_number)
          });
        } catch (versionError: any) {
          // ✅ Tratar erro de Supabase não configurado no cliente
          const errorMessage = versionError?.message || String(versionError);
          if (errorMessage.includes('supabaseUrl is required') || errorMessage.includes('supabaseAnonKey is required')) {
            console.warn('⚠️ [modifySite] Supabase não configurado no cliente - ignorando busca de versões para debug');
          } else {
            console.warn('⚠️ [modifySite] Erro ao buscar versões para debug:', versionError);
          }
          // ✅ Se deu erro, usar versões vazias e contagem 0 para continuar
          versions = [];
          dbCount = 0;
        }
        
        // ✅ Usar contagem do banco se for maior ou igual à esperada (pode ter havido atualização)
        // Mas garantir que não seja maior que o esperado + 1 (evitar contagem duplicada)
        if (dbCount >= expectedModifications && dbCount <= expectedModifications + 1) {
          updatedLimits.modificationsUsed = dbCount;
          updatedLimits.modificationsRemaining = Math.max(0, PROJECT_LIMITS.MODIFICATIONS - dbCount);
          updatedLimits.allowed = dbCount < PROJECT_LIMITS.MODIFICATIONS;
          console.log('✅ [modifySite] Usando contagem do banco (mais atualizada):', dbCount);
        } else if (dbCount > expectedModifications + 1) {
          console.warn('⚠️ [modifySite] Contagem do banco muito maior que esperada, usando esperada:', {
            dbCount,
            expectedModifications
          });
          // Manter expectedModifications se dbCount for muito maior (pode ser erro de contagem)
        }
        
        // ✅ Retry apenas se a contagem ainda não bateu (problema de replicação)
        while (retries < maxRetries) {
          const dbLimits = await canMakeModification(conversationId);
          
          // Se a contagem do banco bateu ou é maior que a esperada, usar ela
          if (dbLimits.modificationsUsed >= expectedModifications) {
            updatedLimits = dbLimits;
            console.log(`✅ [modifySite] Contagem confirmada no banco (tentativa ${retries + 1}):`, dbLimits.modificationsUsed);
            break;
          }
          
          console.log(`🔄 [modifySite] Aguardando replicação (tentativa ${retries + 1}/${maxRetries})...`);
          console.log(`📊 [modifySite] Contagem banco: ${dbLimits.modificationsUsed}, esperada: ${expectedModifications}`);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Debug: verificar versões novamente
          try {
            const { DatabaseService } = await import('@/lib/supabase');
            const versions = await DatabaseService.getSiteVersions(conversationId);
            console.log(`📊 [modifySite] Versões após tentativa ${retries + 1}:`, versions?.length || 0);
          } catch (err: any) {
            // ✅ Tratar erro de Supabase não configurado
            const errorMessage = err?.message || String(err);
            if (errorMessage.includes('supabaseUrl is required') || errorMessage.includes('supabaseAnonKey is required')) {
              console.warn('⚠️ [modifySite] Supabase não configurado no cliente - ignorando busca de versões');
            } else {
              // Ignorar outros erros de debug
            }
          }
          
          retries++;
        }
        
        // ✅ Se ainda não bateu após retries, usar a contagem baseada no versionNumber
        // Isso garante que sempre atualiza mesmo com problemas de replicação
        if (updatedLimits.modificationsUsed < expectedModifications) {
          console.warn('⚠️ [modifySite] Contagem do banco não atualizou, usando contagem baseada em versionNumber');
          updatedLimits = {
            modificationsUsed: expectedModifications,
            modificationsRemaining: Math.max(0, PROJECT_LIMITS.MODIFICATIONS - expectedModifications),
            allowed: expectedModifications < PROJECT_LIMITS.MODIFICATIONS,
            projectId: generateProjectId(conversationId)
          };
        }
        
        setModificationsUsed(updatedLimits.modificationsUsed);
        setProjectId(updatedLimits.projectId);
        
        console.log('✅ [modifySite] Limites atualizados:', {
          projectId: updatedLimits.projectId,
          conversationId: conversationId,
          modificationsUsed: updatedLimits.modificationsUsed,
          remaining: updatedLimits.modificationsRemaining,
          allowed: updatedLimits.allowed,
          retriesUsed: retries,
          versionNumber: data.versionNumber,
          previewUrl: `/preview/${conversationId}`,
          chatUrl: `/chat/${conversationId}`
        });
        
        if (!updatedLimits.allowed && !hasEndedManually) {
          setIsBlocked(true);
          
          const blockedMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: getBlockedMessage(updatedLimits.projectId, updatedLimits.modificationsUsed, false),
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, blockedMessage]);
        }
        
        const updateMessage: Message = {
          id: crypto.randomUUID(),
          sender: 'ai',
          content: `✅ **Modificação aplicada com sucesso!**

📝 **Modificações utilizadas:** ${updatedLimits.modificationsUsed}/${PROJECT_LIMITS.MODIFICATIONS}
${updatedLimits.modificationsRemaining > 0 ? `\n💡 Você ainda tem ${updatedLimits.modificationsRemaining} modificação${updatedLimits.modificationsRemaining > 1 ? 'ões' : ''} gratuita${updatedLimits.modificationsRemaining > 1 ? 's' : ''}!` : ''}

"${modification}"

**👆 Veja as alterações no preview abaixo!**

Gostou do resultado? Você pode pedir mais modificações a qualquer momento! 🎨`,
          timestamp: new Date(),
          type: 'site_preview',
          siteCodeId: data.previewId || currentSiteCode,
          metadata: { 
            showEndButton: true,
            versionNumber: data.versionNumber,
            previewTimestamp: data.previewTimestamp || Date.now()
          }
        };

        setMessages(prev => [...prev, updateMessage]);
        
        // ✅ Disparar evento de atualização com detalhes completos
        window.dispatchEvent(new CustomEvent('preview-update', { 
          detail: { 
            siteId: data.previewId || currentSiteCode,
            versionNumber: data.versionNumber,
            timestamp: data.previewTimestamp || Date.now()
          } 
        }));
        
        // ✅ Forçar atualização do preview após um pequeno delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('preview-update', { 
            detail: { 
              siteId: data.previewId || currentSiteCode,
              versionNumber: data.versionNumber,
              timestamp: Date.now(),
              force: true
            } 
          }));
        }, 1000);
      } else {
        throw new Error(data.error || 'Erro ao modificar');
      }
    } catch (error: any) {
      // ✅ Remover controller da lista mesmo em caso de erro
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== abortController);
      setActiveRequestsCount(abortControllersRef.current.length);
      
      // ✅ Se foi cancelado, não mostrar erro
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.log('ℹ️ Requisição cancelada pelo usuário');
        setIsLoading(false);
        return;
      }
      
      console.error('❌ Erro ao modificar site:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `⚠️ **Erro ao processar modificação**

${error.message || 'Erro desconhecido'}

Tente ser mais específico. Por exemplo:
- "Adicionar botão do WhatsApp"
- "Mudar cor de fundo para azul"`,
        timestamp: new Date(),
        type: 'text',
        metadata: { showEndButton: true } // ✅ Mostrar botão mesmo em caso de erro
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    // ✅ Bloquear upload de imagem quando chat está desativado
    if (isBlocked || hasEndedManually) {
      const blockedMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(projectId || generateProjectId(conversationId), modificationsUsed, hasEndedManually),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, blockedMsg]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPendingImage({ file, imageUrl });
        setImagePrompt('');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erro ao processar a imagem:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: '❌ Erro ao processar a imagem. Por favor, tente novamente.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const sendImageWithPrompt = async () => {
    if (!pendingImage) return;
    
    const promptToSend = imagePrompt.trim() || 'Adicione esta imagem ao site';
    
    // ✅ Bloquear envio de imagem quando chat está desativado (bloqueado ou encerrado manualmente)
    if (isBlocked || hasEndedManually) {
      const blockedMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(projectId || generateProjectId(conversationId), modificationsUsed, hasEndedManually),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, blockedMsg]);
      setPendingImage(null);
      setImagePrompt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    if (currentSiteCode) {
      const limits = await canMakeModification(conversationId);
      if (!limits.allowed) {
        setIsBlocked(true);
        setModificationsUsed(limits.modificationsUsed);
        setProjectId(limits.projectId);
        
        const blockedMsg: Message = {
          id: crypto.randomUUID(),
          sender: 'ai',
          content: getBlockedMessage(limits.projectId, limits.modificationsUsed),
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, blockedMsg]);
        setPendingImage(null);
        setImagePrompt('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }
    
    const moderation = moderateMessage(promptToSend);
    
    if (!moderation.allowed) {
      const warningMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `⚠️ **${moderation.reason || 'Prompt não permitido'}**

${getRedirectMessage(promptToSend)}

Por favor, descreva como quer usar a imagem no seu site de forma adequada.`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, warningMessage]);
      setPendingImage(null);
      setImagePrompt('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    const imageToSend = pendingImage;
    setPendingImage(null);
    setImagePrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsLoading(true);
    
    try {
      const imageMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        content: promptToSend,
        timestamp: new Date(),
        type: 'image',
        metadata: { 
          imageUrl: imageToSend.imageUrl, 
          fileName: imageToSend.file.name 
        }
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      if (currentSiteCode) {
        await modifySite(promptToSend, {
          imageUrl: imageToSend.imageUrl,
          fileName: imageToSend.file.name
        });
      } else {
        const aiResponse: Message = {
          id: crypto.randomUUID(),
          sender: 'ai',
          content: `✅ Recebi sua imagem e sua solicitação: "${promptToSend}"

Mas primeiro preciso gerar o site inicial. Por favor, descreva o que você quer criar!`,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: '❌ Erro ao processar imagem. Por favor, tente novamente.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelImageUpload = () => {
    setPendingImage(null);
    setImagePrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Função para encerrar modificações manualmente
  const endModifications = () => {
    console.log('🛑 [endModifications] Chamada - projectId:', projectId, 'modificationsUsed:', modificationsUsed);
    
    // Garantir que temos projectId
    let finalProjectId = projectId;
    if (!finalProjectId) {
      finalProjectId = generateProjectId(conversationId);
      setProjectId(finalProjectId);
      console.log('🛑 [endModifications] ProjectId gerado:', finalProjectId);
    }
    
    // Buscar limites atualizados se necessário
    canMakeModification(conversationId).then(limits => {
      const endMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(finalProjectId || limits.projectId, limits.modificationsUsed || modificationsUsed, true),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, endMessage]);
      console.log('✅ [endModifications] Mensagem de encerramento adicionada');
    }).catch(err => {
      console.error('❌ [endModifications] Erro ao buscar limites:', err);
      const endMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(finalProjectId || generateProjectId(conversationId), modificationsUsed, true),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, endMessage]);
    });
    
    setHasEndedManually(true);
    setIsBlocked(true);
    setInputMessage('');
    console.log('✅ [endModifications] Estado atualizado - hasEndedManually: true, isBlocked: true');
  };

  // ✅ Função para detectar se usuário quer encerrar modificações
  const shouldEndModifications = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    const endPhrases = [
      'não quero mais modificações',
      'não quero mais modificaçoes',
      'não quero mais modifica',
      'encerrar modificações',
      'encerrar modifica',
      'finalizar modificações',
      'finalizar modifica',
      'parar modificações',
      'parar modifica',
      'sem mais modificações',
      'sem mais modifica',
      'quero encerrar',
      'encerrar agora',
      'finalizar agora',
      'parar agora',
      'está bom assim',
      'já está bom',
      'está perfeito',
      'não preciso de mais modificações',
      'não preciso mais modificar',
      'não preciso mais',
      'finalizar',
      'encerrar',
      'concluir',
      'terminar',
      'basta',
      'chega',
      'não quero mais',
      'está pronto',
      'já está pronto',
      'pronto',
      'finalizado',
      'concluído'
    ];
    
    const hasEndPhrase = endPhrases.some(phrase => lowerMessage.includes(phrase));
    
    const endPatterns = [
      /^(encerrar|finalizar|parar|concluir|terminar)$/i,
      /^(não quero|chega|basta|pronto|finalizado|concluído)$/i,
      /está (bom|perfeito|pronto|ok)/i,
      /já está (bom|perfeito|pronto|ok)/i
    ];
    
    const matchesPattern = endPatterns.some(pattern => pattern.test(lowerMessage));
    
    return hasEndPhrase || matchesPattern;
  };

  const sendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend || isLoading) return;

    // ✅ Verificar se usuário quer encerrar modificações (DEVE SER PRIMEIRO)
    if (shouldEndModifications(messageToSend)) {
      console.log('🛑 [sendMessage] Usuário solicitou encerramento de modificações');
      endModifications();
      const userEndMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'user',
        content: messageToSend,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, userEndMessage]);
      return;
    }

    // ✅ BLOQUEIO TOTAL: Não permitir nenhuma mensagem quando chat está desativado
    if (isBlocked || hasEndedManually) {
      console.log('🚫 [sendMessage] Chat desativado - bloqueando envio. isBlocked:', isBlocked, 'hasEndedManually:', hasEndedManually);
      const blockedMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(projectId || generateProjectId(conversationId), modificationsUsed, hasEndedManually),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, blockedMsg]);
      setInputMessage('');
      setIsLoading(false); // ✅ Garantir que loading seja limpo
      return;
    }

    const moderation = moderateMessage(messageToSend);
    
    if (!moderation.allowed) {
      const warningMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `⚠️ **${moderation.reason || 'Mensagem não permitida'}**

${getRedirectMessage(messageToSend)}`,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, warningMessage]);
      setInputMessage('');
      return;
    }

    // ✅ PROTEGER CONTRA MÚLTIPLAS CHAMADAS SIMULTÂNEAS
    if (isLoading) {
      console.log('⚠️ [sendMessage] Já está processando uma mensagem, ignorando chamada duplicada');
      return;
    }

    console.log('📤 [sendMessage] ============================================');
    console.log('📤 [sendMessage] FUNÇÃO sendMessage CHAMADA!');
    console.log('📤 [sendMessage] ============================================');
    console.log('📤 [sendMessage] Parâmetros:', {
      messageToSend,
      conversationId,
      hasCurrentSiteCode: !!currentSiteCode,
      messagesCount: messages.length,
      isLoading
    });
    
    setIsLoading(true);
    setInputMessage('');

    const lastImageMessage = messages.slice().reverse().find(msg => msg.type === 'image' && msg.sender === 'user');
    const imageData = lastImageMessage?.metadata as { imageUrl?: string; fileName?: string } | undefined;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      content: messageToSend,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      if (currentSiteCode) {
        // ✅ Já tem site gerado - fazer modificação
        const limits = await canMakeModification(conversationId);
        if (!limits.allowed) {
          setIsBlocked(true);
          setModificationsUsed(limits.modificationsUsed);
          setProjectId(limits.projectId);
          
          const blockedMsg: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: getBlockedMessage(limits.projectId, limits.modificationsUsed),
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, blockedMsg]);
          setIsLoading(false);
          return;
        }
        
        await modifySite(messageToSend, imageData);
      } else {
        // ✅ Não tem site ainda - enviar para IA perguntar ou gerar preview
        console.log('📨 [sendMessage] ============================================');
        console.log('📨 [sendMessage] ENVIANDO MENSAGEM PARA IA');
        console.log('📨 [sendMessage] ============================================');
        console.log('📨 [sendMessage] Enviando mensagem para IA (sem site gerado ainda)...');
        console.log('📤 [sendMessage] Enviando requisição para /api/chat:', {
          conversationId,
          messageLength: messageToSend.length,
          messagePreview: messageToSend.substring(0, 50)
        });
        
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: messageToSend,
            stage: 1
          })
        });
        
        console.log('📥 [sendMessage] Resposta HTTP recebida:', {
          status: chatResponse.status,
          statusText: chatResponse.statusText,
          ok: chatResponse.ok,
          headers: Object.fromEntries(chatResponse.headers.entries())
        });
        
        if (!chatResponse.ok) {
          const errorText = await chatResponse.text();
          console.error('❌ [sendMessage] Erro na resposta HTTP:', {
            status: chatResponse.status,
            errorText: errorText.substring(0, 500)
          });
          throw new Error(`Erro HTTP ${chatResponse.status}: ${errorText.substring(0, 200)}`);
        }
        
        const chatData = await chatResponse.json();
        
        // ✅ ALERT TEMPORÁRIO PARA DEBUG - REMOVER DEPOIS
        if (typeof window !== 'undefined' && chatData.shouldGeneratePreview === true) {
          console.warn('🚨🚨🚨 DEBUG: shouldGeneratePreview é TRUE!');
        }
        
        console.log('📥 [sendMessage] ============================================');
        console.log('📥 [sendMessage] JSON PARSEADO - VERIFICAR AQUI!');
        console.log('📥 [sendMessage] ============================================');
        console.log('📥 [sendMessage] JSON parseado:', {
          success: chatData.success,
          hasResponse: !!chatData.response,
          shouldGeneratePreview: chatData.shouldGeneratePreview,
          shouldGeneratePreviewType: typeof chatData.shouldGeneratePreview,
          shouldGeneratePreviewRaw: chatData.shouldGeneratePreviewRaw,
          nextStage: chatData.nextStage,
          responseLength: chatData.response?.length,
          keys: Object.keys(chatData),
          FULL_OBJECT: JSON.stringify(chatData, null, 2).substring(0, 1000)
        });
        
        // ✅ VERIFICAÇÃO CRÍTICA: Se shouldGeneratePreview é true, FORÇAR GERAÇÃO MESMO SEM response
        if (chatData.shouldGeneratePreview === true || chatData.shouldGeneratePreviewRaw === true) {
          console.warn('🚨🚨🚨 [sendMessage] CRÍTICO: shouldGeneratePreview é TRUE! Forçando geração...');
          
          // ✅ Verificar se a resposta é uma mensagem de confirmação antes de adicionar
          const responseContent = chatData.response?.trim() || '';
          const isConfirmationMessage = responseContent.toLowerCase().includes('vou criar') || 
                                      responseContent.toLowerCase().includes('gerando') || 
                                      responseContent.toLowerCase().includes('confirmado') ||
                                      responseContent.toLowerCase().includes('iniciando') ||
                                      responseContent.toLowerCase().includes('perfeito') ||
                                      responseContent.toLowerCase().includes('em instantes') ||
                                      responseContent.toLowerCase().includes('aguarde') ||
                                      responseContent.toLowerCase().includes('opa');
          
          // ✅ NÃO adicionar mensagem de confirmação - será substituída pelo preview
          if (chatData.response && !isConfirmationMessage) {
            setMessages(prev => {
              // ✅ Verificar duplicatas antes de adicionar
              const recentMessages = prev.slice(-3);
              const isDuplicate = recentMessages.some(m => 
                m.sender === 'ai' && 
                m.type === 'text' &&
                m.content?.trim().toLowerCase() === responseContent.toLowerCase()
              );
              
              if (isDuplicate) {
                console.log('⚠️ [sendMessage] Mensagem duplicada detectada (forçado), não adicionando');
                return prev;
              }
              
              const aiMessage: Message = {
                id: crypto.randomUUID(),
                sender: 'ai',
                content: chatData.response,
                timestamp: new Date(),
                type: 'text',
                metadata: chatData.metadata || {}
              };
              return [...prev, aiMessage];
            });
          } else if (isConfirmationMessage) {
            console.log('⚠️ [sendMessage] Mensagem de confirmação detectada (forçado) - será substituída pelo preview');
          }
          
          // ✅ FORÇAR GERAÇÃO IMEDIATAMENTE
          console.log('🚀🚀🚀 [sendMessage] FORÇANDO GERAÇÃO - shouldGeneratePreview é TRUE!');
          
          const promptToUse = messageToSend || chatData.response || 'Gerar site';
          
            setTimeout(() => {
              console.log('⏳ [sendMessage] Chamando generateSitePreview FORÇADO...');
              // ✅ NÃO definir setIsLoading(false) aqui - generateSitePreview controla isso no finally
              generateSitePreview(promptToUse)
                .then(() => {
                  console.log('✅ [sendMessage] Geração FORÇADA concluída!');
                  // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                })
                .catch((error) => {
                  console.error('❌ [sendMessage] Erro na geração FORÇADA:', error);
                  // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                });
          }, 500);
          
          return;
        }
        
        if (chatData.success && chatData.response) {
          // ✅ LOG CRÍTICO: Verificar o que foi recebido do backend
          console.log('✅ [sendMessage] RESPOSTA VÁLIDA RECEBIDA DO BACKEND:', {
            success: chatData.success,
            shouldGeneratePreview: chatData.shouldGeneratePreview,
            shouldGeneratePreviewRaw: chatData.shouldGeneratePreviewRaw,
            shouldGeneratePreviewType: typeof chatData.shouldGeneratePreview,
            nextStage: chatData.nextStage,
            responseLength: chatData.response?.length,
            responsePreview: chatData.response?.substring(0, 100)
          });
          
          // ✅ VERIFICAÇÃO SIMPLIFICADA E DIRETA
          const shouldGenerateValue = chatData.shouldGeneratePreview;
          const shouldGenerateRaw = chatData.shouldGeneratePreviewRaw;
          
          // ✅ VERIFICAÇÃO MUITO MAIS SIMPLES: qualquer valor truthy
          const shouldGenerate = Boolean(shouldGenerateValue) || Boolean(shouldGenerateRaw);
          
          console.log('🔍 [sendMessage] Verificação SIMPLIFICADA:', {
            shouldGeneratePreview: shouldGenerateValue,
            shouldGeneratePreviewRaw: shouldGenerateRaw,
            shouldGenerate: shouldGenerate,
            'Boolean(shouldGenerateValue)': Boolean(shouldGenerateValue),
            'Boolean(shouldGenerateRaw)': Boolean(shouldGenerateRaw)
          });
          
          // ✅ CRÍTICO: Se shouldGenerate é true, INICIAR GERAÇÃO IMEDIATAMENTE
          if (shouldGenerate) {
            console.log('🚀🚀🚀 [sendMessage] ============================================');
            console.log('🚀🚀🚀 [sendMessage] GERANDO AGORA - shouldGenerate é TRUE!');
            console.log('🚀🚀🚀 [sendMessage] ============================================');
            
            // ✅ NÃO adicionar mensagem de confirmação quando vai gerar - será substituída pelo preview
            // A mensagem de confirmação será removida quando o preview for adicionado
            const responseContent = chatData.response?.trim() || '';
            const isConfirmationMessage = responseContent.toLowerCase().includes('vou criar') || 
                                        responseContent.toLowerCase().includes('gerando') || 
                                        responseContent.toLowerCase().includes('confirmado') ||
                                        responseContent.toLowerCase().includes('iniciando a geração') ||
                                        responseContent.toLowerCase().includes('perfeito') ||
                                        responseContent.toLowerCase().includes('em instantes') ||
                                        responseContent.toLowerCase().includes('aguarde') ||
                                        responseContent.toLowerCase().includes('criando') ||
                                        responseContent.toLowerCase().includes('processando');
            
            // ✅ REMOVER mensagens de confirmação ANTES de iniciar geração
            setMessages(prev => {
              // ✅ Remover APENAS mensagens que REALMENTE são de confirmação (mais específico)
              // Padrões mais específicos para evitar remover mensagens normais
              const confirmationPatterns = [
                /^vou criar/i, // Começa com "vou criar"
                /^estou criando/i, // Começa com "estou criando"
                /gerando (seu|o) (site|código)/i,
                /^confirmado!?$/i, // Apenas "confirmado" sozinho
                /^iniciando (a )?gera(ção|r)/i, // Começa com "iniciando geração"
                /^criando (seu|o) (site|código)/i,
                /^processando (seu|o) (site|código)/i,
                /em instantes (você|o) (verá|ver)/i,
                /aguarde (enquanto|que)/i,
                /^perfeito!?\s*(vou|estou|vamos|vamos criar|vou gerar|vou iniciar)/i, // "perfeito" seguido de ação de criação
                /^perfeito!?\s*🎉\s*(vou|estou|vamos)/i, // "perfeito 🎉" seguido de ação
                /^opa!?\s*🎉\s*\*\*confirmado/i, // "Opa! 🎉 **Confirmado"
                /^confirmado!?\s*\*\*/i, // "Confirmado! **"
              ];
              
              const filteredPrev = prev.filter((m) => {
                const isRecent = prev.indexOf(m) >= prev.length - 5;
                if (isRecent && m.sender === 'ai' && m.type === 'text') {
                  const content = m.content || '';
                  // ✅ Verificar se a mensagem corresponde a um padrão de confirmação específico
                  const isConfirmation = confirmationPatterns.some(pattern => pattern.test(content));
                  if (isConfirmation) {
                    console.log('🗑️ [sendMessage] Removendo mensagem de confirmação antes de gerar:', m.content?.substring(0, 50));
                    return false;
                  }
                }
                return true;
              });
              
              // ✅ Se é mensagem de confirmação, NÃO adicionar - será substituída pelo preview
              if (isConfirmationMessage) {
                console.log('⚠️ [sendMessage] Mensagem de confirmação detectada - será substituída pelo preview, não adicionando');
                return filteredPrev;
              }
              
              // ✅ Verificar se já existe mensagem idêntica recente (últimas 3 mensagens)
              const recentMessages = filteredPrev.slice(-3);
              const isDuplicate = recentMessages.some(m => 
                m.sender === 'ai' && 
                m.type === 'text' &&
                m.content?.trim().toLowerCase() === responseContent.toLowerCase()
              );
              
              if (isDuplicate) {
                console.log('⚠️ [sendMessage] Mensagem duplicada detectada, não adicionando novamente');
                return filteredPrev;
              }
              
              // ✅ Apenas adicionar mensagem se NÃO for mensagem de confirmação e NÃO for duplicada
              const aiMessage: Message = {
                id: crypto.randomUUID(),
                sender: 'ai',
                content: chatData.response,
                timestamp: new Date(),
                type: 'text',
                metadata: chatData.metadata || {}
              };
              
              return [...filteredPrev, aiMessage];
            });
            
            // ✅ SALVAR VARIÁVEIS ANTES DO TIMEOUT
            const promptToUse = messageToSend;
            const conversationIdToUse = conversationId;
            
            console.log('📝 [sendMessage] Variáveis salvas:', {
              promptToUse: promptToUse.substring(0, 50),
              conversationIdToUse
            });
            
            // ✅ NÃO definir setIsLoading(false) aqui - deixar generateSitePreview controlar o loading
            // ✅ CHAMAR generateSitePreview IMEDIATAMENTE após um pequeno delay para renderizar mensagem
            console.log('🎯 [sendMessage] Configurando setTimeout para chamar generateSitePreview...');
            
            setTimeout(() => {
              console.log('⏳ [sendMessage] ============================================');
              console.log('⏳ [sendMessage] Delay concluído - INICIANDO GERAÇÃO');
              console.log('⏳ [sendMessage] ============================================');
              console.log('📝 [sendMessage] Prompt:', promptToUse.substring(0, 100));
              console.log('🆔 [sendMessage] ConversationId:', conversationIdToUse);
              
              // ✅ Verificar se generateSitePreview existe
              if (typeof generateSitePreview !== 'function') {
                console.error('❌ [sendMessage] ERRO CRÍTICO: generateSitePreview não é uma função!');
                setIsLoading(false);
                return;
              }
              
              console.log('✅ [sendMessage] generateSitePreview existe, chamando agora...');
              
              // ✅ Chamar diretamente
              // ✅ NÃO definir setIsLoading(false) aqui - generateSitePreview controla isso no finally
              // Mas o timer continuará visível porque isGenerating ainda é true
              generateSitePreview(promptToUse)
                .then(() => {
                  console.log('✅ [sendMessage] Geração concluída com sucesso!');
                  // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                })
                .catch((error) => {
                  console.error('❌ [sendMessage] Erro na geração:', error);
                  // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                });
            }, 500); // ✅ Aumentar delay para 500ms para garantir renderização
            
            // ✅ DEFINITIVAMENTE NÃO CONTINUAR COM O RESTO DO CÓDIGO
            return;
          }
          
          // ✅ Se não deve gerar, apenas adicionar mensagem normalmente
          // ✅ Verificar duplicatas antes de adicionar
          setMessages(prev => {
            const responseContent = chatData.response?.trim() || '';
            const recentMessages = prev.slice(-3);
            const isDuplicate = recentMessages.some(m => 
              m.sender === 'ai' && 
              m.type === 'text' &&
              m.content?.trim().toLowerCase() === responseContent.toLowerCase()
            );
            
            if (isDuplicate) {
              console.log('⚠️ [sendMessage] Mensagem duplicada detectada (normal), não adicionando');
              return prev;
            }
            
            const aiMessage: Message = {
              id: crypto.randomUUID(),
              sender: 'ai',
              content: chatData.response,
              timestamp: new Date(),
              type: 'text',
              // ✅ Incluir metadados para mostrar botão "Pode criar" se necessário
              metadata: chatData.metadata || {}
            };
            
            return [...prev, aiMessage];
          });
          
          // ✅ VERIFICAÇÃO ALTERNATIVA (fallback) - apenas se shouldGenerate não for true
          const trimmedMessage = messageToSend.trim().toLowerCase();
          
          // ✅ Padrões de confirmação básicos (expandidos)
          const exactConfirmationPattern = /^(gerar|sim|ok|pode gerar|pronto|pode|vamos|está bom|está ok|vai|confirmo|confirmado|pode criar|pode fazer|pode começar|okay|okay okay|estao boas|estão boas|tá bom|ta bom|perfeito|ótimo|excelente)$/i;
          const repeatedConfirmation = /^(ok|sim|gerar|pronto|pode)\s+(ok|sim|gerar|pronto|pode)$/i.test(trimmedMessage);
          const isOkOk = /^ok\s+ok$/i.test(trimmedMessage) || trimmedMessage === 'ok ok' || trimmedMessage === 'ok  ok' || trimmedMessage === 'ok   ok';
          
          // ✅ Padrões de confirmação implícita (mensagens curtas que indicam aprovação)
          const implicitConfirmationPattern = /(est[aá]o?\s+boa?s?|est[aá]\s+bom|t[áa]\s+bom|perfeito|ótimo|excelente|pode\s+gerar|pode\s+criar|apenas\s+(isso|essa|esse)|somente\s+(isso|essa|esse)|só\s+(isso|essa|esse)|quero\s+(isso|essa|esse)|isso\s+(mesmo|mesma)|isso\s+mesmo)/i.test(trimmedMessage);
          
          // ✅ Padrões de confirmação de páginas
          const pagesConfirmationPattern = /(todas as páginas|aceito a sugestão|aceitar|confirmar páginas|está bom|quero todas|todas|pode gerar|pode criar|está ok)/i.test(trimmedMessage);
          
          // ✅ Verificar se a resposta ANTERIOR da IA estava pedindo confirmação
          const lastAIMessage = messages.filter(m => m.sender === 'ai').slice(-1)[0];
          const aiWasAskingForPages = lastAIMessage?.content && (
            lastAIMessage.content.includes('confirme as páginas') ||
            lastAIMessage.content.includes('Quais páginas') ||
            lastAIMessage.content.includes('confirmar as páginas') ||
            lastAIMessage.content.includes('Opção 1') ||
            lastAIMessage.content.includes('Opção 2') ||
            lastAIMessage.content.includes('Todas as páginas') ||
            lastAIMessage.content.includes('Aceitar minha sugestão')
          );
          
          // ✅ Verificar se a resposta ANTERIOR da IA estava perguntando algo que espera confirmação
          const aiWasAskingAnything = lastAIMessage?.content && (
            lastAIMessage.content.includes('?') ||
            lastAIMessage.content.includes('confirme') ||
            lastAIMessage.content.includes('confirma') ||
            lastAIMessage.content.includes('Quer') ||
            lastAIMessage.content.includes('Precisa') ||
            lastAIMessage.content.includes('Falta')
          );
          
          // ✅ NOVO: Verificar se a RESPOSTA ATUAL da IA está fazendo uma pergunta ou pedindo mais informações
          // Isso é CRÍTICO para evitar gerar quando a IA ainda está esperando resposta
          const aiCurrentResponseHasQuestion = chatData.response && (
            chatData.response.includes('?') ||
            chatData.response.includes('Qual') ||
            chatData.response.includes('qual') ||
            chatData.response.includes('Por favor') ||
            chatData.response.includes('por favor') ||
            chatData.response.includes('Pode me informar') ||
            chatData.response.includes('pode me informar') ||
            chatData.response.includes('Preciso saber') ||
            chatData.response.includes('preciso saber') ||
            chatData.response.includes('Só mais uma informação') ||
            chatData.response.includes('só mais uma informação') ||
            chatData.response.includes('Mais uma pergunta') ||
            chatData.response.includes('mais uma pergunta') ||
            chatData.response.includes('Diga-me') ||
            chatData.response.includes('diga-me') ||
            /Qual\s+(tema|atmosfera|estilo|cor|deseja|prefere|quer)/i.test(chatData.response)
          );
          
          // ✅ Verificar se a resposta atual está dizendo que vai gerar DEPOIS (não agora)
          const aiWillGenerateLater = chatData.response && (
            chatData.response.includes('vou gerar') && (
              chatData.response.includes('depois') ||
              chatData.response.includes('então') ||
              chatData.response.includes('após') ||
              chatData.response.includes('com essa informação') ||
              chatData.response.includes('com essa última informação') ||
              aiCurrentResponseHasQuestion // Se tem pergunta, definitivamente é "depois"
            )
          );
          
          const userMessageIsConfirmation = exactConfirmationPattern.test(trimmedMessage) || 
                                             repeatedConfirmation ||
                                             isOkOk ||
                                             pagesConfirmationPattern ||
                                             implicitConfirmationPattern ||
                                             (trimmedMessage.length < 100 && /(sim|ok|gerar|pronto|pode|confirmo|tudo certo|todas|aceito|isso|essa|esse|boa|bom)/i.test(trimmedMessage) && !/(não|nao|nada|cancelar|desistir|parar|mudar|alterar|quero outro)/i.test(trimmedMessage));
          
          const responseIndicatesGeneration = chatData.response && (
            chatData.response.includes('Gerando seu site') ||
            chatData.response.includes('STATUS: Gerando') ||
            chatData.response.includes('criando um site') ||
            chatData.response.includes('preparo seu site') ||
            chatData.response.includes('vou gerar') ||
            chatData.response.includes('Vou gerar') ||
            chatData.response.includes('Vou criar') ||
            chatData.response.includes('vou criar') ||
            chatData.response.includes('gerando agora') ||
            chatData.response.includes('Gerando agora') ||
            chatData.response.includes('INICIANDO A GERAÇÃO') ||
            chatData.response.includes('iniciando agora') ||
            chatData.response.includes('Iniciando agora') ||
            chatData.response.includes('Estou iniciando') ||
            chatData.response.includes('estou iniciando') ||
            chatData.response.includes('iniciando a criação') ||
            chatData.response.includes('Iniciando a criação') ||
            chatData.response.includes('INICIANDO') ||
            chatData.response.includes('iniciando') ||
            chatData.response.includes('preview') ||
            chatData.response.includes('visualização') ||
            chatData.response.includes('Gerando preview') ||
            chatData.response.includes('gerando preview') ||
            chatData.response.includes('preparando a visualização') ||
            chatData.response.includes('Preparando a visualização') ||
            chatData.response.includes('Excelente! Vou gerar') ||
            chatData.response.includes('excelente! vou gerar') ||
            chatData.response.includes('Aguarde alguns instantes') ||
            chatData.response.includes('aguarde alguns instantes') ||
            chatData.response.includes('enquanto crio seu site') ||
            chatData.response.includes('Enquanto crio seu site')
          );
          
          // ✅ FALLBACK MELHORADO: Condições mais flexíveis para gerar
          const hasCompleteData = chatData.hasCompleteData !== false; // Assumir true se não especificado
          
          console.log('🔍 [sendMessage] Verificação FALLBACK:', {
            userMessageIsConfirmation,
            pagesConfirmationPattern,
            implicitConfirmationPattern,
            aiWasAskingForPages,
            aiWasAskingAnything,
            aiCurrentResponseHasQuestion,
            aiWillGenerateLater,
            responseIndicatesGeneration,
            hasCompleteData,
            shouldGenerate,
            messageLength: trimmedMessage.length,
            messagePreview: trimmedMessage.substring(0, 50)
          });
          
          // ✅ FALLBACK CRÍTICO: Gerar SOMENTE se NÃO houver perguntas pendentes da IA
          // REGRA PRINCIPAL: NÃO gerar se a IA está fazendo uma pergunta ou dizendo que vai gerar DEPOIS
          // 
          // Condições para gerar:
          // 1. Usuário confirmou E (IA vai gerar OU tem dados completos) E IA NÃO está perguntando nada AGORA
          // 2. Tem dados completos E resposta indica geração AGORA (não depois) E usuário confirmou implícita OU explicitamente
          // 3. Usuário confirmou páginas especificamente E IA não está perguntando nada
          // 4. Resposta indica geração AGORA + mensagem curta (confirmação implícita) E IA não está perguntando nada
          // 5. NOVO: IA diz explicitamente que vai gerar AGORA (mesmo sem dados completos) + usuário confirmou
          
          // ✅ PROTEÇÃO: NÃO gerar se a IA está fazendo pergunta ou vai gerar DEPOIS
          // MAS: Se a IA diz explicitamente "Vou gerar agora" ou "Gerando preview", permitir mesmo com pergunta
          const explicitGenerationNow = chatData.response && (
            chatData.response.includes('Vou gerar seu site agora') ||
            chatData.response.includes('vou gerar seu site agora') ||
            chatData.response.includes('Gerando preview') ||
            chatData.response.includes('gerando preview') ||
            chatData.response.includes('Gerando seu site agora') ||
            chatData.response.includes('gerando seu site agora') ||
            chatData.response.includes('*Gerando preview do site*') ||
            chatData.response.includes('*gerando preview do site*')
          );
          
          const shouldBlockGeneration = (aiCurrentResponseHasQuestion || aiWillGenerateLater) && !explicitGenerationNow;
          
          const shouldGenerateFallback = !shouldBlockGeneration && (
            // Condição 1: Confirmação explícita do usuário + IA vai gerar AGORA (não depois)
            (userMessageIsConfirmation && responseIndicatesGeneration && !aiCurrentResponseHasQuestion) ||
            // Condição 2: Confirmação do usuário + dados completos + IA não está perguntando
            (userMessageIsConfirmation && hasCompleteData && !aiCurrentResponseHasQuestion) ||
            // Condição 3: Confirmação específica de páginas + IA não está perguntando
            (pagesConfirmationPattern && aiWasAskingForPages && !aiCurrentResponseHasQuestion) ||
            // Condição 4: Dados completos + resposta indica geração AGORA + usuário confirmou implícita OU explicitamente + IA não está perguntando
            (hasCompleteData && responseIndicatesGeneration && (userMessageIsConfirmation || implicitConfirmationPattern) && !aiCurrentResponseHasQuestion) ||
            // Condição 5: Resposta indica geração AGORA + mensagem curta (confirmação implícita) + IA não está perguntando
            (responseIndicatesGeneration && trimmedMessage.length < 50 && !/(não|nao|nada|cancelar|desistir|parar|mudar|alterar)/i.test(trimmedMessage) && !aiCurrentResponseHasQuestion) ||
            // ✅ NOVA Condição 6: IA diz explicitamente que vai gerar AGORA + usuário confirmou (mesmo sem dados completos)
            (explicitGenerationNow && userMessageIsConfirmation && !aiCurrentResponseHasQuestion) ||
            // ✅ NOVA Condição 7: IA diz explicitamente que vai gerar AGORA + mensagem curta do usuário (confirmação implícita)
            (explicitGenerationNow && trimmedMessage.length < 50 && !/(não|nao|nada|cancelar|desistir|parar|mudar|alterar)/i.test(trimmedMessage))
          );
          
          if (shouldGenerateFallback && !shouldGenerate) {
            console.log('⚠️ [sendMessage] ============================================');
            console.log('⚠️ [sendMessage] FALLBACK ATIVADO: Gerando mesmo sem flag shouldGeneratePreview');
            console.log('⚠️ [sendMessage] ============================================');
            console.log('📊 [sendMessage] Razão do FALLBACK:', {
              shouldBlockGeneration,
              explicitGenerationNow,
              aiCurrentResponseHasQuestion,
              aiWillGenerateLater,
              condition1: userMessageIsConfirmation && responseIndicatesGeneration && !aiCurrentResponseHasQuestion,
              condition2: userMessageIsConfirmation && hasCompleteData && !aiCurrentResponseHasQuestion,
              condition3: pagesConfirmationPattern && aiWasAskingForPages && !aiCurrentResponseHasQuestion,
              condition4: hasCompleteData && responseIndicatesGeneration && (userMessageIsConfirmation || implicitConfirmationPattern) && !aiCurrentResponseHasQuestion,
              condition5: responseIndicatesGeneration && trimmedMessage.length < 50 && !aiCurrentResponseHasQuestion,
              condition6: explicitGenerationNow && userMessageIsConfirmation && !aiCurrentResponseHasQuestion,
              condition7: explicitGenerationNow && trimmedMessage.length < 50 && !/(não|nao|nada|cancelar|desistir|parar|mudar|alterar)/i.test(trimmedMessage),
              confirmedPages: pagesConfirmationPattern && aiWasAskingForPages,
              confirmedGeneral: userMessageIsConfirmation,
              implicitConfirmation: implicitConfirmationPattern,
              responseIndicatesGeneration,
              hasCompleteData,
              finalDecision: shouldGenerateFallback
            });
            
            const promptToUse = messageToSend;
            const responseContent = chatData.response?.trim() || '';
            const isConfirmationMessage = responseContent.toLowerCase().includes('vou criar') || 
                                        responseContent.toLowerCase().includes('gerando') || 
                                        responseContent.toLowerCase().includes('confirmado') ||
                                        responseContent.toLowerCase().includes('iniciando a geração') ||
                                        responseContent.toLowerCase().includes('perfeito') ||
                                        responseContent.toLowerCase().includes('em instantes') ||
                                        responseContent.toLowerCase().includes('aguarde') ||
                                        responseContent.toLowerCase().includes('criando') ||
                                        responseContent.toLowerCase().includes('processando');
            
            // ✅ REMOVER mensagens de confirmação ANTES de iniciar geração (mesma lógica do código principal)
            setMessages(prev => {
              // ✅ Remover APENAS mensagens que REALMENTE são de confirmação (mais específico)
              // Padrões mais específicos para evitar remover mensagens normais
              const confirmationPatterns = [
                /^vou criar/i, // Começa com "vou criar"
                /^estou criando/i, // Começa com "estou criando"
                /gerando (seu|o) (site|código)/i,
                /^confirmado!?$/i, // Apenas "confirmado" sozinho
                /^iniciando (a )?gera(ção|r)/i, // Começa com "iniciando geração"
                /^criando (seu|o) (site|código)/i,
                /^processando (seu|o) (site|código)/i,
                /em instantes (você|o) (verá|ver)/i,
                /aguarde (enquanto|que)/i,
                /^perfeito!?\s*(vou|estou|vamos|vamos criar|vou gerar|vou iniciar)/i, // "perfeito" seguido de ação de criação
                /^perfeito!?\s*🎉\s*(vou|estou|vamos)/i, // "perfeito 🎉" seguido de ação
                /^opa!?\s*🎉\s*\*\*confirmado/i, // "Opa! 🎉 **Confirmado"
                /^confirmado!?\s*\*\*/i, // "Confirmado! **"
              ];
              
              const filteredPrev = prev.filter((m) => {
                const isRecent = prev.indexOf(m) >= prev.length - 5;
                if (isRecent && m.sender === 'ai' && m.type === 'text') {
                  const content = m.content || '';
                  // ✅ Verificar se a mensagem corresponde a um padrão de confirmação específico
                  const isConfirmation = confirmationPatterns.some(pattern => pattern.test(content));
                  if (isConfirmation) {
                    console.log('🗑️ [sendMessage-FALLBACK] Removendo mensagem de confirmação antes de gerar:', m.content?.substring(0, 50));
                    return false;
                  }
                }
                return true;
              });
              
              // ✅ Se é mensagem de confirmação, NÃO adicionar - será substituída pelo preview
              if (isConfirmationMessage) {
                console.log('⚠️ [sendMessage-FALLBACK] Mensagem de confirmação detectada - será substituída pelo preview, não adicionando');
                return filteredPrev;
              }
              
              // ✅ Verificar se já existe mensagem idêntica recente (últimas 3 mensagens)
              const recentMessages = filteredPrev.slice(-3);
              const isDuplicate = recentMessages.some(m => 
                m.sender === 'ai' && 
                m.type === 'text' &&
                m.content?.trim().toLowerCase() === responseContent.toLowerCase()
              );
              
              if (isDuplicate) {
                console.log('⚠️ [sendMessage-FALLBACK] Mensagem duplicada detectada, não adicionando novamente');
                return filteredPrev;
              }
              
              // ✅ Apenas adicionar mensagem se NÃO for mensagem de confirmação e NÃO for duplicada
              if (chatData.response) {
                const aiMessage: Message = {
                  id: crypto.randomUUID(),
                  sender: 'ai',
                  content: chatData.response,
                  timestamp: new Date(),
                  type: 'text',
                  metadata: chatData.metadata || {}
                };
                return [...filteredPrev, aiMessage];
              }
              
              return filteredPrev;
            });
            
            setTimeout(() => {
              console.log('🚀 [sendMessage] Iniciando geração via FALLBACK...');
              // ✅ NÃO definir setIsLoading(false) aqui - generateSitePreview controla isso no finally
              generateSitePreview(promptToUse)
                .then(() => {
                  console.log('✅ [sendMessage] Geração (fallback) concluída');
                  // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                })
                .catch((error) => {
                  console.error('❌ [sendMessage] Erro (fallback):', error);
                  // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                });
            }, 500);
            
            return; // ✅ Não continuar com código abaixo
          }
          
          setIsLoading(false);
          return;
        }
        
        // ✅ Se chegou aqui, algo deu errado
        console.error('❌ [sendMessage] Resposta inválida:', chatData);
        setIsLoading(false);
        throw new Error(chatData.error || 'Resposta inválida da API');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: 'Desculpe, ocorreu um erro. Pode tentar novamente? 🤖',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Função auxiliar para construir prompt completo com todos os dados
  const buildCompletePrompt = (
    basePrompt: string,
    projectData: any,
    initialData: any,
    conversationHistory: any[] = [] // ✅ Novo parâmetro: histórico completo da conversa
  ): string => {
    // ✅ Construir prompt estruturado com TODOS os dados extraídos + histórico completo
    const sections: string[] = [];
    
    // Prompt original do usuário
    if (basePrompt || initialData.additionalPrompt) {
      sections.push(`💡 **SOLICITAÇÃO ORIGINAL:**\n${basePrompt || initialData.additionalPrompt}`);
    }
    
    // ✅ IMPORTANTE: Incluir histórico completo da conversa (especialmente alterações)
    if (conversationHistory && conversationHistory.length > 0) {
      // ✅ Filtrar apenas mensagens relevantes (ignorar confirmações simples como "ok", "gerar")
      const relevantMessages = conversationHistory.filter(msg => {
        const content = msg.content?.trim().toLowerCase() || '';
        // Ignorar mensagens muito curtas que são apenas confirmações
        const isConfirmation = content.length < 20 && /^(gerar|sim|ok|pode gerar|pronto|pode|vamos|está bom|está ok|vai|confirmo|confirmado|pode criar|pode fazer|pode começar|tudo certo|pode ir|vamos lá)$/i.test(content);
        return !isConfirmation;
      });
      
      if (relevantMessages.length > 0) {
        sections.push(`\n💬 **HISTÓRICO DA CONVERSA E ALTERAÇÕES SOLICITADAS:**`);
        
        // ✅ Extrair mensagens do usuário com alterações/adicionais
        const userMessages = relevantMessages
          .filter(msg => msg.sender_type === 'user')
          .map((msg) => {
            const content = msg.content || '';
            // ✅ Incluir TODAS as mensagens do usuário (exceto confirmações muito curtas já filtradas)
            // Não pular mensagens - todas podem conter informações importantes
            return `[Usuário]: ${content}`;
          })
          .filter(Boolean);
        
        // ✅ Extrair respostas da IA que podem ter informações valiosas ou confirmações de alterações
        const aiMessages = relevantMessages
          .filter(msg => msg.sender_type === 'ai')
          .map(msg => {
            const content = msg.content || '';
            // Se a mensagem da IA contém "COMPILAÇÃO" ou menciona alterações, incluir
            if (content.includes('COMPILAÇÃO') || 
                content.includes('compilação') || 
                content.includes('alteração') ||
                content.includes('alterar') ||
                content.includes('ajustar')) {
              return `[IA - Compilação/Confirmação]: ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`;
            }
            return null;
          })
          .filter(Boolean);
        
        // ✅ Combinar mensagens relevantes
        const allRelevantMessages = [...userMessages, ...aiMessages];
        
        if (allRelevantMessages.length > 0) {
          sections.push(`\n**Mensagens relevantes da conversa:**`);
          allRelevantMessages.forEach((msg, idx) => {
            if (msg) {
              sections.push(`${idx + 1}. ${msg}`);
            }
          });
          
          sections.push(`\n⚠️ **IMPORTANTE:** As alterações e informações adicionais mencionadas acima devem ser PRIORITÁRIAS sobre a solicitação original.`);
        }
      }
    }

    // ✅ Dados da empresa - COM VERIFICAÇÃO DE SEGURANÇA
    // Usar dados do banco OU dados iniciais como fallback
    const companyName = projectData?.company_name || initialData?.companyName || 'Empresa';
    const businessType = projectData?.business_type || projectData?.business_sector || initialData?.businessSector || 'Negócios';
    
    sections.push(`\n🏢 **DADOS DA EMPRESA:**`);
    if (companyName && companyName !== 'Empresa') sections.push(`- Nome: ${companyName}`);
    if (businessType && businessType !== 'Negócios') sections.push(`- Setor/Negócio: ${businessType}`);
    
    // ✅ Apenas adicionar dados extras se projectData não for null
    if (projectData) {
      if (projectData.business_sector && projectData.business_sector !== businessType) {
        sections.push(`- Setor: ${projectData.business_sector}`);
      }
      if (projectData.slogan) sections.push(`- Slogan: "${projectData.slogan}"`);
      if (projectData.business_objective) sections.push(`- Objetivo: ${projectData.business_objective}`);
      if (projectData.target_audience) sections.push(`- Público-alvo: ${projectData.target_audience}`);
      if (projectData.short_description) sections.push(`- Descrição: ${projectData.short_description}`);

      // Identidade visual
      if (projectData.design_style || projectData.design_colors) {
        sections.push(`\n🎨 **IDENTIDADE VISUAL:**`);
        if (projectData.design_style) sections.push(`- Tema/Estilo: ${projectData.design_style}`);
        if (projectData.design_colors && Array.isArray(projectData.design_colors) && projectData.design_colors.length > 0) {
          sections.push(`- Cores: ${projectData.design_colors.join(', ')}`);
        }
      }

      // Estrutura do site
      if (projectData.pages_needed && Array.isArray(projectData.pages_needed) && projectData.pages_needed.length > 0) {
        sections.push(`\n🏗️ **ESTRUTURA DO SITE:**`);
        sections.push(`- Páginas/Seções: ${projectData.pages_needed.join(', ')}`);
        if (projectData.site_structure) sections.push(`- Tipo: ${projectData.site_structure}`);
      }

      // Funcionalidades
      if (projectData.functionalities && Array.isArray(projectData.functionalities) && projectData.functionalities.length > 0) {
        sections.push(`\n⚙️ **FUNCIONALIDADES:**`);
        sections.push(`- ${projectData.functionalities.join(', ')}`);
      }

      // Conteúdo
      if (projectData.cta_text || projectData.tone) {
        sections.push(`\n✍️ **CONTEÚDO:**`);
        if (projectData.cta_text) sections.push(`- CTA: "${projectData.cta_text}"`);
        // tone pode estar em content_needs
        if (projectData.content_needs) {
          try {
            const contentNeeds = typeof projectData.content_needs === 'string' 
              ? JSON.parse(projectData.content_needs) 
              : projectData.content_needs;
            if (contentNeeds.tone) sections.push(`- Tom de voz: ${contentNeeds.tone}`);
          } catch (e) {
            // Ignorar erro de parse
          }
        }
      }
    }

    const completePrompt = sections.join('\n');
    console.log('📋 [buildCompletePrompt] Prompt completo construído:', completePrompt.substring(0, 300) + '...');
    
    return completePrompt || basePrompt;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // ✅ Bloquear envio via Enter quando chat está desativado
    if (isBlocked || hasEndedManually) {
      e.preventDefault();
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string): React.ReactNode => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(...formatTextWithBreaks(textBefore, key));
        key += textBefore.split('\n').length;
      }

      const linkText = match[1];
      const linkUrl = match[2];
      const isWhatsApp = linkUrl.includes('wa.me') || linkUrl.includes('whatsapp.com');
      
      parts.push(
        <a
          key={`link-${key++}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block mt-3 px-6 py-3 rounded-xl font-semibold text-white transition-all ${
            isWhatsApp
              ? 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isWhatsApp ? '💬 ' : ''}{linkText}
        </a>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      parts.push(...formatTextWithBreaks(textAfter, key));
    }

    return parts.length > 0 ? parts : formatTextWithBreaks(content, 0);
  };

  const formatTextWithBreaks = (text: string, startKey: number) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const lineKey = startKey + index;
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const lineParts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;
      let boldKey = 0;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          lineParts.push(line.substring(lastIndex, match.index));
        }
        lineParts.push(
          <strong key={`bold-${lineKey}-${boldKey++}`} className="font-bold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        lineParts.push(line.substring(lastIndex));
      }

      return (
        <span key={lineKey}>
          {lineParts.length > 0 ? lineParts : line}
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900 flex flex-col z-[9999] overflow-hidden" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100%', 
        height: '100%',
        WebkitOverflowScrolling: 'touch', // ✅ Smooth scrolling no iOS
        touchAction: 'pan-y', // ✅ Permitir scroll vertical, bloquear zoom/pan horizontal
      }}
    >
      
      {/* Header Ultra Minimalista - Botão voltar, ID da conversa e cancelar requisições */}
      <div className="h-12 sm:h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-3 sm:px-4 flex-shrink-0 shadow-lg" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link 
            href="/pt"
            className="p-2 sm:p-2.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white touch-manipulation flex-shrink-0"
            title="Voltar"
            style={{ WebkitTapHighlightColor: 'transparent' }} // ✅ Remover highlight no iOS
          >
            <ArrowLeft size={20} className="sm:w-5 sm:h-5" />
          </Link>
          
          {/* ID da Conversa */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 min-w-0 flex-shrink">
            <span className="text-xs text-slate-400 hidden sm:inline">ID:</span>
            <code className="text-xs sm:text-sm font-mono text-blue-400 font-semibold truncate">
              {conversationId.substring(0, 8)}...
            </code>
            <button
              onClick={copyConversationId}
              className="p-1.5 sm:p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white touch-manipulation flex-shrink-0"
              title="Copiar ID completo"
              style={{ WebkitTapHighlightColor: 'transparent', minWidth: '32px', minHeight: '32px' }} // ✅ Área de toque mínima iOS (44x44 recomendado)
            >
              {copiedId ? (
                <Check size={16} className="text-green-400 sm:w-3.5 sm:h-3.5" />
              ) : (
                <Copy size={16} className="sm:w-3.5 sm:h-3.5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Botão para cancelar requisições (apenas quando houver requisições em andamento) */}
        {activeRequestsCount > 0 && (
          <button
            onClick={cancelAllRequests}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors touch-manipulation flex-shrink-0"
            title="Cancelar todas as requisições em andamento"
            style={{ WebkitTapHighlightColor: 'transparent', minHeight: '44px' }} // ✅ Área de toque adequada para iOS
          >
            <XCircle size={18} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cancelar ({activeRequestsCount})</span>
            <span className="sm:hidden">{activeRequestsCount}</span>
          </button>
        )}
      </div>

      {/* Main Content - Chat Only */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900 h-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Messages Area - Full Width, No Max Width */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 min-h-0 w-full overscroll-behavior-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <AnimatePresence>
            {/* ✅ Mostrar indicador de "IA pensando" quando está inicializando ou carregando e não há mensagens ainda */}
            {(isInitializing || isLoading) && messages.length === 0 && (
              <motion.div
                key="ai-thinking-initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-4 max-w-[85%] sm:max-w-[75%]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                  <AIThinkingIndicator message="Analisando seu pedido e preparando a resposta..." />
                </div>
              </motion.div>
            )}
            
            {/* ✅ Mostrar indicador de "IA pensando" quando está carregando após última mensagem do usuário */}
            {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === 'user' && (
              <motion.div
                key="ai-thinking-response"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-4 max-w-[85%] sm:max-w-[75%]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                  <AIThinkingIndicator message="Processando sua mensagem..." />
                </div>
              </motion.div>
            )}
            
            {messages.map((message) => (
              <motion.div
                key={message.id}
                data-message-id={message.id}
                data-message-type={message.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                  {message.sender === 'ai' && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={16} />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-4 rounded-xl sm:rounded-2xl break-words ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-slate-800 text-white border border-slate-700'
                  }`}
                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} // ✅ Quebra de palavras longas no mobile
                >
                  <div className="prose prose-invert max-w-none">
                    {formatMessage(message.content)}
                  </div>

                  {/* ✅ Botão "Pode criar" - aparece quando IA compilou projeto mas usuário não confirmou */}
                  {(() => {
                    // ✅ Simplificar condição: mostrar botão se tem dados completos e não foi confirmado
                    const hasCompleteData = message.metadata?.hasCompleteProjectData === true;
                    const notConfirmed = message.metadata?.userConfirmed !== true;
                    const notGenerating = message.metadata?.shouldGeneratePreview !== true;
                    const showButtonFlag = message.metadata?.showCreateButton === true;
                    
                    const shouldShowButton = message.sender === 'ai' && 
                     message.type === 'text' && 
                     !currentSiteCode && // ✅ Só mostrar botão se ainda não tem site gerado
                     (showButtonFlag || (hasCompleteData && notConfirmed && notGenerating)) && 
                     !isLoading && 
                     !isGenerating && // ✅ Não mostrar botão quando está gerando
                     !isBlocked && 
                     !hasEndedManually && 
                     // ✅ Verificação adicional: garantir que realmente não está gerando
                     generationStartTime === null;
                    
                    // ✅ Log de debug para entender por que o botão não aparece
                    if (message.sender === 'ai' && message.type === 'text' && !currentSiteCode) {
                      console.log('🔍 [Botão] Verificando condições para mostrar botão:', {
                        messageId: message.id,
                        sender: message.sender,
                        type: message.type,
                        hasCurrentSiteCode: !!currentSiteCode,
                        showCreateButton: message.metadata?.showCreateButton,
                        hasCompleteProjectData: message.metadata?.hasCompleteProjectData,
                        userConfirmed: message.metadata?.userConfirmed,
                        shouldGeneratePreview: message.metadata?.shouldGeneratePreview,
                        isLoading,
                        isGenerating,
                        isBlocked,
                        hasEndedManually,
                        generationStartTime: generationStartTime,
                        shouldShowButton
                      });
                    }
                    
                    return shouldShowButton;
                  })() && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={async () => {
                          console.log('✅ [Botão] "Pode criar" clicado');
                          // Enviar mensagem de confirmação explícita diretamente
                          const confirmationMessage = 'pode criar';
                          
                          // Criar mensagem do usuário
                          const userMessage: Message = {
                            id: crypto.randomUUID(),
                            sender: 'user',
                            content: confirmationMessage,
                            timestamp: new Date(),
                            type: 'text'
                          };
                          
                          setMessages(prev => [...prev, userMessage]);
                          setInputMessage('');
                          setIsLoading(true);
                          
                          // Enviar para a API
                          try {
                            const chatResponse = await fetch('/api/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                conversationId,
                                message: confirmationMessage,
                                stage: 1
                              })
                            });
                            
                            const chatData = await chatResponse.json();
                            
                            if (chatData.success && chatData.response) {
                              const responseContent = chatData.response?.trim() || '';
                              const isConfirmationMessage = responseContent.toLowerCase().includes('vou criar') || 
                                                          responseContent.toLowerCase().includes('gerando') || 
                                                          responseContent.toLowerCase().includes('confirmado') ||
                                                          responseContent.toLowerCase().includes('iniciando a geração') ||
                                                          responseContent.toLowerCase().includes('criando') ||
                                                          responseContent.toLowerCase().includes('processando');
                              
                              // ✅ Se deve gerar e é mensagem de confirmação, NÃO adicionar mensagem
                              if (chatData.shouldGeneratePreview && isConfirmationMessage) {
                                console.log('⚠️ [Botão] Mensagem de confirmação detectada - não adicionando, iniciando geração');
                                // Remover APENAS mensagens que REALMENTE são de confirmação (usar padrões específicos)
                                setMessages(prev => {
                                  const confirmationPatterns = [
                                    /vou criar/i,
                                    /estou criando/i,
                                    /gerando (seu|o) (site|código)/i,
                                    /confirmado/i,
                                    /iniciando (a )?gera(ção|r)/i,
                                    /criando (seu|o) (site|código)/i,
                                    /processando (seu|o) (site|código)/i,
                                    /em instantes (você|o) (verá|ver)/i,
                                    /aguarde (enquanto|que)/i,
                                    /perfeito!?\s*(vou|estou|vamos)/i,
                                    /perfeito!?\s*🎉/i,
                                  ];
                                  
                                  return prev.filter((m) => {
                                    const isRecent = prev.indexOf(m) >= prev.length - 5;
                                    if (isRecent && m.sender === 'ai' && m.type === 'text') {
                                      const content = m.content || '';
                                      const isConfirmation = confirmationPatterns.some(pattern => pattern.test(content));
                                      if (isConfirmation) {
                                        console.log('🗑️ [Botão] Removendo mensagem de confirmação:', m.content?.substring(0, 50));
                                        return false;
                                      }
                                    }
                                    return true;
                                  });
                                });
                                
                                // Iniciar geração sem adicionar mensagem de confirmação
                                // ✅ NÃO definir setIsLoading(false) aqui - generateSitePreview controla isso no finally
                                setTimeout(() => {
                                  generateSitePreview(confirmationMessage)
                                    .then(() => {
                                      // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                                    })
                                    .catch(() => {
                                      // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                                    });
                                }, 500);
                              } else {
                                // Adicionar mensagem normalmente se não for confirmação ou não deve gerar
                                const aiMessage: Message = {
                                  id: crypto.randomUUID(),
                                  sender: 'ai',
                                  content: chatData.response,
                                  timestamp: new Date(),
                                  type: 'text',
                                  metadata: chatData.metadata || {}
                                };
                                
                                setMessages(prev => [...prev, aiMessage]);
                                
                                // Se deve gerar, iniciar geração
                                if (chatData.shouldGeneratePreview) {
                                  // ✅ NÃO definir setIsLoading(false) aqui - generateSitePreview controla isso no finally
                                  setTimeout(() => {
                                    generateSitePreview(confirmationMessage)
                                      .then(() => {
                                        // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                                      })
                                      .catch(() => {
                                        // ✅ NÃO definir setIsLoading(false) - já foi definido no finally do generateSitePreview
                                      });
                                  }, 500);
                                } else {
                                  setIsLoading(false);
                                }
                              }
                            } else {
                              setIsLoading(false);
                            }
                          } catch (error) {
                            console.error('Erro ao enviar confirmação:', error);
                            setIsLoading(false);
                          }
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent', minHeight: '48px' }}
                      >
                        <span className="text-base sm:text-lg">🚀 Pode criar</span>
                      </button>
                      <p className="text-xs text-slate-400 mt-2 text-center">
                        Clique para confirmar e iniciar a criação do seu site
                      </p>
                    </div>
                  )}

                  {message.type === 'image' && message.metadata && (message.metadata.imageUrl as string) && (
                    <div className="mt-4">
                      <motion.img
                        src={message.metadata.imageUrl as string}
                        alt={(message.metadata.fileName as string) || 'Imagem enviada'}
                        className="w-full max-w-md h-auto rounded-lg object-cover shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      />
                    </div>
                  )}

                  {message.type === 'site_preview' && message.siteCodeId && (
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => {
                          setCurrentSiteCode(message.siteCodeId!);
                          setShowPreviewModal(true);
                        }}
                        className="w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent', minHeight: '48px' }} // ✅ Área de toque adequada
                      >
                        <Eye className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm sm:text-base">👁️ Ver Preview do Site</span>
                      </button>
                      {message.siteCodeId && (
                        <a
                          href={`/preview/${message.siteCodeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <Monitor size={16} />
                          Abrir em Nova Aba
                        </a>
                      )}
                      {/* ✅ Botão para encerrar modificações - SEMPRE mostrar quando há preview */}
                      {!hasEndedManually && !isBlocked && (
                        <button
                          onClick={() => {
                            console.log('🛑 [Botão] Clicado - hasEndedManually:', hasEndedManually, 'isBlocked:', isBlocked);
                            endModifications();
                          }}
                          className="w-full px-4 py-3 sm:py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors mt-2 touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent', minHeight: '48px' }} // ✅ Área de toque adequada
                        >
                          <XCircle size={18} className="sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-sm sm:text-base">Não quero mais modificações</span>
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Horário da mensagem */}
                  <div className={`mt-2 text-xs ${
                    message.sender === 'user'
                      ? 'text-blue-100/80'
                      : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-white" size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ✅ Mostrar timer de geração APENAS quando está gerando */}
          {/* O timer só desaparece quando o preview está realmente visível na tela (após 2 segundos do preview ser adicionado) */}
          {shouldShowGenerationTimer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 sm:gap-4 justify-start"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="text-white" size={16} />
              </div>
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-blue-500/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/20">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-base font-semibold text-blue-300">⚙️ Gerando seu site...</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 space-y-1">
                    <p>✅ Processo confirmado e em andamento</p>
                    {generationStartTime && elapsedTime > 0 && (
                      <p className="text-blue-400 font-medium">
                        ⏱️ Tempo decorrido: {elapsedTime}s
                      </p>
                    )}
                    <p className="text-slate-500 italic">Por favor, aguarde... não feche esta página.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* ✅ Mostrar loading simples quando não está gerando site */}
          {isLoading && (!isGenerating || !generationStartTime || currentSiteCode) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 sm:gap-4 justify-start"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="text-white" size={16} />
              </div>
              <AIThinkingIndicator message="Processando sua mensagem..." />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom, mobile optimized - Sem borda superior */}
        <div className="p-3 sm:p-4 bg-slate-900 flex-shrink-0 safe-area-bottom" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <div className="w-full flex gap-2 sm:gap-4 px-2 sm:px-0 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
            
            <button
              onClick={() => {
                // ✅ Bloquear clique no botão quando chat está desativado
                if (isBlocked || hasEndedManually) {
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={isLoading || isBlocked || hasEndedManually}
              className="p-3 sm:p-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 touch-manipulation"
              title={isBlocked || hasEndedManually ? "Chat desativado" : "Enviar imagem"}
              style={{ WebkitTapHighlightColor: 'transparent', minWidth: '48px', minHeight: '48px' }} // ✅ Área de toque adequada iOS
            >
              <ImageIcon size={20} className="sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex-1 relative min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isBlocked || hasEndedManually ? "Modificações encerradas. Entre em contato para continuar..." : "Digite sua mensagem..."}
                disabled={isLoading || isBlocked || hasEndedManually}
                className="w-full px-4 sm:px-4 py-3 sm:py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors pr-12 sm:pr-12 text-base sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontSize: '16px', // ✅ Prevenir zoom automático no iOS ao focar input
                  WebkitAppearance: 'none', // ✅ Remover estilos padrão iOS
                  borderRadius: '12px',
                  minHeight: '48px' // ✅ Altura mínima adequada
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
                inputMode="text"
              />
              <div className="absolute right-3 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                <Send size={18} className="sm:w-[18px] sm:h-[18px]" />
              </div>
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isLoading || isBlocked || hasEndedManually}
              className={`px-4 sm:px-6 py-3 sm:py-3 rounded-xl font-medium transition-all text-base sm:text-base flex-shrink-0 touch-manipulation ${
                inputMessage.trim() && !isLoading && !isBlocked && !hasEndedManually
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:from-blue-700 active:to-purple-800'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent', minWidth: '64px', minHeight: '48px' }} // ✅ Área de toque adequada
            >
              <span className="hidden sm:inline">Enviar</span>
              <Send size={20} className="sm:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal para adicionar prompt com imagem */}
      <AnimatePresence>
        {pendingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={cancelImageUpload}
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
              style={{ WebkitOverflowScrolling: 'touch' }} // ✅ Smooth scroll no iOS
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ImageIcon size={24} className="text-blue-400" />
                  Adicionar imagem com descrição
                </h3>
                <button
                  onClick={cancelImageUpload}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <img
                  src={pendingImage.imageUrl}
                  alt={pendingImage.file.name}
                  className="w-full max-h-64 object-contain"
                />
                <div className="p-3 bg-slate-900 border-t border-slate-700">
                  <p className="text-sm text-slate-400">{pendingImage.file.name}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  O que você quer fazer com esta imagem?
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="O que você quer fazer com esta imagem?

📌 Exemplos:
• Adicione esta imagem como logo no cabeçalho
• Use esta imagem como banner principal na seção hero
• Analise as cores desta imagem e aplique como paleta do site
• Transcreva o texto desta imagem e adicione na seção sobre
• Inclua esta imagem na galeria de serviços"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  rows={5}
                  autoFocus
                  onKeyDown={(e) => {
                    // ✅ Bloquear envio via teclado quando chat está desativado
                    if (isBlocked || hasEndedManually) {
                      e.preventDefault();
                      return;
                    }
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { // ✅ Suporte para Cmd+Enter no Mac/iOS
                      e.preventDefault();
                      sendImageWithPrompt();
                    }
                  }}
                  style={{ 
                    fontSize: '16px', // ✅ Prevenir zoom automático no iOS
                    WebkitAppearance: 'none',
                    minHeight: '120px'
                  }}
                />
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <p>💡 <strong>Dica:</strong> Pressione {typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? 'Cmd' : 'Ctrl'}+Enter para enviar rapidamente</p>
                  <p>✨ Você pode: adicionar imagem • analisar cores • transcrever texto</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end flex-wrap">
                <button
                  onClick={cancelImageUpload}
                  disabled={isLoading}
                  className="px-4 sm:px-6 py-3 sm:py-2.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl transition-colors disabled:opacity-50 touch-manipulation flex-1 sm:flex-initial"
                  style={{ WebkitTapHighlightColor: 'transparent', minHeight: '48px' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={sendImageWithPrompt}
                  disabled={isLoading || isBlocked || hasEndedManually}
                  className={`px-6 sm:px-8 py-3 sm:py-2.5 rounded-xl font-medium transition-all touch-manipulation flex-1 sm:flex-initial ${
                    !isLoading && !isBlocked && !hasEndedManually
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:from-blue-700 active:to-purple-800'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent', minHeight: '48px' }}
                >
                  {isLoading ? 'Enviando...' : (isBlocked || hasEndedManually ? 'Chat Desativado' : 'Enviar Imagem')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Preview */}
      {showPreviewModal && currentSiteCode && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setShowPreviewModal(false)}
          style={{ paddingTop: 'max(8px, env(safe-area-inset-top))', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-slate-700"
            style={{ height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 16px)' }}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" />
                <span className="hidden sm:inline">Preview do Site</span>
                <span className="sm:hidden">Preview</span>
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 sm:p-2.5 hover:bg-slate-700 active:bg-slate-600 rounded-lg transition-colors touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent', minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-2 sm:p-4 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
              <PreviewIframe
                siteId={currentSiteCode}
                height="100%"
                className="w-full min-h-[400px] sm:min-h-[600px]"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}

