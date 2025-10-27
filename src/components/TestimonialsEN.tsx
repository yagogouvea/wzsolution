'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsEN() {
  const testimonials = [
    {
      name: "Carlos Mendes",
      company: "TechCorp Brazil",
      role: "CEO",
      image: "👨‍💼",
      text: "WZ Solution transformed our idea into an incredible app. Extremely competent, attentive professionals who delivered a top-quality product. Highly recommended!",
      rating: 5
    },
    {
      name: "Ana Silva",
      company: "Innovative Startup",
      role: "Founder",
      image: "👩‍💻",
      text: "The website they created exceeded our expectations. The process was very well guided, with on-time deliveries and a professional result that brought many new clients.",
      rating: 5
    },
    {
      name: "Roberto Santos",
      company: "Express E-commerce",
      role: "Commercial Director",
      image: "👨‍💼",
      text: "We needed complex integrations and the WZ Solution team delivered everything perfectly. The system works 24/7 and increased our efficiency by 40%. Excellent work!",
      rating: 5
    },
    {
      name: "Juliana Costa",
      company: "Premium Consulting",
      role: "Partner",
      image: "👩‍💼",
      text: "The mobile app they developed is used daily by our 500+ clients. Intuitive interface, speed, and zero problems. They really understand technology!",
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
              What Our Clients Say
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our clients' satisfaction is our priority
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
              <div className="text-slate-300">Average Rating</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-slate-300">Satisfied Clients</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-slate-300">Projects Delivered</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-slate-300">Support Available</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

