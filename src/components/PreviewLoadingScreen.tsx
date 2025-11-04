'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewLoadingScreenProps {
  previewStages?: string[];
  onComplete?: () => void;
}

export default function PreviewLoadingScreen({ 
  previewStages = ['Design', 'Cores', 'Código', 'Preview'],
  onComplete 
}: PreviewLoadingScreenProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex(prev => {
        const next = prev + 1;
        if (next >= previewStages.length) {
          clearInterval(interval);
          // Aguardar um pouco antes de chamar onComplete
          setTimeout(() => {
            onComplete?.();
          }, 800);
          return prev;
        }
        return next;
      });
    }, 1200); // Mudança de etapa a cada 1.2s

    return () => clearInterval(interval);
  }, [previewStages.length, onComplete]);

  const progress = ((currentStageIndex + 1) / previewStages.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Conteúdo central */}
      <div className="relative z-10 max-w-2xl w-full px-8 text-center">
        {/* Título principal */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Criando o visual perfeito para sua marca...
        </motion.h2>

        {/* Etapas */}
        <div className="mt-12 space-y-6">
          {previewStages.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isActive || isCompleted ? 1 : 0.4,
                  x: 0
                }}
                className="flex items-center gap-4"
              >
                {/* Ícone/Check */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-slate-700'
                }`}>
                  {isCompleted ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <div className={`w-4 h-4 rounded-full ${
                      isActive ? 'bg-white animate-ping' : 'bg-slate-400'
                    }`} />
                  )}
                </div>

                {/* Nome da etapa */}
                <div className="flex-1 text-left">
                  <motion.h3
                    className={`text-xl md:text-2xl font-semibold transition-colors ${
                      isActive 
                        ? 'text-white' 
                        : isCompleted 
                          ? 'text-green-400' 
                          : 'text-slate-400'
                    }`}
                  >
                    {stage}
                  </motion.h3>
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      className="h-1 bg-blue-500 mt-2 rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Barra de progresso geral */}
        <div className="mt-12">
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <p className="text-slate-400 mt-2 text-sm">
            {Math.round(progress)}% completo
          </p>
        </div>
      </div>
    </div>
  );
}





