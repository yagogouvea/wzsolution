'use client';

// ✅ Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, User, Bot, Image as ImageIcon, Monitor, Eye, X, XCircle, Copy, Check } from 'lucide-react';
import PreviewIframe from '@/components/PreviewIframe';
import ConsoleBlocker from '@/components/ConsoleBlocker';
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
  
  // Buscar dados iniciais dos query params ou sessionStorage
  const [initialData, setInitialData] = useState({
    companyName: searchParams.get('companyName') || 'Meu Negócio',
    businessSector: searchParams.get('businessSector') || 'Negócios',
    additionalPrompt: searchParams.get('prompt') || ''
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Buscar dados do sessionStorage se não vierem por query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`chat_${conversationId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          console.log('💾 [Chat] Dados carregados do sessionStorage:', data);
          setInitialData(prev => {
            const newData = {
              ...prev,
              ...data
            };
            console.log('💾 [Chat] InitialData atualizado:', newData);
            return newData;
          });
        } catch (e) {
          console.error('❌ Erro ao ler sessionStorage:', e);
        }
      } else {
        console.log('💾 [Chat] Nenhum dado encontrado no sessionStorage');
      }
    }
  }, [conversationId]);

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
          metadata?: Record<string, unknown>;
          created_at: string;
        }) => ({
          id: msg.id,
          sender: msg.sender_type,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          type: (msg.message_type as 'text' | 'image' | 'site_preview') || 'text',
          metadata: msg.metadata,
          siteCodeId: msg.metadata?.siteCodeId as string | undefined
        }));
        
        console.log('📨 [loadExistingMessages] Mensagens formatadas:', formattedMessages.map(m => ({
          sender: m.sender,
          type: m.type,
          hasPreview: !!m.siteCodeId,
          previewContent: m.content.includes('gerado com sucesso')
        })));
        
        setMessages(formattedMessages);
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
          
          // ✅ Verificar se já existe um site gerado usando as mensagens carregadas
          const hasSitePreview = formattedMessages.some((msg: Message) => 
            msg.type === 'site_preview' || 
            msg.content.includes('gerado com sucesso') ||
            msg.metadata?.siteCodeId
          );
          
          console.log('🔍 [Chat] Site já gerado?', hasSitePreview);
          console.log('🔍 [Chat] Mensagens carregadas:', formattedMessages.length);
          
          // ✅ Se tem mensagens mas NÃO tem preview gerado E tem prompt inicial, precisa gerar
          if (hasMessages && !hasSitePreview && initialData.additionalPrompt && !generationLockRef.current) {
            console.log('✅ [Chat] Mensagens encontradas mas site não gerado. Iniciando geração...');
            generationLockRef.current = true;
            initializeConversation().finally(() => {
              generationLockRef.current = false;
            });
          } 
          // ✅ Se não tinha mensagens e tem prompt, inicializar do zero
          else if (!hasMessages && initialData.additionalPrompt && !generationLockRef.current) {
            console.log('✅ [Chat] Nenhuma mensagem encontrada. Iniciando geração do site...');
            generationLockRef.current = true;
            initializeConversation().finally(() => {
              generationLockRef.current = false;
            });
          } 
          // ✅ Se já tem preview, só mostrar mensagens
          else if (hasSitePreview) {
            console.log('✅ [Chat] Site já foi gerado. Apenas exibindo mensagens.');
          } 
          // ✅ Se tem mensagens mas não precisa gerar
          else if (hasMessages) {
            console.log('✅ [Chat] Mensagens carregadas do banco de dados');
          } 
          else {
            console.log('⚠️ [Chat] Nenhum prompt inicial encontrado. Verificando...');
            console.log('⚠️ [Chat] additionalPrompt:', initialData.additionalPrompt);
            console.log('⚠️ [Chat] generationLockRef:', generationLockRef.current);
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
          
          // ✅ Chamar API /api/chat POST para que a IA responda perguntando informações
          console.log('📨 [initializeConversation] Enviando mensagem para IA...');
          const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId,
              message: userMessageText,
              stage: 1,
              formData: {
                companyName: initialData.companyName,
                businessSector: initialData.businessSector,
                additionalPrompt: initialData.additionalPrompt
              }
            })
          });
          
          const chatData = await chatResponse.json();
          
          if (chatData.success && chatData.response) {
            // Adicionar resposta da IA
            const aiMessage: Message = {
              id: crypto.randomUUID(),
              sender: 'ai',
              content: chatData.response,
              timestamp: new Date(),
              type: 'text'
            };
            
            setMessages(prev => [...prev, aiMessage]);
            
            // ✅ Se a IA indicar que deve gerar preview (shouldGeneratePreview), gerar agora
            // Caso contrário, esperar o usuário responder às perguntas
            if (chatData.shouldGeneratePreview) {
              console.log('✅ [initializeConversation] IA indicou que deve gerar preview agora');
              await generateSitePreview(initialData.additionalPrompt);
            } else {
              console.log('✅ [initializeConversation] IA vai fazer perguntas primeiro. Aguardando resposta do usuário...');
            }
          } else {
            console.error('❌ [initializeConversation] Erro na resposta da IA:', chatData);
          }
        } catch (error) {
          console.error('❌ [initializeConversation] Erro ao inicializar conversa:', error);
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
    console.log('🎯 [generateSitePreview] Iniciando geração do site...');
    console.log('📝 [generateSitePreview] Prompt recebido:', prompt);
    console.log('🔒 [generateSitePreview] isGenerating:', isGenerating);
    console.log('🔒 [generateSitePreview] generationLockRef:', generationLockRef.current);
    
    // ✅ Proteção contra múltiplas chamadas simultâneas
    if (isGenerating || generationLockRef.current) {
      console.warn('⚠️ [generateSitePreview] Geração já em andamento, ignorando chamada duplicada');
      return;
    }
    
    console.log('✅ [generateSitePreview] Iniciando processo...');
    setIsGenerating(true);
    generationLockRef.current = true;
    setIsLoading(true); // ✅ Ativar loading ANTES de qualquer outra coisa
    setGenerationStartTime(new Date()); // ✅ Registrar tempo de início

    // ✅ Não criar mensagem de boas-vindas aqui - já foi criada em initializeConversation
    // Apenas garantir que o loading está visível
    console.log('📨 [generateSitePreview] Iniciando geração do site...');

    // ✅ Criar AbortController para esta requisição (fora do try para estar disponível no catch)
    const abortController = new AbortController();
    abortControllersRef.current.push(abortController);
    setActiveRequestsCount(abortControllersRef.current.length);

    try {
      console.log('🌐 [generateSitePreview] Fazendo requisição para /api/generate-ai-site...');
      console.log('📤 [generateSitePreview] Dados enviados:', {
        conversationId,
        prompt,
        companyName: initialData.companyName,
        businessSector: initialData.businessSector
      });

      const response = await fetch('/api/generate-ai-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          prompt,
          companyName: initialData.companyName,
          businessSector: initialData.businessSector || 'Negócios'
        }),
        signal: abortController.signal // ✅ Permitir cancelamento
      });

      // ✅ Remover controller da lista após completar
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== abortController);
      setActiveRequestsCount(abortControllersRef.current.length);

      console.log('📥 [generateSitePreview] Status da resposta:', response.status, response.ok);
      
      const data = await response.json();
      console.log('📥 [generateSitePreview] Dados da resposta:', data);

      if (response.ok && data.ok) {
        console.log('✅ [generateSitePreview] Site gerado com sucesso!');
        const previewId = data.previewId || conversationId || data.versionId || 'preview';
        console.log('🆔 [generateSitePreview] Preview ID:', previewId);
        setCurrentSiteCode(previewId);
        
        const fullPrompt = initialData.additionalPrompt || prompt;
        const promptDisplay = fullPrompt.length > 500
          ? `${fullPrompt.substring(0, 500)}... (${fullPrompt.length - 500} caracteres restantes)`
          : fullPrompt;
        
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

        setMessages(prev => [...prev, previewMessage]);
      }
    } catch (error: any) {
      // ✅ Remover controller da lista mesmo em caso de erro
      abortControllersRef.current = abortControllersRef.current.filter(c => c !== abortController);
      setActiveRequestsCount(abortControllersRef.current.length);
      
      // ✅ Se foi cancelado, não mostrar erro
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.log('ℹ️ Requisição cancelada pelo usuário');
        return;
      }
      
      console.error('❌ Erro ao gerar preview:', error);
      
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
      setIsGenerating(false);
      generationLockRef.current = false; // ✅ Unlock após completar
      setGenerationStartTime(null); // ✅ Limpar tempo de início
      setElapsedTime(0); // ✅ Limpar tempo decorrido
    }
  };

  const modifySite = async (modification: string, imageData?: { imageUrl?: string; fileName?: string }) => {
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
        if (!currentSiteCode && data.previewId) {
          setCurrentSiteCode(data.previewId);
        } else if (data.previewId && currentSiteCode !== data.previewId) {
          setCurrentSiteCode(data.previewId);
        }
        
        const updatedLimits = await canMakeModification(conversationId);
        setModificationsUsed(updatedLimits.modificationsUsed);
        setProjectId(updatedLimits.projectId);
        
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
          metadata: { showEndButton: true } // ✅ Mostrar botão de encerrar após cada modificação
        };

        setMessages(prev => [...prev, updateMessage]);
        
        window.dispatchEvent(new CustomEvent('preview-update', { 
          detail: { siteId: data.previewId || currentSiteCode } 
        }));
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
        console.log('📨 [sendMessage] Enviando mensagem para IA (sem site gerado ainda)...');
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            message: messageToSend,
            stage: 1
          })
        });
        
        const chatData = await chatResponse.json();
        
        if (chatData.success && chatData.response) {
          // Adicionar resposta da IA
          const aiMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: chatData.response,
            timestamp: new Date(),
            type: 'text'
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // ✅ Se a IA indicar que deve gerar preview, gerar agora
          if (chatData.shouldGeneratePreview) {
            console.log('✅ [sendMessage] IA indicou que deve gerar preview. Iniciando geração...');
            await generateSitePreview(messageToSend);
          } else {
            console.log('✅ [sendMessage] IA continua fazendo perguntas. Aguardando mais informações...');
          }
        } else {
          throw new Error(chatData.error || 'Erro ao obter resposta da IA');
        }
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
      <ConsoleBlocker />
      
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
            {messages.map((message) => (
              <motion.div
                key={message.id}
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

          {isLoading && (
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

