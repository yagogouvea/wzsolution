'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useGoogleAnalytics } from '@/components/GoogleAnalytics';

export default function CTASection() {
  const { trackEvent } = useGoogleAnalytics();

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Mais de 500 empresas já confiam na WZ Solutions para suas soluções digitais. Seja a próxima história de sucesso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                trackEvent('cta_click', {
                  button_name: 'comecar_agora',
                  location: 'cta_section',
                });
                document.getElementById('budget')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors inline-flex items-center"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
            <motion.a
              href="https://wa.me/5511947293221?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                trackEvent('cta_click', {
                  button_name: 'falar_whatsapp',
                  location: 'cta_section',
                });
              }}
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition-colors inline-flex items-center"
            >
              Falar no WhatsApp
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

