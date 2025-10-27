'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const budgetSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email'),
  whatsapp: z.string().min(10, 'WhatsApp must have at least 10 characters'),
  projectType: z.string().min(1, 'Select project type'),
  description: z.string().min(10, 'Description must have at least 10 characters')
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function BudgetEN() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
  });

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Budget data:', data);
    setIsSubmitted(true);
    setIsSubmitting(false);
    reset();
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

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

  if (isSubmitted) {
    return (
      <section id="budget" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            id="mensagem-sucesso"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-12"
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Quote Sent Successfully!
            </h2>
            <p className="text-slate-300 text-lg">
              We received your request and will contact you soon.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="budget" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            Request Your Quote
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-300 max-w-3xl mx-auto"
          >
            Tell us about your project and receive a personalized proposal
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto"
        >
          {/* Form */}
          <motion.div variants={itemVariants} className="glass rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Full name
                </label>
                <input
                  {...register('name')}
                  className="form-input"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="error-message">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  E-mail
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  WhatsApp
                </label>
                <input
                  {...register('whatsapp')}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
                {errors.whatsapp && (
                  <p className="error-message">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Project type
                </label>
                <select {...register('projectType')} className="form-select">
                  <option value="">Select project type</option>
                  <option value="mobile">Mobile App</option>
                  <option value="web">Web App</option>
                  <option value="site">Institutional Site</option>
                  <option value="custom">Custom Solution</option>
                </select>
                {errors.projectType && (
                  <p className="error-message">{errors.projectType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Describe your project
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe your project, objectives and requirements..."
                />
                {errors.description && (
                  <p className="error-message">{errors.description.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Get in Touch
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">E-mail</h4>
                    <p className="text-slate-300">contact@wzsolution.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">WhatsApp</h4>
                    <p className="text-slate-300">+55 11 99999-9999</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Location</h4>
                    <p className="text-slate-300">São Paulo, SP - Brazil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Why choose WZ Solution?
              </h3>
              
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Agile and efficient development</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Specialized technical support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Competitive and transparent pricing</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Quality and delivery guarantee</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}



