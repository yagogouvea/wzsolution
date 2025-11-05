'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Smartphone, Globe, ShoppingCart, Building2, Monitor, LogIn } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
// Removido FullscreenChat - agora usando página dedicada

export default function AIGeneratorSection() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('');
  const [idea, setIdea] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Chat agora é uma página dedicada, não precisa mais de estado modal

  const projectTypes = [
    { 
      id: 'site', 
      label: 'Site', 
      icon: Globe, 
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      description: 'Site institucional',
      available: true
    },
    { 
      id: 'app', 
      label: 'App', 
      icon: Smartphone, 
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      description: 'App mobile',
      available: false
    },
    { 
      id: 'webapp', 
      label: 'Web App', 
      icon: Monitor, 
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30',
      description: 'Aplicação web',
      available: false
    },
    { 
      id: 'ecommerce', 
      label: 'E-commerce', 
      icon: ShoppingCart, 
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      description: 'Loja online',
      available: false
    },
    { 
      id: 'sistema', 
      label: 'Sistema', 
      icon: Building2, 
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      description: 'Sistema empresarial',
      available: false
    }
  ];

  useEffect(() => {
    // Verificar se usuário está logado
    console.log('🔐 [AIGenerator] Verificando autenticação...');
    
    // ✅ Timeout de segurança para garantir que checkingAuth seja false
    const timeoutId = setTimeout(() => {
      console.log('⏱️ [AIGenerator] Timeout de segurança - definindo checkingAuth como false');
      setCheckingAuth(false);
    }, 3000); // 3 segundos máximo
    
    getCurrentUser()
      .then(currentUser => {
        console.log('🔐 [AIGenerator] Usuário:', currentUser ? currentUser.email : 'não logado');
        setUser(currentUser);
        setCheckingAuth(false);
        clearTimeout(timeoutId);
      })
      .catch((error) => {
        console.error('❌ [AIGenerator] Erro ao verificar usuário:', error);
        setCheckingAuth(false);
        clearTimeout(timeoutId);
      });
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = () => {
    console.log('🚀 [AIGenerator] handleSubmit chamado', {
      selectedType,
      ideaLength: idea.trim().length,
      user: user ? user.email : 'não logado',
      checkingAuth
    });

    // ✅ BLOQUEAR se ainda está verificando autenticação
    if (checkingAuth) {
      console.log('⏳ [AIGenerator] Ainda verificando autenticação, aguarde...');
      alert('Aguarde, estamos verificando sua autenticação...');
      return;
    }

    if (!selectedType || !idea.trim()) {
      alert('Selecione o tipo de projeto e descreva sua ideia');
      return;
    }
    
    if (selectedType !== 'site') {
      alert('Esta funcionalidade estará disponível em breve! 🚀\nPor enquanto, estamos focando em sites institucionais.');
      return;
    }

    // ✅ BLOQUEAR se usuário não está logado
    if (!user) {
      console.log('🔐 [AIGenerator] Usuário não logado, redirecionando para login...');
      alert('Você precisa estar logado para criar um site. Redirecionando para login...');
      
      // Salvar dados do formulário no sessionStorage para usar após login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_site_creation', JSON.stringify({
          selectedType,
          idea,
          companyName: idea.split('para')[1]?.trim() || 'Meu Negócio',
          businessSector: 'A definir'
        }));
      }
      // Redirecionar para login
      router.push('/login?redirect=create-site');
      return;
    }

    console.log('✅ [AIGenerator] Usuário logado, criando site...');

    // ✅ Redirecionar IMEDIATAMENTE para evitar travamento na página inicial
    // Preparar dados básicos para o chat
    const basicData = {
      companyName: idea.split('para')[1]?.trim() || 'Meu Negócio',
      businessSector: 'A definir',
      additionalPrompt: idea,
      projectType: selectedType
    };
    
    // Gerar conversationId
    const newConversationId = crypto.randomUUID();
    
    // ✅ Sempre salvar dados completos no sessionStorage primeiro
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`chat_data_${newConversationId}`, JSON.stringify(basicData));
        // ✅ Também salvar prompt separadamente se for muito longo
        if (idea.length > 500) {
          sessionStorage.setItem(`prompt_${newConversationId}`, idea);
        }
      } catch (storageError) {
        console.error('❌ Erro ao salvar no sessionStorage:', storageError);
        // Continuar mesmo se falhar - tentar passar via URL como fallback
      }
    }
    
    // ✅ Construir URL SEM o prompt se for muito longo (evitar problemas de serialização)
    const MAX_URL_PROMPT_LENGTH = 500;
    const shouldIncludePromptInUrl = idea.length <= MAX_URL_PROMPT_LENGTH;
    
    const queryParams = new URLSearchParams({
      companyName: basicData.companyName,
      businessSector: basicData.businessSector
    });
    
    // ✅ Só adicionar prompt na URL se for curto o suficiente
    if (shouldIncludePromptInUrl) {
      queryParams.set('prompt', idea);
    }
    
    // ✅ Redirecionar IMEDIATAMENTE - a página de chat mostrará o indicador de "IA pensando"
    const chatUrl = `/chat/${newConversationId}?${queryParams.toString()}`;
    router.push(chatUrl); // ✅ Usar router.push em vez de window.location.href para transição mais suave
  };

  // Função removida - chat agora é página dedicada

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <>
      <section id="ia-site" className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center px-3 py-1 bg-purple-100 rounded-full mb-4">
                  <span className="text-purple-600 text-sm font-medium">🤖 TECNOLOGIA IA</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                  Crie Seu Site com Inteligência Artificial
                </h2>
                <p className="text-lg text-slate-600">
                  Descreva sua ideia e nossa IA gera um site profissional em minutos. Tecnologia de ponta ao seu alcance.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl"
            >
              <div className="space-y-6">
                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descreva seu projeto
                  </label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ex: Preciso de um site para minha clínica odontológica com agendamento online, galeria de tratamentos e blog. Cores azul e branco, design moderno e clean..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    maxLength={2000}
                  />
                </div>

                {/* Type and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Site
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        if (e.target.value !== 'site') {
                          alert('Esta funcionalidade estará disponível em breve! 🚀\nPor enquanto, estamos focando em sites institucionais.');
                          return;
                        }
                        setSelectedType(e.target.value);
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Selecione...</option>
                      <option value="site">Institucional</option>
                      <option value="ecommerce" disabled>E-commerce</option>
                      <option value="landing" disabled>Landing Page</option>
                      <option value="blog" disabled>Blog/Portal</option>
                      <option value="portfolio" disabled>Portfólio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Seu E-mail
                    </label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Mensagem de login necessário */}
                {!checkingAuth && !user && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <LogIn className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">
                          Login necessário
                        </p>
                        <p className="text-xs text-yellow-700">
                          Você precisa estar logado para criar um site. Faça login ou crie uma conta gratuita.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 [AIGenerator] Botão clicado!', { 
                      user: user ? user.email : 'null', 
                      checkingAuth, 
                      selectedType, 
                      ideaLength: idea.trim().length,
                      disabled: !selectedType || !idea.trim() || isAnimating || checkingAuth
                    });
                    
                    // ✅ Verificar novamente antes de permitir
                    if (checkingAuth) {
                      alert('Aguarde, estamos verificando sua autenticação...');
                      return;
                    }
                    
                    if (!user) {
                      alert('Você precisa estar logado para criar um site.');
                      router.push('/login?redirect=create-site');
                      return;
                    }
                    
                    handleSubmit();
                  }}
                  disabled={!selectedType || !idea.trim() || isAnimating || checkingAuth}
                  whileHover={{ scale: selectedType && idea.trim() && !checkingAuth && user ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                >
                  {checkingAuth ? (
                    <>
                      <div className="spinner mr-3" />
                      Verificando...
                    </>
                  ) : isAnimating ? (
                    <>
                      <div className="spinner mr-3" />
                      Gerando...
                    </>
                  ) : !user ? (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Fazer Login para Criar
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Gerar Site com IA
                    </>
                  )}
                </motion.button>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">2min</div>
                  <div className="text-sm text-slate-600">Tempo Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">Personalizável</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">24h</div>
                  <div className="text-sm text-slate-600">Suporte</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
