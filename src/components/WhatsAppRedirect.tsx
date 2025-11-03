'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Phone, Building, Clock, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';

interface WhatsAppRedirectProps {
  conversationId: string;
  representative: {
    name: string;
    phone: string;
    schedule: string;
  };
  projectSummary: Record<string, unknown>;
  estimate: Record<string, unknown>;
  whatsappMessage: string;
}

export default function WhatsAppRedirect({ 
  conversationId, 
  representative, 
  projectSummary, 
  estimate,
  whatsappMessage 
}: WhatsAppRedirectProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showClientForm, setShowClientForm] = useState(true);
  const [clientData, setClientData] = useState({
    name: projectSummary?.clientInfo?.name || '',
    email: projectSummary?.clientInfo?.email || '',
    phone: projectSummary?.clientInfo?.phone || '',
    company: projectSummary?.clientInfo?.company || ''
  });

  const handleWhatsAppRedirect = async () => {
    setIsRedirecting(true);
    
    try {
      // Finalizar projeto e gerar dados para WhatsApp
      const response = await fetch('/api/finalize-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          clientData
        })
      });

      const data = await response.json();

      if (data.success) {
        // Construir URL do WhatsApp
        const whatsappURL = `https://wa.me/${representative.phone.replace(/\D/g, '')}?text=${data.whatsappMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Feedback visual
        setTimeout(() => {
          setIsRedirecting(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      setIsRedirecting(false);
    }
  };

  const handleSkipForm = () => {
    setShowClientForm(false);
    handleWhatsAppRedirect();
  };

  if (showClientForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Projeto Aprovado! 🎉
          </h3>
          <p className="text-slate-300">
            Para finalizar, vamos te conectar com {representative.name}
          </p>
        </div>

        {/* Resumo do Projeto */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            Resumo do Projeto
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Investimento:</span>
              <div className="text-green-400 font-bold">R$ {estimate?.total?.toLocaleString('pt-BR')}</div>
            </div>
            <div>
              <span className="text-slate-400">Prazo:</span>
              <div className="text-blue-400 font-bold">{estimate?.timeEstimate}</div>
            </div>
          </div>
        </div>

        {/* Formulário de Contato */}
        <div className="space-y-4 mb-6">
          <h4 className="text-white font-semibold flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            Seus Dados (Opcional)
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Seu nome"
              value={clientData.name}
              onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Seu email"
              value={clientData.email}
              onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="WhatsApp"
              value={clientData.phone}
              onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Empresa (opcional)"
              value={clientData.company}
              onChange={(e) => setClientData(prev => ({ ...prev, company: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Informações do Representante */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Phone className="w-5 h-5 mr-2 text-green-400" />
            Seu Consultor
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Nome:</span>
              <span className="text-white font-medium">{representative.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Horário:</span>
              <span className="text-white">{representative.schedule}</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <motion.button
            onClick={handleWhatsAppRedirect}
            disabled={isRedirecting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {isRedirecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span>Falar com Consultor no WhatsApp</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          <button
            onClick={handleSkipForm}
            className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
          >
            Continuar sem preencher dados
          </button>
        </div>

        {/* Informação adicional */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-300 text-sm text-center">
            💡 Todas as informações do seu projeto já foram enviadas para o consultor
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        Redirecionando para WhatsApp...
      </h3>
      <p className="text-slate-400">
        Se não redirecionou automaticamente, clique no link que foi aberto
      </p>
    </motion.div>
  );
}
