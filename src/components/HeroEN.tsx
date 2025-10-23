'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code, Smartphone, Globe } from 'lucide-react';

export default function HeroEN() {
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
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-primary" />
      <div className="absolute inset-0 bg-gradient-secondary" />
      
      {/* Animated Background Elements */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Transform your{' '}
              <span className="text-gradient">ideas</span> into{' '}
              <span className="text-gradient">digital reality</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              We develop innovative digital solutions that drive your business
              into the future. High-quality mobile apps, web apps and institutional websites.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('budget')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary inline-flex items-center text-lg px-8 py-4"
            >
              Request Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-lg px-8 py-4"
            >
              Learn About Services
            </motion.button>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center space-x-8 sm:space-x-12 pt-8"
          >
            <motion.div
              variants={iconVariants}
              className="flex flex-col items-center space-y-2"
            >
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-cyan-400" />
              </div>
              <span className="text-sm text-slate-400">Mobile Apps</span>
            </motion.div>
            
            <motion.div
              variants={iconVariants}
              className="flex flex-col items-center space-y-2"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Web Apps</span>
            </motion.div>
            
            <motion.div
              variants={iconVariants}
              className="flex flex-col items-center space-y-2"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <Code className="w-8 h-8 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">Institutional Sites</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

