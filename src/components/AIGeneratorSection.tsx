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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        
        // ✅ Se usuário acabou de fazer login, recuperar dados pendentes do sessionStorage
        if (currentUser && typeof window !== 'undefined') {
          const pendingData = sessionStorage.getItem('pending_site_creation');
          if (pendingData) {
            try {
              const data = JSON.parse(pendingData);
              console.log('✅ [AIGenerator] Recuperando dados pendentes após login:', data);
              setSelectedType(data.selectedType || '');
              setIdea(data.idea || '');
              // ✅ Remover dados do sessionStorage após recuperar
              sessionStorage.removeItem('pending_site_creation');
            } catch (error) {
              console.error('❌ [AIGenerator] Erro ao recuperar dados pendentes:', error);
            }
          }
        }
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
  
  // ✅ Verificar mudanças na autenticação quando o componente recebe foco novamente
  useEffect(() => {
    const handleFocus = () => {
      // Quando a página recebe foco novamente (usuário voltou do login)
      if (typeof window !== 'undefined' && user) {
        const pendingData = sessionStorage.getItem('pending_site_creation');
        if (pendingData) {
          try {
            const data = JSON.parse(pendingData);
            console.log('✅ [AIGenerator] Dados pendentes encontrados após voltar do login:', data);
            setSelectedType(data.selectedType || '');
            setIdea(data.idea || '');
            sessionStorage.removeItem('pending_site_creation');
          } catch (error) {
            console.error('❌ [AIGenerator] Erro ao recuperar dados pendentes:', error);
          }
        }
      }
    };
    
    // Verificar quando a página recebe foco
    window.addEventListener('focus', handleFocus);
    
    // Verificar imediatamente também (caso já tenha foco)
    handleFocus();
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);
  
  // ✅ Polling para verificar mudanças no sessionStorage (fallback)
  useEffect(() => {
    if (!user) return; // Só fazer polling se usuário estiver logado
    
    const checkPendingData = () => {
      if (typeof window !== 'undefined') {
        const pendingData = sessionStorage.getItem('pending_site_creation');
        if (pendingData) {
          try {
            const data = JSON.parse(pendingData);
            console.log('✅ [AIGenerator] Dados pendentes encontrados via polling:', data);
            setSelectedType(data.selectedType || '');
            setIdea(data.idea || '');
            sessionStorage.removeItem('pending_site_creation');
          } catch (error) {
            console.error('❌ [AIGenerator] Erro ao recuperar dados pendentes:', error);
          }
        }
      }
    };
    
    // Verificar a cada 500ms se há dados pendentes
    const intervalId = setInterval(checkPendingData, 500);
    
    // Verificar imediatamente também
    checkPendingData();
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

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

    // ✅ Ativar estado de loading para mostrar animação ANTES de qualquer outra coisa
    setIsSubmitting(true);
    setIsAnimating(true);
    
    console.log('🎬 [AIGenerator] Animação iniciada, aguardando renderização...');

    // ✅ Preparar dados básicos para o chat
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
    
    // ✅ Construir URL do chat
    const chatUrl = `/chat/${newConversationId}?${queryParams.toString()}`;
    
    // ✅ CRÍTICO: Aguardar um tempo suficiente para a animação aparecer antes de redirecionar
    // Usar requestAnimationFrame para garantir que o DOM foi atualizado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log('⏳ [AIGenerator] Aguardando 800ms para mostrar animação antes de redirecionar...');
        setTimeout(() => {
          console.log('🚀 [AIGenerator] Redirecionando para:', chatUrl);
          router.push(chatUrl);
          // ✅ Manter o estado de loading por mais um pouco para transição suave
          setTimeout(() => {
            setIsSubmitting(false);
            setIsAnimating(false);
          }, 1000);
        }, 800); // ✅ Aumentar delay para 800ms para garantir que a animação seja visível
      });
    });
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
      {/* ✅ Overlay de Loading durante submissão */}
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Preparando seu projeto...
            </h3>
            <p className="text-slate-600 mb-4">
              Estamos redirecionando você para o assistente de IA
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}

      <section id="ia-site" className="py-20 bg-gradient-to-br from-slate-50 to-white relative">
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
                  disabled={!selectedType || !idea.trim() || isAnimating || checkingAuth || isSubmitting}
                  whileHover={{ scale: selectedType && idea.trim() && !checkingAuth && user && !isSubmitting ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center relative overflow-hidden"
                >
                  {checkingAuth ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Verificando...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Preparando...
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
