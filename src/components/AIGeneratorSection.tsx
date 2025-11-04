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

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!selectedType || !idea.trim() || isAnimating}
                  whileHover={{ scale: selectedType && idea.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                >
                  {isAnimating ? (
                    <>
                      <div className="spinner mr-3" />
                      Gerando...
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
