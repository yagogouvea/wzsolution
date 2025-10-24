'use client';

import { motion } from 'framer-motion';
import { useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';

const budgetSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string()
    .min(14, 'WhatsApp deve ter o formato (11) 99999-9999')
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido. Use (11) 99999-9999'),
  projectType: z.string().min(1, 'Selecione o tipo de projeto'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres')
});

type BudgetFormData = z.infer<typeof budgetSchema>;

// Função para aplicar máscara de telefone
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// Componente de input com máscara nativa
const MaskedInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
    props.onChange?.(e);
  };

  return (
    <input
      {...props}
      ref={ref}
      onChange={handleChange}
      placeholder="(11) 94729-3221"
      maxLength={15}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';

export default function Budget() {
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
    
    try {
      // Tentar API principal primeiro
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        console.log('API principal funcionou, email enviado com sucesso');
        setIsSubmitted(true);
        reset();
        // Resetar mensagem de sucesso após 5 segundos
        setTimeout(() => setIsSubmitted(false), 5000);
        return;
      }

      // Se der erro 503, usar fallback direto
      if (response.status === 503) {
        console.log('Erro 503 detectado, ativando fallback direto...');
        console.log('API principal falhou com 503, usando fallback direto...');
        
        // Fallback direto - gerar link do WhatsApp
        // const cleanWhatsapp = data.whatsapp.replace(/\D/g, '');
        
        const projectTypeMap: { [key: string]: string } = {
          mobile: 'App Mobile',
          web: 'Web App',
          site: 'Site Institucional',
          custom: 'Solução Personalizada',
          ai: 'Projetos IA',
        };
        
        const projectTypeLabel = projectTypeMap[data.projectType] || data.projectType;
        
        const whatsappMessage = `Olá! Recebi uma nova solicitação de orçamento:

📋 *Dados do Cliente:*
• Nome: ${data.name}
• Email: ${data.email}
• WhatsApp: ${data.whatsapp}
• Tipo de Projeto: ${projectTypeLabel}

📝 *Descrição do Projeto:*
${data.description}

📅 *Data:* ${new Date().toLocaleString('pt-BR')}

Por favor, entre em contato com o cliente para dar continuidade ao orçamento.`;

        const whatsappUrl = `https://wa.me/5511947293221?text=${encodeURIComponent(whatsappMessage)}`;
        
        console.log('Fallback direto - WhatsApp URL gerada:', whatsappUrl);
        console.log('Fallback direto - Executando...');
        
        setIsSubmitted(true);
        reset();
        
        console.log('Fallback direto - Mostrando alerta...');
        // Mostrar mensagem de sucesso com link do WhatsApp
        alert(`Solicitação registrada com sucesso!\n\nNossa equipe entrará em contato via WhatsApp.\n\nClique OK para abrir o WhatsApp.`);
        
        console.log('Fallback direto - Abrindo WhatsApp...');
        window.open(whatsappUrl, '_blank');
        
        console.log('Fallback direto - Configurando timeout...');
        setTimeout(() => setIsSubmitted(false), 5000);
        
        console.log('Fallback direto - Concluído com sucesso!');
        return;
      }

      // Se chegou aqui, houve erro
      const errorData = await response.json();
      console.error('Erro ao enviar email:', errorData);
      
      // Tratamento específico para erro 503 (serviço indisponível)
      if (response.status === 503) {
        alert(`Serviço de email temporariamente indisponível.\n\nEntre em contato conosco diretamente:\n📧 ${errorData.contact?.email || 'contact@wzsolutions.com.br'}\n📱 ${errorData.contact?.whatsapp || '+55 11 94729-3221'}`);
      } else {
        alert(`Erro ao enviar solicitação: ${errorData.error || 'Tente novamente.'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-12"
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Orçamento Enviado com Sucesso!
            </h2>
            <p className="text-slate-300 text-lg">
              Recebemos sua solicitação e entraremos em contato em breve.
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
            Solicite seu Orçamento
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-300 max-w-3xl mx-auto"
          >
            Conte-nos sobre seu projeto e receba uma proposta personalizada
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
                  Nome completo
                </label>
                <input
                  {...register('name')}
                  className="form-input"
                  placeholder="Seu nome completo"
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
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  WhatsApp
                </label>
                <MaskedInput
                  {...register('whatsapp')}
                  className="form-input"
                />
                {errors.whatsapp && (
                  <p className="error-message">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Tipo de projeto
                </label>
                <select {...register('projectType')} className="form-select">
                  <option value="">Selecione o tipo de projeto</option>
                  <option value="mobile">App Mobile</option>
                  <option value="web">Web App</option>
                  <option value="site">Site Institucional</option>
                  <option value="custom">Solução Personalizada</option>
                </select>
                {errors.projectType && (
                  <p className="error-message">{errors.projectType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Descreva seu projeto
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="form-textarea"
                  placeholder="Descreva seu projeto, objetivos e requisitos..."
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
                           Enviando...
                         </>
                       ) : (
                         <>
                           <Send className="w-5 h-5 mr-2" />
                           Enviar Solicitação
                         </>
                       )}
                     </button>
                     
                     {/* Botão de teste do fallback */}
                     <button
                       type="button"
                       onClick={() => {
                         console.log('Testando fallback direto...');
                         const testData = {
                           name: 'Teste Fallback',
                           email: 'teste@teste.com',
                           whatsapp: '(11) 99999-9999',
                           projectType: 'mobile',
                           description: 'Teste do sistema de fallback'
                         };
                         
                         // const cleanWhatsapp = testData.whatsapp.replace(/\D/g, '');
                         const projectTypeMap: { [key: string]: string } = {
                           mobile: 'App Mobile',
                           web: 'Web App',
                           site: 'Site Institucional',
                           custom: 'Solução Personalizada',
                           ai: 'Projetos IA',
                         };
                         const projectTypeLabel = projectTypeMap[testData.projectType] || testData.projectType;
                         
                         const whatsappMessage = `Olá! Recebi uma nova solicitação de orçamento:

📋 *Dados do Cliente:*
• Nome: ${testData.name}
• Email: ${testData.email}
• WhatsApp: ${testData.whatsapp}
• Tipo de Projeto: ${projectTypeLabel}

📝 *Descrição do Projeto:*
${testData.description}

📅 *Data:* ${new Date().toLocaleString('pt-BR')}

Por favor, entre em contato com o cliente para dar continuidade ao orçamento.`;

                         const whatsappUrl = `https://wa.me/5511947293221?text=${encodeURIComponent(whatsappMessage)}`;
                         
                         console.log('Teste fallback - URL:', whatsappUrl);
                         alert('Teste do fallback!\n\nClique OK para abrir o WhatsApp.');
                         window.open(whatsappUrl, '_blank');
                       }}
                       className="w-full mt-2 btn-secondary inline-flex items-center justify-center"
                     >
                       🧪 Testar Fallback
                     </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Entre em Contato
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">E-mail</h4>
                    <p className="text-slate-300">contact@wzsolutions.com.br</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">WhatsApp</h4>
                    <p className="text-slate-300">+55 11 94729-3221</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Por que escolher a WZ Solution?
              </h3>
              
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Desenvolvimento ágil e eficiente</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Suporte técnico especializado</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Preços competitivos e transparentes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Garantia de qualidade e entrega</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
