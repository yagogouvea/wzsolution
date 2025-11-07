'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, HeadphonesIcon } from 'lucide-react';

export default function WhyChooseUs() {
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

  const benefits = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Código limpo, criptografia SSL, proteção LGPD e backups automáticos em todos os projetos.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Zap,
      title: 'Entrega Rápida',
      description: 'Metodologia ágil com entregas parciais. Sites em até 15 dias, sistemas personalizados em até 60 dias.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte Vitalício',
      description: 'Equipe dedicada 24/7, atualizações gratuitas por 12 meses e documentação técnica completa.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
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
            Por Que Escolher a WZ Solutions?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            Excelência técnica aliada ao atendimento humanizado
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}






