'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code } from 'lucide-react';
import { useGoogleAnalytics } from '@/components/GoogleAnalytics';

export default function Hero() {
  const { trackEvent } = useGoogleAnalytics();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
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

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
    },
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Transformamos Ideias em{' '}
                <span className="text-gradient">Soluções Digitais</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                Desenvolvimento de sites, aplicativos, softwares e sistemas empresariais sob medida. Tecnologia de ponta para impulsionar seu negócio no mundo digital.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  trackEvent('cta_click', {
                    button_name: 'solicitar_orcamento',
                    location: 'hero_section',
                  });
                  document.getElementById('budget')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary inline-flex items-center justify-center text-lg px-8 py-4"
              >
                Solicitar Orçamento
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  trackEvent('cta_click', {
                    button_name: 'conhecer_servicos',
                    location: 'hero_section',
                  });
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Nossos Serviços
              </motion.button>
            </motion.div>

            {/* Statistics */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">500+</div>
                <div className="text-sm text-slate-400">Projetos Entregues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">98%</div>
                <div className="text-sm text-slate-400">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-sm text-slate-400">Suporte</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Image/Illustration */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mx-auto flex items-center justify-center">
                    <Code className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-slate-300 text-lg">Soluções Digitais</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
