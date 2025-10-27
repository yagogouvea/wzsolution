'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Quanto custa criar um site ou aplicativo?",
      answer: "O custo varia conforme a complexidade e funcionalidades. Sites institucionais podem variar de R$ 800,00 a R$ 3.000,00. Projetos mais complexos como apps mobile, sistemas e softwares personalizados podem variar a partir de R$ 5.000,00, dependendo da complexidade. Oferecemos orçamento gratuito e personalizado para seu projeto."
    },
    {
      question: "Qual o prazo de entrega de um projeto?",
      answer: "O prazo pode variar de 24 horas até 30 dias, dependendo da complexidade do projeto. Sites simples podem ser entregues em 1-3 dias, enquanto projetos mais complexos como apps e sistemas personalizados podem levar 2-4 meses. Após análise detalhada dos requisitos, definimos um cronograma realista para seu projeto."
    },
    {
      question: "Vocês desenvolvem aplicativos para iOS e Android?",
      answer: "Sim! Desenvolvemos apps nativos para ambas as plataformas, bem como apps híbridos que funcionam nas duas. Escolhemos a melhor tecnologia baseada nas necessidades do seu projeto."
    },
    {
      question: "Vocês oferecem suporte após a entrega?",
      answer: "Sim, oferecemos suporte técnico e manutenção. Incluímos 3 meses de garantia pós-lançamento e oferecemos planos de manutenção mensal para atualizações, correções e melhorias contínuas."
    },
    {
      question: "Como funciona o processo de desenvolvimento?",
      answer: "Nosso processo: 1) Análise de requisitos e planejamento, 2) Design e prototipação, 3) Desenvolvimento com entregas parciais, 4) Testes e ajustes, 5) Lançamento e suporte. Você acompanha tudo com reuniões regulares."
    },
    {
      question: "Vocês trabalham com integração de sistemas?",
      answer: "Sim! Integramos com APIs, sistemas de pagamento, CRMs, ERPs e outras ferramentas. Também desenvolvemos integrações com IA, automação de processos e dashboards de analytics."
    },
    {
      question: "Vocês fazem design UI/UX?",
      answer: "Sim! Nosso time inclui designers especializados que criam interfaces modernas, intuitivas e que oferecem a melhor experiência para seus usuários."
    },
    {
      question: "Que tecnologias vocês usam?",
      answer: "Usamos as mais modernas: React, Next.js, Node.js, Python, Flutter, React Native, TypeScript, e outras. Escolhemos as melhores ferramentas para cada projeto."
    },
    {
      question: "Vocês atendem apenas em São Paulo?",
      answer: "Não! Atendemos clientes em todo Brasil e exterior via videochamadas e ferramentas de colaboração. Já desenvolvemos projetos para empresas de diversos estados."
    },
    {
      question: "Preciso ter conhecimento técnico para trabalhar com vocês?",
      answer: "Não é necessário! Nós guiamos você em todo o processo. Basta ter clareza sobre seus objetivos e necessidades de negócio. Nós cuidamos de toda a parte técnica."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <section id="faq" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Tire suas dúvidas sobre nossos serviços de desenvolvimento de software
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-all duration-200"
                >
                  <span className="text-lg font-semibold text-white pr-8">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ 
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 pb-6">
                    <p className="text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-slate-300 mb-6">
              Não encontrou sua resposta? Entre em contato conosco!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary inline-flex items-center"
            >
              Fale Conosco
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </>
  );
}

