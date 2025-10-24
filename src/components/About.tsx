'use client';

import { motion } from 'framer-motion';
import { Smartphone, Globe, Code, Zap, Brain } from 'lucide-react';

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
      key: 'mobile',
      icon: Smartphone,
      title: 'Desenvolvimento de Apps Mobile',
      description: 'Apps nativos e híbridos para iOS e Android com performance otimizada e design moderno.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
    },
    {
      key: 'web',
      icon: Globe,
      title: 'Desenvolvimento Web',
      description: 'Web apps responsivos e escaláveis com as mais modernas tecnologias do mercado.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      key: 'sites',
      icon: Code,
      title: 'Criação de Sites Institucionais',
      description: 'Sites corporativos elegantes e otimizados para conversão e SEO.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
    },
    {
      key: 'custom',
      icon: Zap,
      title: 'Soluções Personalizadas',
      description: 'Desenvolvimento sob medida para atender necessidades específicas do seu negócio.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      key: 'ai',
      icon: Brain,
      title: 'Projetos IA',
      description: 'Integração de inteligência artificial em seus projetos para automação, análise de dados e tomada de decisões inteligentes.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            WZ Solution
          </motion.h2>
          
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto space-y-6"
          >
            <p className="text-xl text-slate-300 leading-relaxed">
              Somos uma empresa especializada em desenvolvimento de software, focada em criar soluções digitais inovadoras que transformam ideias em realidade. Com anos de experiência no mercado, nossa equipe combina criatividade e tecnologia para entregar produtos de alta qualidade.
            </p>
            
            <p className="text-lg text-slate-400 leading-relaxed">
              Nossa missão é democratizar o acesso à tecnologia, oferecendo soluções personalizadas que atendem às necessidades específicas de cada cliente, desde startups até grandes corporações.
            </p>
          </motion.div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.key}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className={`glass rounded-2xl p-8 h-full border ${service.borderColor} hover:border-opacity-40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                  <div className={`w-16 h-16 ${service.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-2">50+</div>
            <div className="text-slate-300">Projetos Entregues</div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2">3+</div>
            <div className="text-slate-300">Anos de Experiência</div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-slate-300">Clientes Satisfeitos</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
