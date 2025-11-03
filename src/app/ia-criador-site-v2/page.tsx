'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, Bot, User, ArrowLeft, Globe, CheckCircle, Upload, Loader2, Eye, X } from 'lucide-react';
import Link from 'next/link';
import ProtectedSitePreview from '@/components/ProtectedSitePreview';
import LogoUpload from '@/components/LogoUpload';

interface SiteMessage {
  id: string;
  sender_type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  message_type: 'text' | 'image' | 'options';
  metadata?: {
    sitePreview?: boolean;
    siteCode?: string;
    version?: number;
    hasOptions?: boolean;
    options?: { label: string; value: string }[];
  };
}

interface ConversationState {
  conversationId: string | null;
  stage: number;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

function SiteCriadorV2Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<SiteMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>({
    conversationId: null,
    stage: 1,
    isComplete: false,
    isLoading: false,
    error: null
  });
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [awaitingFormFields, setAwaitingFormFields] = useState(false);
  // ✅ Estado para modal de preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSiteCode, setPreviewSiteCode] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<number>(1);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar conversa com dados da URL
  useEffect(() => {
    const idea = searchParams.get('idea') || '';
    
    if (idea && !conversationState.conversationId) {
      initializeConversation(idea);
    }
  }, [searchParams, conversationState.conversationId]);

  const initializeConversation = async (initialPrompt: string) => {
    setConversationState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialPrompt,
          projectType: 'site'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConversationState({
          conversationId: data.conversationId,
          stage: data.stage,
          isComplete: false,
          isLoading: false,
          error: null
        });
        
        // Primeira mensagem do usuário
        const userMessage: SiteMessage = {
          id: Date.now().toString(),
          sender_type: 'user',
          content: `Quero criar: ${initialPrompt}`,
          timestamp: new Date(),
          message_type: 'text'
        };
        
        // Primeira resposta da IA com opção de logo
        const aiMessage: SiteMessage = {
          id: (Date.now() + 1).toString(),
          sender_type: 'ai',
          content: `Excelente! Um site profissional para ${initialPrompt} é uma ótima ideia! 🌐

Para começarmos, você já tem um logo da sua empresa? Se tiver, pode enviar que vou analisar as cores e estilo para criar um site que combine perfeitamente com sua identidade visual.

Se não tiver logo, sem problemas! Podemos definir as cores e estilo que você prefere.`,
          timestamp: new Date(),
          message_type: 'text',
          metadata: {
            hasOptions: true,
            options: [
              { label: '📤 Tenho logo (enviar)', value: 'upload_logo' },
              { label: '🎨 Não tenho logo (escolher cores)', value: 'no_logo' }
            ]
          }
        };
        
        setMessages([userMessage, aiMessage]);
      } else {
        throw new Error(data.error || 'Erro ao iniciar conversa');
      }
    } catch (error) {
      console.error('Erro ao inicializar conversa:', error);
      setConversationState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao iniciar conversa. Tente novamente.' 
      }));
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (optionValue === 'upload_logo') {
      setShowLogoUpload(true);
      
      const userMessage: SiteMessage = {
        id: Date.now().toString(),
        sender_type: 'user',
        content: 'Tenho logo, vou enviar',
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage]);
    } else if (optionValue === 'no_logo') {
      const userMessage: SiteMessage = {
        id: Date.now().toString(),
        sender_type: 'user',
        content: 'Não tenho logo',
        timestamp: new Date(),
        message_type: 'text'
      };
      
      const aiMessage: SiteMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        content: `Sem problemas! Vamos criar um visual incrível para seu site.

Que cores você imagina para representar sua empresa? Por exemplo:
• Azul e branco (confiança, profissional)
• Verde e branco (natureza, sustentabilidade)  
• Preto e dourado (elegância, premium)
• Cores específicas da sua preferência

Me diga as cores que você tem em mente! 🎨`,
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
    } else if (optionValue === 'multiple_pages' || optionValue === 'single_page') {
      const message = optionValue === 'multiple_pages' ? 'Diversas páginas' : 'Página única';
      
      const userMessage: SiteMessage = {
        id: Date.now().toString(),
        sender_type: 'user',
        content: message,
        timestamp: new Date(),
        message_type: 'text'
      };
      
      const aiMessage: SiteMessage = {
        id: (Date.now() + 1).toString(),
        sender_type: 'ai',
        content: `Excelente escolha! ${message} ${optionValue === 'multiple_pages' ? 'dão mais profundidade ao site' : 'é mais direto e focado'}.

Agora me diga: quais seções/páginas você quer no seu site? Por exemplo:
• Home (página principal)
• Sobre nós / Quem somos
• Serviços / Produtos
• Contato
• Galeria / Portfólio
• Blog / Notícias

Me diga quais fazem sentido para seu negócio! 📄`,
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
    }
  };

  const handleLogoUploadComplete = (analysis: any) => {
    setShowLogoUpload(false);
    
    const aiMessage: SiteMessage = {
      id: Date.now().toString(),
      sender_type: 'ai',
      content: `✨ **Perfeito! Analisei seu logo:**

🎨 **Identidade Visual:**
• **Cores principais**: ${analysis.colors.dominant.join(', ')}
• **Estilo**: ${analysis.style}
• **Setor**: ${analysis.sector}
• **Transmite**: ${analysis.mood.join(', ')}

${analysis.recommendations.siteStyle}

Agora vamos definir a estrutura! Você prefere:`,
      timestamp: new Date(),
      message_type: 'text',
      metadata: {
        hasOptions: true,
        options: [
          { label: '📄 Diversas páginas', value: 'multiple_pages' },
          { label: '📋 Página única', value: 'single_page' }
        ]
      }
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const generateSite = async () => {
    if (!conversationState.conversationId) return;

    setConversationState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/generate-site-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationState.conversationId
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: SiteMessage = {
          id: Date.now().toString(),
          sender_type: 'ai',
          content: `🎉 **Pronto! Seu site está criado!**

Gerei um site profissional completo baseado em todas suas preferências.
Clique no botão abaixo para ver como ficou:`,
          timestamp: new Date(),
          message_type: 'text',
          metadata: {
            sitePreview: true,
            siteCode: data.siteCode,
            version: data.version
          }
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Erro ao gerar site:', error);
    } finally {
      setConversationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSiteModification = async (modification: string, fields?: string[]) => {
    if (!conversationState.conversationId) return;

    setConversationState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/modify-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationState.conversationId,
          modification,
          specificFields: fields
        })
      });

      const data = await response.json();

      if (data.success) {
        // A API já adiciona a mensagem da IA, só recarregar
        setTimeout(() => {
          window.location.reload(); // Simplificado para o MVP
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao modificar site:', error);
    } finally {
      setConversationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !conversationState.conversationId || conversationState.isLoading) return;

    const userMessage: SiteMessage = {
      id: Date.now().toString(),
      sender_type: 'user',
      content: inputValue,
      timestamp: new Date(),
      message_type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');

    // Detectar se o usuário completou informações para gerar site
    if (messageToSend.toLowerCase().includes('home') || 
        messageToSend.toLowerCase().includes('sobre') ||
        messageToSend.toLowerCase().includes('serviços') ||
        messageToSend.toLowerCase().includes('contato')) {
      
      const aiMessage: SiteMessage = {
        id: Date.now().toString(),
        sender_type: 'ai',
        content: `Perfeito! Com essas informações já posso criar seu site.

Vou gerar um layout profissional com:
${messageToSend}

Um momento... 🔨`,
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Gerar site após 2 segundos
      setTimeout(() => {
        generateSite();
      }, 2000);
    } else {
      // Resposta genérica da IA
      const aiMessage: SiteMessage = {
        id: Date.now().toString(),
        sender_type: 'ai',
        content: `Entendi! ${messageToSend}

Vamos continuar construindo seu site. Preciso de mais alguns detalhes para criar algo perfeito para você.`,
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-400" />
                  Criador de Sites IA
                </h1>
                <p className="text-sm text-slate-400">
                  Gere sites reais funcionando com IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Chat Interface - Apenas chat, sem preview lateral */}
        <div className="glass rounded-2xl h-[calc(100vh-200px)] sm:h-[700px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[92%] sm:max-w-[85%] ${
                    message.sender_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender_type === 'ai' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                        : 'bg-slate-600 text-slate-200'
                    }`}>
                      {message.sender_type === 'ai' ? <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>
                    <div className={`p-3 sm:p-4 rounded-2xl ${
                      message.sender_type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words">{message.content}</div>
                      
                      {/* Botão para ver preview quando site for criado */}
                      {message.metadata?.sitePreview && message.metadata.siteCode && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setPreviewSiteCode(message.metadata!.siteCode!);
                              setPreviewVersion(message.metadata!.version || 1);
                              setShowPreviewModal(true);
                            }}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                          >
                            <Eye className="w-5 h-5" />
                            <span>👁️ Ver Preview do Site</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Renderizar opções clicáveis */}
                      {message.metadata?.hasOptions && message.metadata.options && (
                        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                          {message.metadata.options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOptionClick(option.value)}
                              className="px-3 py-2 sm:px-4 sm:py-2 bg-cyan-600 hover:bg-cyan-700 rounded-full text-xs sm:text-sm font-medium transition-colors min-h-[36px]"
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 ${
                        message.sender_type === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {conversationState.isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-700 p-4 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-slate-400 text-sm">IA está trabalhando...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Upload de Logo */}
          {showLogoUpload && conversationState.conversationId && (
            <div className="border-t border-slate-600 p-4">
              <LogoUpload 
                conversationId={conversationState.conversationId}
                onUploadComplete={handleLogoUploadComplete}
              />
            </div>
          )}

          {/* Botões rápidos para modificações */}
          {messages.some(m => m.metadata?.sitePreview) && (
            <div className="border-t border-slate-600 p-4">
              <p className="text-slate-300 text-sm mb-3">Modificações rápidas:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSiteModification('Adicionar botão flutuante do WhatsApp')}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  disabled={conversationState.isLoading}
                >
                  + WhatsApp
                </button>
                <button
                  onClick={() => handleSiteModification('Adicionar formulário de contato com campos: Nome, Email, Telefone, Mensagem')}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  disabled={conversationState.isLoading}
                >
                  + Formulário
                </button>
                <button
                  onClick={() => handleSiteModification('Adicionar botão de cadastro online (apenas visual)')}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                  disabled={conversationState.isLoading}
                >
                  + Cadastro
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-600 p-3 sm:p-4">
            <div className="flex items-end space-x-2 sm:space-x-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Digite sua resposta..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none min-h-[44px]"
                rows={1}
                disabled={conversationState.isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || conversationState.isLoading}
                className="min-w-[44px] min-h-[44px] p-2.5 sm:p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center"
              >
                {conversationState.isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      {showPreviewModal && previewSiteCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
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
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                <ProtectedSitePreview 
                  siteCodeId={previewSiteCode}
                  version={previewVersion}
                  conversationId={conversationState.conversationId || ''}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ✅ Wrapper com Suspense para useSearchParams
export default function SiteCriadorV2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <SiteCriadorV2Content />
    </Suspense>
  );
}
