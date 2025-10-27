'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Carlos Mendes",
      company: "TechCorp Brasil",
      role: "CEO",
      image: "👨‍💼",
      text: "A WZ Solution transformou nossa ideia em um app incrível. Profissionais extremamente competentes, atenciosos e que entregaram um produto de altíssima qualidade. Super recomendo!",
      rating: 5
    },
    {
      name: "Ana Silva",
      company: "StartUp Inovadora",
      role: "Fundadora",
      image: "👩‍💻",
      text: "O site que eles criaram superou nossas expectativas. O processo foi muito bem guiado, com entregas no prazo e um resultado profissional que trouxe muitos clientes novos.",
      rating: 5
    },
    {
      name: "Roberto Santos",
      company: "E-commerce Express",
      role: "Diretor Comercial",
      image: "👨‍💼",
      text: "Precisávamos de integrações complexas e a equipe da WZ Solution entregou tudo perfeitamente. O sistema funciona 24/7 e aumentou nossa eficiência em 40%. Excelente trabalho!",
      rating: 5
    },
    {
      name: "Juliana Costa",
      company: "Consultoria Premium",
      role: "Sócia",
      image: "👩‍💼",
      text: "O app mobile que desenvolveram é usado diariamente por nossos 500+ clientes. Interface intuitiva, rapidez e zero problemas. Eles realmente entendem de tecnologia!",
      rating: 5
    }
  ];

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

  return (
    <>
      <section id="testimonials" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              A satisfação dos nossos clientes é nossa prioridade
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass rounded-2xl p-8 relative group cursor-pointer"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                  <Quote className="w-12 h-12 text-cyan-400" />
                </div>

                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-300 leading-relaxed mb-6 relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {testimonial.role} - {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">4.9/5</div>
              <div className="text-slate-300">Avaliação Média</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-slate-300">Clientes Satisfeitos</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-slate-300">Projetos Entregues</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-slate-300">Suporte Disponível</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

