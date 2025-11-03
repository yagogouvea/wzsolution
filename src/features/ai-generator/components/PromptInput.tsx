'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Lightbulb } from 'lucide-react';
import type { ProjectPrompt } from '../types/ai-generator.types';

interface PromptInputProps {
  onSubmit: (prompt: ProjectPrompt) => void;
  isLoading: boolean;
}

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectPrompt['projectType']>('website');

  const examples = [
    {
      type: 'mobile-app' as const,
      text: "App de delivery para restaurantes com pagamento integrado, tracking em tempo real e sistema de avaliações"
    },
    {
      type: 'website' as const,
      text: "Site institucional para clínica médica com agendamento online, prontuário digital e telemedicina"
    },
    {
      type: 'saas' as const,
      text: "Plataforma SaaS de marketing digital com automação de emails, landing pages e analytics avançado"
    },
    {
      type: 'web-app' as const,
      text: "Sistema de gestão financeira para PMEs com controle de estoque, fluxo de caixa e relatórios"
    }
  ];

  const projectTypes = [
    { value: 'mobile-app', label: 'App Mobile', icon: '📱' },
    { value: 'website', label: 'Site Institucional', icon: '🌐' },
    { value: 'web-app', label: 'Web App', icon: '💻' },
    { value: 'saas', label: 'SaaS', icon: '☁️' },
    { value: 'system', label: 'Sistema Personalizado', icon: '⚙️' },
    { value: 'other', label: 'Outro', icon: '🎯' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Por favor, descreva seu projeto');
      return;
    }

    const prompt: ProjectPrompt = {
      description: description.trim(),
      projectType,
    };

    onSubmit(prompt);
  };

  const loadExample = (example: typeof examples[0]) => {
    setDescription(example.text);
    setProjectType(example.type);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Descreva Seu Projeto
          </h2>
          <p className="text-slate-300 text-lg">
            Nossa IA vai analisar e gerar um template completo em segundos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Projeto */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Tipo de Projeto
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setProjectType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    projectType === type.value
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                      : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-white font-semibold mb-3">
              Descreva seu projeto em detalhes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Exemplo: Quero um app de fitness com treinos personalizados, acompanhamento de progresso, gamificação com pontos e rankings, integração com wearables, planos premium..."
              className="w-full h-40 p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
              maxLength={2000}
            />
            <div className="text-right text-sm text-slate-400 mt-1">
              {description.length}/2000 caracteres
            </div>
          </div>

          {/* Botão Submit */}
          <motion.button
            type="submit"
            disabled={isLoading || !description.trim()}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="spinner mr-3" />
                Gerando Template...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-3" />
                Gerar Template com IA
              </>
            )}
          </motion.button>
        </form>

        {/* Exemplos */}
        <div className="mt-8 pt-6 border-t border-slate-600/50">
          <div className="flex items-center text-slate-300 mb-4">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            <span className="font-medium">Exemplos para inspirar:</span>
          </div>
          <div className="grid gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadExample(example)}
                className="text-left p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-200 group"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {projectTypes.find(t => t.value === example.type)?.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200 mb-1 group-hover:text-white">
                      {projectTypes.find(t => t.value === example.type)?.label}
                    </div>
                    <div className="text-sm text-slate-400 group-hover:text-slate-300">
                      {example.text}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}


