'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2, User, Bot, Image as ImageIcon, Monitor, Eye } from 'lucide-react';
import PreviewIframe from './PreviewIframe';
import ConsoleBlocker from './ConsoleBlocker';
import { moderateMessage, getRedirectMessage } from '@/lib/message-moderation';
import { canMakeModification, getWhatsAppUrl, generateProjectId, PROJECT_LIMITS } from '@/lib/project-limits';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'site_preview';
  metadata?: Record<string, unknown>;
  siteCodeId?: string;
}

interface FullscreenChatProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  initialData: {
    companyName: string;
    businessSector: string;
    additionalPrompt: string;
    [key: string]: unknown;
  };
}

export default function FullscreenChat({ 
  isOpen, 
  onClose, 
  conversationId, 
  initialData 
}: FullscreenChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSiteCode, setCurrentSiteCode] = useState<string>('');
  const [conversationInitialized, setConversationInitialized] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File; imageUrl: string } | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [modificationsUsed, setModificationsUsed] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  // ✅ Estado para modal de preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  // ✅ Estado para detectar teclado no mobile
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // ✅ Detectar teclado no mobile e ajustar layout
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = () => {
      // Verificar se é mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      if (isMobile) {
        setIsKeyboardOpen(true);
        // Não fazer scroll automático - deixar o navegador lidar naturalmente
        // O sticky bottom já garante que o input fique visível
      }
    };

    const handleBlur = () => {
      setIsKeyboardOpen(false);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    // Usar visualViewport API se disponível (melhor suporte para teclado)
    if (window.visualViewport) {
      const handleViewportChange = () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (isMobile) {
          const viewportHeight = window.visualViewport.height;
          const windowHeight = window.innerHeight;
          // Se a altura da viewport diminuiu significativamente, o teclado está aberto
          const keyboardIsOpen = viewportHeight < windowHeight * 0.75;
          setIsKeyboardOpen(keyboardIsOpen);
          
          // Não fazer scroll automático - o sticky bottom já resolve
        }
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);

      return () => {
        if (input) {
          input.removeEventListener('focus', handleFocus);
          input.removeEventListener('blur', handleBlur);
        }
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      };
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !conversationInitialized) {
      setConversationInitialized(true);
      initializeConversation();
    }
  }, [isOpen, conversationInitialized]);

  // Verificar limites ao carregar e após modificações
  useEffect(() => {
    if (isOpen && conversationId) {
      checkLimits();
    }
  }, [isOpen, conversationId, currentSiteCode]);

  const checkLimits = async () => {
    try {
      const limits = await canMakeModification(conversationId);
      setProjectId(limits.projectId);
      setModificationsUsed(limits.modificationsUsed);
      setIsBlocked(!limits.allowed);
      
      // Mostrar ID do projeto na primeira vez (após site gerado)
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

  const getBlockedMessage = (projectId: number, modificationsUsed: number): string => {
    const whatsappUrl = getWhatsAppUrl(projectId);
    return `🚫 **Limite de Modificações Gratuitas Atingido**

Você utilizou todas as ${PROJECT_LIMITS.MODIFICATIONS} modificações gratuitas do seu projeto.

📊 **Resumo:**
• Prompt inicial: ✅ Usado
• Modificações: ${modificationsUsed}/${PROJECT_LIMITS.MODIFICATIONS} utilizadas

💼 **Próximos Passos:**

Para continuar desenvolvendo seu site, você pode:

✅ **Adquirir o código fonte completo**
✅ **Solicitar modificações adicionais**
✅ **Implementar ferramentas avançadas** (formulários, integrações, etc.)
✅ **Colocar seu site no ar** (hospedagem e domínio)

🔢 **Seu ID de Projeto:** \`${projectId}\`

Entre em contato com nossa equipe através do WhatsApp e informe este ID. Nossa equipe vai localizar seu projeto e te ajudar com tudo que precisar!

[Contatar Equipe WZ Solution](${whatsappUrl})`;
  };

  const initializeConversation = async () => {
    try {
      // Gerar site automaticamente com o prompt inicial
      await generateSitePreview(initialData.additionalPrompt);
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
    }
  };

  const generateSitePreview = async (prompt: string) => {
    setIsLoading(true);

    // Adicionar mensagem de boas-vindas apenas na primeira vez
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: `🚀 **Bem-vindo ao gerador de sites da WZ Solution!**

Vou criar um site incrível para: **${initialData.companyName}**

Gerando seu site personalizado...`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }

    try {
      const response = await fetch('/api/generate-ai-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          prompt,
          companyName: initialData.companyName,
          businessSector: initialData.businessSector || initialData.businessSector || 'Negócios'
        })
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // ✅ Usar conversationId como preview ID fixo (sempre o mesmo link)
        // A API /preview-html já busca automaticamente a última versão
        const previewId = data.previewId || conversationId || data.versionId || 'preview';
        setCurrentSiteCode(previewId);
        
        // Exibir prompt completo na confirmação (truncar apenas se muito longo para UI)
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

**👆 Veja o preview à direita!** 

Quer fazer alguma modificação? É só me dizer! 🚀`,
          timestamp: new Date(),
          type: 'site_preview',
          siteCodeId: data.versionId || previewId
        };

        setMessages(prev => [...prev, previewMessage]);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar preview:', error);
    } finally {
      setIsLoading(false);
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

    // 🔒 VERIFICAR LIMITES ANTES DE MODIFICAR
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

    try {
      const response = await fetch('/api/modify-ai-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          modification,
          currentVersionId: currentSiteCode,
          imageData: imageData || null // Enviar dados da imagem se houver
        })
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // ✅ MANTER O MESMO PREVIEW ID (não atualizar currentSiteCode nas modificações)
        // Apenas atualizar na primeira geração ou se ainda não tiver preview
        if (!currentSiteCode && data.previewId) {
          setCurrentSiteCode(data.previewId);
        } else if (data.previewId && currentSiteCode !== data.previewId) {
          // Se recebeu um previewId diferente e não tinha um antes, usar o novo
          setCurrentSiteCode(data.previewId);
        }
        // Se já tem currentSiteCode, manter o mesmo (preview será atualizado automaticamente)
        
        // Atualizar contador de modificações após sucesso
        const updatedLimits = await canMakeModification(conversationId);
        setModificationsUsed(updatedLimits.modificationsUsed);
        setProjectId(updatedLimits.projectId);
        
        // Verificar se atingiu limite após esta modificação
        if (!updatedLimits.allowed) {
          setIsBlocked(true);
          
          // Adicionar mensagem de bloqueio após última modificação
          const blockedMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'ai',
            content: getBlockedMessage(updatedLimits.projectId, updatedLimits.modificationsUsed),
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

**👆 Veja as alterações no preview à direita!**

Gostou do resultado? Você pode pedir mais modificações a qualquer momento! 🎨`,
          timestamp: new Date(),
          type: 'site_preview',
          siteCodeId: data.previewId || currentSiteCode // ✅ Usar previewId fixo em vez de versionId
        };

        setMessages(prev => [...prev, updateMessage]);
        
        // ✅ DISPARAR EVENTO PARA ATUALIZAR PREVIEW AUTOMATICAMENTE
        // Isso força o PreviewIframe a recarregar mesmo que o siteId não mude
        window.dispatchEvent(new CustomEvent('preview-update', { 
          detail: { siteId: data.previewId || currentSiteCode } 
        }));
        
        console.log('🔄 [FullscreenChat] Evento preview-update disparado');
      } else {
        throw new Error(data.error || 'Erro ao modificar');
      }
    } catch (error: any) {
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
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Abrir modal para adicionar prompt junto com a imagem
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
    
    // 🔒 VERIFICAR SE ESTÁ BLOQUEADO
    if (isBlocked) {
      const blockedMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(projectId || generateProjectId(conversationId), modificationsUsed),
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
    
    // 🔒 VERIFICAR LIMITES ANTES DE ENVIAR IMAGEM COM PROMPT
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
    
    // 🔒 VALIDAÇÃO E MODERAÇÃO DO PROMPT DA IMAGEM
    const moderation = moderateMessage(promptToSend);
    
    if (!moderation.allowed) {
      // Prompt bloqueado - mostrar aviso
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
    
    // ✅ FECHAR MODAL IMEDIATAMENTE ao iniciar envio (antes de operações assíncronas)
    const imageToSend = pendingImage; // Guardar referência antes de limpar estado
    setPendingImage(null); // Fechar modal imediatamente
    setImagePrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsLoading(true);
    
    try {
      // Adicionar mensagem do usuário com imagem + prompt
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
      
      // Processar modificação com imagem + prompt
      if (currentSiteCode) {
        await modifySite(promptToSend, {
          imageUrl: imageToSend.imageUrl,
          fileName: imageToSend.file.name
        });
      } else {
        // Se não tem site ainda, mostrar mensagem
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

  const sendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend || isLoading) return;

    // 🔒 VERIFICAR SE ESTÁ BLOQUEADO
    if (isBlocked) {
      const blockedMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'ai',
        content: getBlockedMessage(projectId || generateProjectId(conversationId), modificationsUsed),
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, blockedMsg]);
      setInputMessage('');
      return;
    }

    // 🔒 VALIDAÇÃO E MODERAÇÃO DE MENSAGEM
    const moderation = moderateMessage(messageToSend);
    
    if (!moderation.allowed) {
      // Mensagem bloqueada - mostrar aviso
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

    // Buscar última imagem enviada (se houver)
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
      // ✅ CORREÇÃO: Se já tem site gerado, SEMPRE usar modify-ai-site
      if (currentSiteCode) {
        // 🔒 VERIFICAR LIMITES ANTES DE MODIFICAR
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
        
        console.log('🔧 Site já existe, usando modify-ai-site:', messageToSend);
        await modifySite(messageToSend, imageData);
      } else {
        // Só gerar novo site se NÃO tiver site ainda
        console.log('🆕 Primeira geração, usando generate-ai-site');
        await generateSitePreview(messageToSend);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Extrair links markdown [text](url) e transformar em botões
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = linkRegex.exec(content)) !== null) {
      // Adicionar texto antes do link
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(...formatTextWithBreaks(textBefore, key));
        key += textBefore.split('\n').length;
      }

      // Adicionar botão do link
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

    // Adicionar texto restante
    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      parts.push(...formatTextWithBreaks(textAfter, key));
    }

    return parts.length > 0 ? parts : formatTextWithBreaks(content, 0);
  };

  const formatTextWithBreaks = (text: string, startKey: number) => {
    // Processar markdown básico: **texto** para negrito
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const lineKey = startKey + index;
      // Processar negrito **texto**
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const lineParts: (string | JSX.Element)[] = [];
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

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setConversationInitialized(false);
      setIsLoading(false);
      setCurrentSiteCode('');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed inset-0 z-50 bg-slate-900 ${isMinimized ? 'pointer-events-none' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 🔒 Bloquear console na área de conversa */}
      <ConsoleBlocker />
      
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between px-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bot className="text-white" size={24} />
            <div>
              <h1 className="font-bold">IA Generator - {initialData.companyName}</h1>
              <p className="text-sm opacity-80">
                {projectId ? `🔢 ID: ${projectId} • ` : ''}
                {modificationsUsed > 0 ? `${modificationsUsed}/${PROJECT_LIMITS.MODIFICATIONS} modificações` : 'Criando seu site perfeito'}
                {isBlocked && ' • Limite atingido'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content - Only Chat */}
      {!isMinimized && (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
          {/* Chat Area - Full Width */}
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col px-4 min-h-0 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white" size={20} />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-3xl p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-slate-800 text-white border border-slate-700'
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      {formatMessage(message.content)}
                    </div>

                    {/* Renderizar imagens enviadas */}
                    {message.type === 'image' && message.metadata?.imageUrl && (
                      <div className="mt-4">
                        <motion.img
                          src={message.metadata.imageUrl}
                          alt={message.metadata.fileName || 'Imagem enviada'}
                          className="w-full max-w-md h-auto rounded-lg object-cover shadow-lg"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        />
                      </div>
                    )}

                    {/* Botão para ver preview quando site for criado */}
                    {message.type === 'site_preview' && message.siteCodeId && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setCurrentSiteCode(message.siteCodeId!);
                            setShowPreviewModal(true);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-5 h-5" />
                          <span>👁️ Ver Preview do Site</span>
                        </button>
                        {message.siteCodeId && (
                          <a
                            href={`/preview/${message.siteCodeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <Monitor size={16} />
                            Abrir em Nova Aba
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600/50">
                      <span className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-white" size={20} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={20} />
                </div>
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm">IA gerando...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div 
            ref={inputContainerRef}
            className="border-t border-slate-700 p-3 sm:p-6 bg-slate-800/50 z-10 flex-shrink-0"
          >
            <div className="flex gap-2 sm:gap-4">
              {/* Hidden file input */}
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
              
              {/* Image upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 sm:p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Enviar imagem"
              >
                <ImageIcon size={18} className="sm:w-5 sm:h-5" />
              </button>
              
              <div className="flex-1 relative min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isBlocked ? "Limite atingido. Entre em contato para continuar..." : "Digite sua mensagem..."}
                  disabled={isLoading || isBlocked}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors pr-10 sm:pr-12 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading || isBlocked}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base flex-shrink-0 ${
                  inputMessage.trim() && !isLoading && !isBlocked
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">Enviar</span>
                <Send size={18} className="sm:hidden" />
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={cancelImageUpload}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl"
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

                  {/* Preview da imagem */}
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

                  {/* Campo de prompt */}
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
                        if (e.key === 'Enter' && e.ctrlKey) {
                          e.preventDefault();
                          sendImageWithPrompt();
                        }
                      }}
                    />
                    <div className="mt-2 text-xs text-slate-400 space-y-1">
                      <p>💡 <strong>Dica:</strong> Pressione Ctrl+Enter para enviar rapidamente</p>
                      <p>✨ Você pode: adicionar imagem • analisar cores • transcrever texto</p>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelImageUpload}
                      disabled={isLoading}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sendImageWithPrompt}
                      disabled={isLoading}
                      className={`px-6 py-2 rounded-xl font-medium transition-all ${
                        !isLoading
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? 'Enviando...' : 'Enviar Imagem'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Preview */}
      {showPreviewModal && currentSiteCode && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-slate-700"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-400" />
                Preview do Site
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-4 bg-white">
              <PreviewIframe
                siteId={currentSiteCode}
                height="100%"
                className="w-full min-h-[600px]"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-4 shadow-lg cursor-pointer"
             onClick={() => setIsMinimized(false)}>
          <Bot className="text-white" size={24} />
        </div>
      )}
    </motion.div>
  );
}
