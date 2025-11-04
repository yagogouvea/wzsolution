'use client';

import { motion } from 'framer-motion';
import { Smartphone, Globe, Code, Zap, Brain, Building2, Check } from 'lucide-react';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const services = [
    {
      key: 'sites',
      icon: Code,
      title: 'Sites Profissionais',
      description: 'Landing pages, institucionais, e-commerce e portais responsivos com design moderno e otimização SEO.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      features: ['Design Responsivo', 'SEO Otimizado', 'Alta Performance'],
    },
    {
      key: 'mobile',
      icon: Smartphone,
      title: 'Aplicativos Mobile',
      description: 'Apps nativos e híbridos para iOS e Android com interface intuitiva e experiência excepcional.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
      features: ['iOS & Android', 'UX/UI Premium', 'Integração API'],
    },
    {
      key: 'custom',
      icon: Zap,
      title: 'Softwares Personalizados',
      description: 'Desenvolvimento de software sob medida para atender necessidades específicas do seu negócio.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      features: ['Solução Sob Medida', 'Escalável', 'Segurança Avançada'],
    },
    {
      key: 'enterprise',
      icon: Building2,
      title: 'Sistemas Empresariais',
      description: 'ERP, CRM e sistemas de gestão integrados para otimizar processos e aumentar produtividade.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      features: ['Gestão Integrada', 'Relatórios BI', 'Multi-usuário'],
    },
  ];

  return (
    <section id="servicos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4"
          >
            Nossos Serviços
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            Soluções completas em tecnologia para levar seu negócio ao próximo nível
          </motion.p>
        </motion.div>

        {/* Services Grid - 4 Cards como no site gerado */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.key}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 ${service.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-8 h-8 ${service.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {service.title}
                </h3>
                
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                {service.features && (
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600">
                        <Check className={`w-4 h-4 ${service.color} mr-2 flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
