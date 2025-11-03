'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Smartphone, Globe, ShoppingCart, Building2, Monitor } from 'lucide-react';
// Removido FullscreenChat - agora usando página dedicada

export default function AIGeneratorSection() {
  const [selectedType, setSelectedType] = useState('');
  const [idea, setIdea] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
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

  const handleSubmit = () => {
    if (!selectedType || !idea.trim()) {
      alert('Selecione o tipo de projeto e descreva sua ideia');
      return;
    }
    
    if (selectedType !== 'site') {
      alert('Esta funcionalidade estará disponível em breve! 🚀\nPor enquanto, estamos focando em sites institucionais.');
      return;
    }

    // Preparar dados básicos para o chat
    const basicData = {
      companyName: idea.split('para')[1]?.trim() || 'Meu Negócio',
      businessSector: 'A definir',
      additionalPrompt: idea,
      projectType: selectedType
    };
    
    // Gerar conversationId
    const newConversationId = crypto.randomUUID();
    
    // Salvar dados no sessionStorage para a página de chat
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`chat_${newConversationId}`, JSON.stringify(basicData));
    }
    
    // Redirecionar para a página de chat
    const chatUrl = `/chat/${newConversationId}?companyName=${encodeURIComponent(basicData.companyName)}&businessSector=${encodeURIComponent(basicData.businessSector)}&prompt=${encodeURIComponent(basicData.additionalPrompt)}`;
    window.location.href = chatUrl;
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
      <section className="py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-primary/20 rounded-full border border-cyan-400/30 mb-6">
                <Brain className="w-5 h-5 text-cyan-400 mr-2" />
                <span className="text-cyan-400 text-sm font-medium">IA de Projetos</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Descreva sua <span className="text-gradient">ideia</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Nossa IA vai conversar com você para detalhar e aperfeiçoar seu projeto
              </p>
            </motion.div>

            {/* Project Types */}
            <motion.div variants={itemVariants} className="mb-8">
              <p className="text-slate-400 mb-4">Que tipo de projeto você tem em mente?</p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {projectTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      onClick={() => {
                        if (!type.available) {
                          alert('Esta funcionalidade estará disponível em breve! 🚀\nPor enquanto, estamos focando em sites institucionais.');
                          return;
                        }
                        setSelectedType(type.id);
                      }}
                      whileHover={{ scale: type.available ? 1.05 : 1.02 }}
                      whileTap={{ scale: type.available ? 0.95 : 0.98 }}
                      className={`relative flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        !type.available 
                          ? 'border-slate-700 bg-slate-800/30 text-slate-600 opacity-60 cursor-not-allowed'
                          : isSelected
                            ? `${type.border} ${type.bg} ${type.color}`
                            : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-2 ${!type.available ? 'text-slate-600' : ''}`} />
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs opacity-75">{type.description}</div>
                      </div>
                      
                      {!type.available && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                          Em breve
                        </div>
                      )}
                      
                      {type.available && type.id === 'site' && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Disponível
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Input */}
            <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-8">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Descreva sua ideia em detalhes... Ex: Site para minha barbearia com agendamento online, galeria de cortes, sistema de avaliações e integração com WhatsApp"
                className="w-full h-32 p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
                maxLength={2000}
              />
              <div className="text-right text-sm text-slate-500 mt-1">
                {idea.length}/2000 caracteres
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants}>
              <motion.button
                onClick={handleSubmit}
                disabled={!selectedType || !idea.trim() || isAnimating}
                whileHover={{ scale: selectedType && idea.trim() ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isAnimating ? (
                  <>
                    <div className="spinner mr-3" />
                    Processando sua ideia...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-3" />
                    Conversar com IA
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Benefits */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  💬
                </div>
                <h4 className="font-semibold text-white mb-2">Conversação Natural</h4>
                <p className="text-sm text-slate-400">A IA faz perguntas inteligentes para entender melhor sua ideia</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  🎨
                </div>
                <h4 className="font-semibold text-white mb-2">Design Personalizado</h4>
                <p className="text-sm text-slate-400">Visual criado exclusivamente para seu negócio</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  📊
                </div>
                <h4 className="font-semibold text-white mb-2">Orçamento Preciso</h4>
                <p className="text-sm text-slate-400">Estimativas realistas de custo, prazo e recursos necessários</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Chat agora é uma página dedicada em /chat/[conversationId] */}
    </>
  );
}
