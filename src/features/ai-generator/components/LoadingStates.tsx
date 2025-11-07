'use client';

import { motion } from 'framer-motion';
import { Brain, Search, Palette, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import type { GenerationStatus } from '../types/ai-generator.types';

interface LoadingStatesProps {
  status: GenerationStatus;
}

export default function LoadingStates({ status }: LoadingStatesProps) {
  const steps = [
    {
      key: 'analyzing',
      icon: Brain,
      title: 'Analisando Projeto',
      description: 'IA está compreendendo suas necessidades'
    },
    {
      key: 'generating-wireframes',
      icon: Palette,
      title: 'Criando Wireframes',
      description: 'Gerando estrutura visual das telas'
    },
    {
      key: 'calculating-estimate',
      icon: Calculator,
      title: 'Calculando Estimativas',
      description: 'Definindo prazos e custos realísticos'
    },
    {
      key: 'completed',
      icon: CheckCircle,
      title: 'Concluído',
      description: 'Template gerado com sucesso!'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status.step);
  const isError = status.step === 'error';

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="glass rounded-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4"
          >
            <AlertCircle className="w-8 h-8 text-red-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h3>
          <p className="text-slate-300 mb-4">{status.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Progresso</span>
            <span className="text-cyan-400 font-bold">{status.progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="text-center mb-8">
          <motion.div
            key={status.step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-4"
          >
            {steps.find(step => step.key === status.step) && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                {React.createElement(steps.find(step => step.key === status.step)!.icon, {
                  className: "w-10 h-10 text-white"
                })}
              </motion.div>
            )}
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {steps.find(step => step.key === status.step)?.title}
          </h3>
          <p className="text-slate-300 text-lg">
            {status.message}
          </p>
        </div>

        {/* Steps Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.slice(0, -1).map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : isCompleted
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-slate-600 bg-slate-800/30'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                      isActive
                        ? 'bg-cyan-400/20 text-cyan-400'
                        : isCompleted
                        ? 'bg-green-400/20 text-green-400'
                        : 'bg-slate-600/20 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isActive || isCompleted ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
        >
          <div className="text-center text-slate-300">
            <p className="text-sm">
              💡 <strong>Você sabia?</strong> Nossa IA analisa mais de 100 parâmetros 
              para gerar o template perfeito para seu projeto!
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}







