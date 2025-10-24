'use client';

import { motion } from 'framer-motion';
import { Smartphone, Globe, Code, Zap, Brain } from 'lucide-react';

export default function AboutEN() {
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
      title: 'Mobile App Development',
      description: 'Native and hybrid apps for iOS and Android with optimized performance and modern design.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
    },
    {
      key: 'web',
      icon: Globe,
      title: 'Web Development',
      description: 'Responsive and scalable web apps with the most modern technologies on the market.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      key: 'sites',
      icon: Code,
      title: 'Institutional Website Creation',
      description: 'Elegant corporate websites optimized for conversion and SEO.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
    },
    {
      key: 'custom',
      icon: Zap,
      title: 'Custom Solutions',
      description: 'Tailored development to meet specific business needs.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      key: 'ai',
      icon: Brain,
      title: 'AI Projects',
      description: 'Integration of artificial intelligence into your projects for automation, data analysis and intelligent decision making.',
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
              We are a company specialized in software development, focused on creating innovative digital solutions that transform ideas into reality. With years of market experience, our team combines creativity and technology to deliver high-quality products.
            </p>
            
            <p className="text-lg text-slate-400 leading-relaxed">
              Our mission is to democratize access to technology, offering personalized solutions that meet the specific needs of each client, from startups to large corporations.
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
            <div className="text-slate-300">Projects Delivered</div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2">3+</div>
            <div className="text-slate-300">Years of Experience</div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-slate-300">Satisfied Clients</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

