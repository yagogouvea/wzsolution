'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Phone, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/images/wzlogo_trans.png" 
                alt="WZ Solution Logo" 
                className="h-10 w-auto object-contain"
              />
              <h3 className="text-2xl font-bold text-gradient">
                WZ Solution
              </h3>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              Transformamos ideias em realidade digital através de soluções inovadoras 
              e tecnologia de ponta. Seu parceiro confiável em desenvolvimento de software.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">contact@wzsolutions.com.br</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">+55 11 94729-3221</span>
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-4">Serviços</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#about"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Apps Mobile
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Web Apps
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Sites Institucionais
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Soluções Personalizadas
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#home"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="#budget"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Orçamento
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-slate-300 hover:text-cyan-400 transition-colors duration-300"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-slate-400 text-sm"
            >
              © 2024 WZ Solution. Todos os direitos reservados.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-6 text-sm"
            >
              <Link
                href="#"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-300"
              >
                Política de Privacidade
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-300"
              >
                Termos de Uso
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Back to Top Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 z-40"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      </div>
    </footer>
  );
}
