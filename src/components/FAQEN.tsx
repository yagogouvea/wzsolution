'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQEN() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How much does it cost to create a website or app?",
      answer: "Cost varies based on complexity and features. Institutional websites can start at $600 USD, while apps and more complex systems range from $1,500 to $10,000+ USD. We offer free and personalized quotes for your project."
    },
    {
      question: "What is the delivery time for a project?",
      answer: "Institutional websites: 15-30 days. Mobile apps: 2-4 months. Web apps and systems: 3-6 months. Timeline is determined after detailed analysis of your project requirements."
    },
    {
      question: "Do you develop apps for iOS and Android?",
      answer: "Yes! We develop native apps for both platforms, as well as hybrid apps that work on both. We choose the best technology based on your project's needs."
    },
    {
      question: "Do you offer support after delivery?",
      answer: "Yes, we offer technical support and maintenance. We include 3 months of post-launch warranty and offer monthly maintenance plans for updates, fixes, and continuous improvements."
    },
    {
      question: "How does the development process work?",
      answer: "Our process: 1) Requirements analysis and planning, 2) Design and prototyping, 3) Development with partial deliveries, 4) Testing and adjustments, 5) Launch and support. You follow everything with regular meetings."
    },
    {
      question: "Do you work with system integration?",
      answer: "Yes! We integrate with APIs, payment systems, CRMs, ERPs, and other tools. We also develop integrations with AI, process automation, and analytics dashboards."
    },
    {
      question: "Do you do UI/UX design?",
      answer: "Yes! Our team includes specialized designers who create modern, intuitive interfaces that provide the best experience for your users."
    },
    {
      question: "What technologies do you use?",
      answer: "We use the most modern: React, Next.js, Node.js, Python, Flutter, React Native, TypeScript, and others. We choose the best tools for each project."
    },
    {
      question: "Do you only serve clients in São Paulo?",
      answer: "No! We serve clients throughout Brazil and abroad via video calls and collaboration tools. We have already developed projects for companies from various states and countries."
    },
    {
      question: "Do I need technical knowledge to work with you?",
      answer: "Not necessary! We guide you through the entire process. Just have clarity about your goals and business needs. We take care of all the technical part."
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
            view aprende={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Get answers about our software development services
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
                  className="w-full px-6 py- Chau flex items-center justify-between text-left hover:bg-slate-800/50 transition-all duration-200"
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
            className="mt-undering text-center"
          >
            <p className="text-slate-300 mb-6">
              Didn't find your answer? Contact us!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary inline-flex items-center"
            >
              Contact Us
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

