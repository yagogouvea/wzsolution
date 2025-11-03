'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Send, Bot, User, ArrowLeft, Download, Calendar, MessageSquare, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ProjectState {
  type: string;
  initialIdea: string;
  features: string[];
  refinements: string[];
  currentStep: 'initial' | 'questions' | 'refinement' | 'completion';
}

function IACreatorPageContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // ✅ Estado para alternar entre Chat e Preview em mobile
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');
  const [projectState, setProjectState] = useState<ProjectState>({
    type: '',
    initialIdea: '',
    features: [],
    refinements: [],
    currentStep: 'initial'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar com dados da URL
  useEffect(() => {
    const type = searchParams.get('type') || '';
    const idea = searchParams.get('idea') || '';
    
    if (type && idea) {
      setProjectState({
        type,
        initialIdea: idea,
        features: [],
        refinements: [],
        currentStep: 'initial'
      });
      
      // Adicionar mensagem inicial do usuário
      const initialMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Quero criar um ${getProjectTypeName(type)}: ${idea}`,
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
      
      // IA responde após um delay
      setTimeout(() => {
        sendAIResponse(type, idea);
      }, 1000);
    }
  }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getProjectTypeName = (type: string) => {
    const names: Record<string, string> = {
      'site': 'Site Institucional',
      'app': 'App Mobile',
      'webapp': 'Web App',
      'ecommerce': 'E-commerce',
      'sistema': 'Sistema Empresarial'
    };
    return names[type] || type;
  };

  const sendAIResponse = async (type: string, idea: string) => {
    setIsTyping(true);
    
    // Simular processamento da IA (aqui seria a chamada real para OpenAI)
    setTimeout(() => {
      const response = generateAIResponse(type, idea, projectState.currentStep);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Atualizar estado do projeto
      setProjectState(prev => ({
        ...prev,
        currentStep: 'questions'
      }));
    }, 2000);
  };

  const generateAIResponse = (type: string, idea: string, step: string) => {
    const responses: Record<string, string> = {
      'site': `Excelente! Um site institucional é uma ótima forma de estabelecer presença digital. 

Vamos detalhar seu projeto:

🎯 **Qual o principal objetivo do site?**
• Gerar leads e contatos
• Mostrar portfólio/serviços  
• Vendas online
• Informações institucionais

📄 **Que páginas você imagina?**
• Home, Sobre, Serviços, Contato (básico)
• Blog, Portfolio, Depoimentos
• Área restrita, Downloads

💼 **Seu negócio:**
• Qual segmento/área de atuação?
• Já tem logo e identidade visual?
• Precisa de integração com redes sociais?

Me conte mais sobre esses pontos para eu criar algo perfeito para você!`,

      'app': `Que ideia fantástica! Apps mobile têm um potencial incrível. 

Vamos estruturar seu aplicativo:

📱 **Plataformas:**
• iOS, Android ou ambos?
• Vai precisar de versão web também?

👥 **Usuários:**
• Quem são os usuários principais?
• Vão fazer cadastro/login?
• Diferentes tipos de usuário?

⚡ **Funcionalidades principais:**
• Quais as 3 funcionalidades mais importantes?
• Precisa funcionar offline?
• Notificações push?
• Compartilhamento social?

🔧 **Integrações:**
• Pagamentos online?
• GPS/mapas?
• Câmera/galeria?
• APIs externas?

Com essas informações vou criar wireframes personalizados!`,

      'webapp': `Perfeito! Web apps são ideais para funcionalidades complexas e acesso multiplataforma.

Vamos definir sua aplicação:

💻 **Tipo de aplicação:**
• Dashboard/painel administrativo
• Sistema de gestão  
• Plataforma colaborativa
• Ferramenta específica

👤 **Usuários e permissões:**
• Quantos usuários simultâneos?
• Diferentes níveis de acesso?
• Gestão de equipes?

📊 **Funcionalidades core:**
• Principais módulos/seções
• Relatórios e gráficos?
• Upload de arquivos?
• Integração com banco de dados

🔗 **Integrações necessárias:**
• APIs externas
• Sistemas existentes
• Ferramentas de terceiros

Vamos criar algo robusto e escalável!`,

      'ecommerce': `Excelente escolha! E-commerce é um mercado em crescimento constante.

Vamos estruturar sua loja:

🛍️ **Produtos:**
• Que tipo de produtos vai vender?
• Quantos produtos inicialmente?
• Produtos físicos, digitais ou ambos?
• Variações (tamanho, cor, etc.)?

💳 **Vendas e pagamento:**
• Formas de pagamento preferidas
• Parcelamento?
• PIX, cartão, boleto?
• Gateway de pagamento (PagSeguro, Mercado Pago?)

📦 **Logística:**
• Como será a entrega?
• Integração com Correios?
• Retirada local?
• Controle de estoque?

🎨 **Experiência:**
• Carrinho de compras
• Área do cliente
• Sistema de cupons/promoções
• Reviews e avaliações

Vamos criar uma loja que converte!`,

      'sistema': `Ótimo! Sistemas empresariais podem transformar a eficiência do negócio.

Vamos mapear suas necessidades:

🏢 **Sobre a empresa:**
• Qual o ramo de atividade?
• Quantos funcionários?
• Processos principais a automatizar?

⚙️ **Funcionalidades necessárias:**
• Gestão de clientes/fornecedores
• Controle financeiro
• Estoque/produtos
• Relatórios gerenciais
• Controle de acesso

🔄 **Integração:**
• Sistemas existentes para integrar?
• Bancos de dados atuais?
• APIs de terceiros?
• Migração de dados?

📱 **Acesso:**
• Desktop, mobile ou ambos?
• Acesso remoto necessário?
• Múltiplas filiais?

Vamos criar um sistema que otimize seus processos!`
    };

    return responses[type] || 'Interessante! Conte-me mais sobre sua ideia para eu ajudar melhor.';
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simular resposta da IA
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Entendi! Isso é muito importante para o projeto. Vou incluir essa funcionalidade no planejamento. Tem mais alguma coisa específica que gostaria de adicionar ou modificar?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">IA Criador</h1>
                <p className="text-sm text-slate-400">
                  {projectState.type && `${getProjectTypeName(projectState.type)} • Desenvolvimento Assistido`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="btn-primary text-sm px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Reunião
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ✅ Mobile: Tabs para alternar entre Chat e Preview */}
        <div className="lg:hidden mb-4 flex bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm">
          <button
            onClick={() => setMobileView('chat')}
            className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              mobileView === 'chat'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              mobileView === 'preview'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">Preview</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className={`lg:col-span-2 ${mobileView === 'chat' ? 'block' : 'hidden lg:block'}`}>
            <div className="glass rounded-2xl h-[calc(100vh-280px)] sm:h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-[80%] ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'ai' 
                            ? 'bg-gradient-primary text-white' 
                            : 'bg-slate-600 text-slate-200'
                        }`}>
                          {message.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-100'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-cyan-100' : 'text-slate-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700 p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-600 p-4">
                <div className="flex items-center space-x-3">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua resposta ou faça uma pergunta..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className="p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Project Preview */}
          <div className={`space-y-6 ${mobileView === 'preview' ? 'block' : 'hidden lg:block'}`}>
            {/* Project Info */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Seu Projeto</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400">Tipo</div>
                  <div className="text-white font-medium">{getProjectTypeName(projectState.type)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400">Ideia Inicial</div>
                  <div className="text-white">{projectState.initialIdea}</div>
                </div>
                
                {projectState.features.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Funcionalidades</div>
                    <div className="flex flex-wrap gap-2">
                      {projectState.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Progresso</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Ideia inicial</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Detalhamento</span>
                  <span className="text-yellow-400">⏳</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Wireframes</span>
                  <span className="text-slate-500">○</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Orçamento</span>
                  <span className="text-slate-500">○</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4 inline mr-2 text-cyan-400" />
                  <span className="text-white">Falar com especialista</span>
                </button>
                <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <Download className="w-4 h-4 inline mr-2 text-green-400" />
                  <span className="text-white">Baixar resumo</span>
                </button>
                <button className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 inline mr-2 text-purple-400" />
                  <span className="text-white">Agendar reunião</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Wrapper com Suspense para useSearchParams
export default function IACreatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <IACreatorPageContent />
    </Suspense>
  );
}


