'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, Bot, User, ArrowLeft, Globe, CheckCircle, Upload, Loader2, MessageCircle, Eye, X } from 'lucide-react';
import Link from 'next/link';
import ProtectedSitePreview from '@/components/ProtectedSitePreview';
import LogoUpload from '@/components/LogoUpload';
import WhatsAppRedirect from '@/components/WhatsAppRedirect';

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

function SiteCriadorV3Content() {
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
  const [showWhatsAppRedirect, setShowWhatsAppRedirect] = useState(false);
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
    
    // Simular ID de conversa
    const conversationId = crypto.randomUUID();
    
    setConversationState({
      conversationId,
      stage: 1,
      isComplete: false,
      isLoading: false,
      error: null
    });
    
    // Primeira mensagem do usuário
    const userMessage: SiteMessage = {
      id: crypto.randomUUID(),
      sender_type: 'user',
      content: `Quero criar: ${initialPrompt}`,
      timestamp: new Date(),
      message_type: 'text'
    };
    
    // Primeira resposta da IA com opção de logo
    const aiMessage: SiteMessage = {
      id: crypto.randomUUID(),
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
  };

  const handleOptionClick = async (optionValue: string) => {
    setConversationState(prev => ({ ...prev, isLoading: true }));
    
    const userMessage: SiteMessage = {
      id: crypto.randomUUID(),
      sender_type: 'user',
      content: optionValue === 'upload_logo' ? 'Tenho logo, vou enviar' :
               optionValue === 'no_logo' ? 'Não tenho logo' :
               optionValue === 'multiple_pages' ? 'Diversas páginas' : 
               optionValue === 'single_page' ? 'Página única' : optionValue,
      timestamp: new Date(),
      message_type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Caso especial: upload de logo
    if (optionValue === 'upload_logo') {
      setShowLogoUpload(true);
      setConversationState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    try {
      // 🚀 CHAMADA REAL PARA IA OPENAI!
      console.log('🤖 Chamando IA real (opção)...', {
        conversationId: conversationState.conversationId,
        message: userMessage.content,
        stage: conversationState.stage
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationState.conversationId,
          message: userMessage.content,
          stage: conversationState.stage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro na API de chat');
      }
      
      const data = await response.json();
      
      // Adicionar resposta REAL da IA
      const aiMessage: SiteMessage = {
        id: crypto.randomUUID(),
        sender_type: 'ai',
        content: data.response,
        timestamp: new Date(),
        message_type: 'text',
        metadata: data.metadata
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Atualizar estado da conversa
      setConversationState(prev => ({
        ...prev,
        stage: data.nextStage || prev.stage + 1,
        isComplete: data.conversationComplete || false,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('❌ Erro ao chamar IA (opção):', error);
      
      // Fallback para respostas hardcoded apenas em caso de erro
      let fallbackContent = '';
      
      if (optionValue === 'no_logo') {
        fallbackContent = `Sem problemas! Vamos criar um visual incrível para seu site.

Que cores você imagina para representar sua empresa? Por exemplo:
• Azul e branco (confiança, profissional)
• Verde e branco (natureza, sustentabilidade)  
• Preto e dourado (elegância, premium)

Me diga as cores que você tem em mente! 🎨`;
      } else if (optionValue === 'multiple_pages' || optionValue === 'single_page') {
        const message = optionValue === 'multiple_pages' ? 'Diversas páginas' : 'Página única';
        fallbackContent = `Excelente escolha! ${message} ${optionValue === 'multiple_pages' ? 'dão mais profundidade ao site' : 'é mais direto e focado'}.

Agora me diga: quais seções/páginas você quer no seu site? Por exemplo:
• Home (página principal)
• Sobre nós / Quem somos
• Serviços / Produtos
• Contato

Me diga quais fazem sentido para seu negócio! 📄`;
      }
      
      const errorMessage: SiteMessage = {
        id: crypto.randomUUID(),
        sender_type: 'ai',
        content: fallbackContent || 'Desculpe, houve um erro. Pode tentar novamente?',
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConversationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLogoUploadComplete = (analysis: any) => {
    setShowLogoUpload(false);
    
    const aiMessage: SiteMessage = {
      id: crypto.randomUUID(),
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

  const generateSiteDemo = () => {
    const demoSiteCode = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Empresa - Site Profissional</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1e3a8a; color: white; padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; }
        .nav { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; transition: opacity 0.3s; }
        .nav-links a:hover { opacity: 0.8; }
        .hero { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 8rem 2rem 4rem; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .btn { background: #fbbf24; color: #1e3a8a; padding: 1rem 2rem; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card { background: #f8fafc; padding: 2rem; border-radius: 10px; text-align: center; }
        .footer { background: #1f2937; color: white; padding: 2rem; text-align: center; }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">Minha Empresa</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#contato">Contato</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <h1>Bem-vindo à Minha Empresa</h1>
        <p>Soluções profissionais para seu negócio crescer</p>
        <button class="btn">Fale Conosco</button>
    </section>

    <section class="section" id="sobre">
        <h2>Sobre Nós</h2>
        <p>Somos uma empresa comprometida em oferecer os melhores serviços...</p>
    </section>

    <section class="section" id="servicos">
        <h2>Nossos Serviços</h2>
        <div class="grid">
            <div class="card">
                <h3>Serviço 1</h3>
                <p>Descrição do serviço oferecido</p>
            </div>
            <div class="card">
                <h3>Serviço 2</h3>
                <p>Descrição do serviço oferecido</p>
            </div>
            <div class="card">
                <h3>Serviço 3</h3>
                <p>Descrição do serviço oferecido</p>
            </div>
        </div>
    </section>

    <footer class="footer" id="contato">
        <h3>Entre em Contato</h3>
        <p>Email: contato@minhaempresa.com | Telefone: (11) 99999-9999</p>
    </footer>
</body>
</html>`;

    const aiMessage: SiteMessage = {
      id: crypto.randomUUID(),
      sender_type: 'ai',
      content: `🎉 **Pronto! Seu site está criado!**

Gerei um site profissional completo baseado em todas suas preferências.

⚠️ **Este é um preview protegido para demonstração**
• Marca d'água de proteção
• Funcionalidades limitadas
• Código fonte protegido

**O site final será entregue:**
• ✅ Sem marca d'água
• ✅ Código fonte completo  
• ✅ Todas funcionalidades
• ✅ Pronto para publicar

**Clique abaixo para ver o preview:**`,
      timestamp: new Date(),
      message_type: 'text',
      metadata: {
        sitePreview: true,
        siteCode: demoSiteCode,
        version: 1
      }
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || conversationState.isLoading) return;
    
    setConversationState(prev => ({ ...prev, isLoading: true }));
    const messageToSend = inputValue;
    setInputValue('');
    
    // Adicionar mensagem do usuário
    const userMessage: SiteMessage = {
      id: crypto.randomUUID(),
      sender_type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      message_type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // 🚀 CHAMADA REAL PARA IA OPENAI!
      console.log('🤖 Chamando IA real...', {
        conversationId: conversationState.conversationId,
        message: messageToSend,
        stage: conversationState.stage
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationState.conversationId,
          message: messageToSend,
          stage: conversationState.stage
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }
      
      const data = await response.json();
      console.log('✅ Resposta da IA:', data);
      
      // Adicionar resposta REAL da IA
      const aiMessage: SiteMessage = {
        id: crypto.randomUUID(),
        sender_type: 'ai',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
        message_type: 'text',
        metadata: data.metadata
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Atualizar estado da conversa
      setConversationState(prev => ({
        ...prev,
        stage: data.nextStage || prev.stage + 1,
        isComplete: data.conversationComplete || false,
        isLoading: false
      }));
      
      // Verificar se deve gerar site
      if (data.shouldGenerateImages || data.conversationComplete) {
        console.log('🎨 Gerando site...');
        setTimeout(() => generateSiteDemo(), 2000);
      }
      
    } catch (error) {
      console.error('❌ Erro ao chamar IA:', error);
      
      // Fallback apenas em caso de erro
      const errorMessage: SiteMessage = {
        id: crypto.randomUUID(),
        sender_type: 'ai',
        content: `🤖 **IA Temporariamente Indisponível**
        
Desculpe, houve um problema temporário com a IA. Mas posso continuar!

**Erro:** ${error instanceof Error ? error.message : 'Erro desconhecido'}

${messageToSend.toLowerCase().includes('páginas') || messageToSend.toLowerCase().includes('seção') ? 
  'Perfeito! Vou criar seu site com essas informações. Gerando agora... ⏳' :
  'Continue me contando mais sobre seu projeto! 🎯'
}`,
        timestamp: new Date(),
        message_type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConversationState(prev => ({ ...prev, isLoading: false }));
      
      // Se mencionou páginas, gerar site mesmo com erro
      if (messageToSend.toLowerCase().includes('páginas') || messageToSend.toLowerCase().includes('seção')) {
        setTimeout(() => generateSiteDemo(), 3000);
      }
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

          {/* Botões rápidos para modificações e aprovação */}
          {messages.some(m => m.metadata?.sitePreview) && !showWhatsAppRedirect && (
            <div className="border-t border-slate-600 p-4">
              <p className="text-slate-300 text-sm mb-3">Modificações rápidas:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => alert('🔧 Modificação aplicada! (Demo)')}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  + WhatsApp
                </button>
                <button
                  onClick={() => alert('📝 Formulário adicionado! (Demo)')}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  + Formulário
                </button>
                <button
                  onClick={() => alert('🔐 Botão de cadastro adicionado! (Demo)')}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                >
                  + Cadastro
                </button>
              </div>
              
              {/* Botão para aprovar projeto */}
              <div className="border-t border-slate-700 pt-4">
                <button
                  onClick={() => setShowWhatsAppRedirect(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>✅ Aprovar Projeto e Falar com Consultor</span>
                </button>
                <p className="text-slate-400 text-xs text-center mt-2">
                  💡 Todas as informações serão enviadas para o consultor
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp Redirect */}
          {showWhatsAppRedirect && conversationState.conversationId && (
            <div className="border-t border-slate-600 p-4">
              <WhatsAppRedirect
                conversationId={conversationState.conversationId}
                representative={{
                  name: 'Consultor WZ Solution',
                  phone: '5511947293221',
                  schedule: 'Segunda à Sexta: 9h às 18h'
                }}
                projectSummary={{
                  clientInfo: {},
                  projectDetails: {
                    type: 'site',
                    initialPrompt: 'Site criado via IA',
                    pages: ['Home', 'Sobre', 'Serviços', 'Contato'],
                    modifications: []
                  }
                }}
                estimate={{
                  total: 2500,
                  timeEstimate: '1-2 semanas'
                }}
                whatsappMessage=""
              />
            </div>
          )}

          {/* Input */}
          {!showWhatsAppRedirect && (
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
          )}
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
export default function SiteCriadorV3() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <SiteCriadorV3Content />
    </Suspense>
  );
}
