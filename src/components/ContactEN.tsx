'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function ContactEN() {
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
    <section id="contact" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            Contact
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-300 max-w-3xl mx-auto"
          >
            We&apos;re ready to transform your idea into reality
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto"
        >
          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      E-mail
                    </h4>
                    <p className="text-slate-300">contact@wzsolution.com</p>
                    <p className="text-slate-400 text-sm">Response within 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      WhatsApp
                    </h4>
                    <p className="text-slate-300">+55 11 99999-9999</p>
                    <p className="text-slate-400 text-sm">24/7 Support</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Address
                    </h4>
                    <p className="text-slate-300">São Paulo, SP - Brazil</p>
                    <p className="text-slate-400 text-sm">Worldwide remote support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <motion.div
              variants={itemVariants}
              className="mt-8 glass rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                Follow us on Social Media
              </h3>
              
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/30 transition-colors duration-300"
                >
                  <Facebook className="w-6 h-6 text-blue-400" />
                </motion.a>
                
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center hover:bg-pink-600/30 transition-colors duration-300"
                >
                  <Instagram className="w-6 h-6 text-pink-400" />
                </motion.a>
                
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors duration-300"
                >
                  <Linkedin className="w-6 h-6 text-blue-400" />
                </motion.a>
                
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center hover:bg-cyan-500/30 transition-colors duration-300"
                >
                  <Twitter className="w-6 h-6 text-cyan-400" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          {/* Map Placeholder */}
          <motion.div variants={itemVariants}>
            <div className="glass rounded-2xl p-8 h-full">
              <h3 className="text-xl font-bold text-white mb-6">
                Our Location
              </h3>
              
              <div className="bg-slate-800/50 rounded-lg h-64 flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Interactive map coming soon
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    São Paulo, SP - Brazil
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-slate-300">In-person service</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-slate-300">Remote consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-slate-300">24/7 technical support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
