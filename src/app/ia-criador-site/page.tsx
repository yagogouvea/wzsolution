'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, Bot, User, ArrowLeft, Globe, CheckCircle, Image as ImageIcon, Loader2, Eye, X } from 'lucide-react';
import Link from 'next/link';
import ProtectedSitePreview from '@/components/ProtectedSitePreview';

interface SiteMessage {
  id: string;
  sender_type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  message_type: 'text' | 'image' | 'options';
  metadata?: {
    images?: string[];
    stage?: number;
    isWelcomeMessage?: boolean;
    isLeadCreated?: boolean;
    sitePreview?: boolean;
    siteCode?: string;
    version?: number;
  };
}

interface ConversationState {
  conversationId: string | null;
  stage: number;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

function SiteCriadorPageContent() {
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
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({ name: '', email: '', phone: '', company: '' });
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
        
        // Carregar histórico da conversa
        loadConversationHistory(data.conversationId);
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

  const loadConversationHistory = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        const formattedMessages = data.messages.map((msg: { id: string; sender_type: string; content: string; created_at: string; message_type?: string; metadata?: any }) => ({
          id: msg.id,
          sender_type: msg.sender_type,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          message_type: msg.message_type || 'text',
          metadata: msg.metadata
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stages = [
    { id: 1, name: "Negócio", icon: Globe, color: "text-blue-400" },
    { id: 2, name: "Páginas", icon: Globe, color: "text-green-400" },
    { id: 3, name: "Design", icon: Globe, color: "text-purple-400" },
    { id: 4, name: "Funcionalidades", icon: Globe, color: "text-cyan-400" },
    { id: 5, name: "Conteúdo", icon: Globe, color: "text-orange-400" },
    { id: 6, name: "Finalização", icon: CheckCircle, color: "text-green-400" }
  ];

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
    setConversationState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationState.conversationId,
          message: messageToSend,
          stage: conversationState.stage
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: SiteMessage = {
          id: Date.now().toString(),
          sender_type: 'ai',
          content: data.response,
          timestamp: new Date(),
          message_type: 'text',
          metadata: { stage: data.nextStage }
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationState(prev => ({
          ...prev,
          stage: data.nextStage,
          isComplete: data.conversationComplete,
          isLoading: false
        }));

        // Gerar imagens se necessário
        if (data.shouldGenerateImages) {
          generateImages();
        }

        // Mostrar formulário de lead se conversa completa
        if (data.conversationComplete) {
          setTimeout(() => setShowLeadForm(true), 2000);
        }
      } else {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setConversationState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao enviar mensagem. Tente novamente.' 
      }));
    }
  };

  const generateImages = async () => {
    if (!conversationState.conversationId) return;

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationState.conversationId
        })
      });

      const data = await response.json();

      if (data.success) {
        // As imagens já foram adicionadas como mensagem pela API
        // Recarregar mensagens para mostrar as imagens
        loadConversationHistory(conversationState.conversationId);
      }
    } catch (error) {
      console.error('Erro ao gerar imagens:', error);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationState.conversationId) return;

    try {
      const response = await fetch('/api/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationState.conversationId,
          ...leadFormData
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowLeadForm(false);
        // Recarregar mensagens para mostrar mensagem de agradecimento
        loadConversationHistory(conversationState.conversationId);
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    }
  };




  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getProgressPercentage = () => {
    return Math.round((conversationState.stage / 6) * 100);
  };

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
                  Criador de Sites
                </h1>
                <p className="text-sm text-slate-400">
                  IA especializada em sites institucionais
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-medium text-white">{getProgressPercentage()}%</div>
                <div className="text-xs text-slate-400">Completo</div>
              </div>
              
            {conversationState.isComplete && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                <div className="text-green-300 text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Projeto Finalizado
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Progresso do projeto</span>
            <span className="text-blue-400 font-bold">{getProgressPercentage()}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = conversationState.stage >= stage.id;
              const isCurrent = conversationState.stage === stage.id;
              
              return (
                <div key={stage.id} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center ${
                    isActive ? stage.color : 'text-slate-500'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive 
                        ? `${stage.color} border-current bg-current/20` 
                        : 'text-slate-500 border-slate-600'
                    } ${isCurrent ? 'ring-2 ring-current ring-opacity-50' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-1 text-center">{stage.name}</span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      conversationState.stage > stage.id ? 'bg-green-400' : 'bg-slate-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Interface - Apenas chat, sem preview lateral */}
        <div className="glass rounded-2xl h-[calc(100vh-280px)] sm:h-[600px] flex flex-col">
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
                          
                          {/* Renderizar imagens se existirem */}
                          {message.metadata?.images && message.metadata.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {message.metadata.images.map((imgSrc, imgIndex) => (
                                <motion.img
                                  key={imgIndex}
                                  src={imgSrc}
                                  alt={`Generated project idea ${imgIndex + 1}`}
                                  className="w-full h-auto rounded-lg object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2 * imgIndex }}
                                  onClick={() => window.open(imgSrc, '_blank')}
                                />
                              ))}
                            </div>
                          )}

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
                        <span className="text-slate-400 text-sm">IA está pensando...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-600 p-3 sm:p-4">
            <div className="flex items-end space-x-2 sm:space-x-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua resposta..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none min-h-[44px]"
                rows={1}
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
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
export default function SiteCriadorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <SiteCriadorPageContent />
    </Suspense>
  );
}
