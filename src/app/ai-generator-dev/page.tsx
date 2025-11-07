'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain } from 'lucide-react';
import PromptInput from '@/features/ai-generator/components/PromptInput';
import LoadingStates from '@/features/ai-generator/components/LoadingStates';
import { useAIGenerator } from '@/features/ai-generator/hooks/useAIGenerator';

export default function AIGeneratorDevPage() {
  const { isGenerating, status, result, error, generateTemplate, clearResult } = useAIGenerator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-primary/20 rounded-full border border-cyan-400/30"
            >
              <Brain className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-cyan-400 text-sm font-medium">IA Generator • Em Desenvolvimento</span>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Transforme suas{' '}
                <span className="text-gradient">ideias</span> em{' '}
                <span className="text-gradient">templates</span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Descreva seu projeto e nossa IA gerará wireframes, estimativas e stack tecnológica em segundos
              </p>
            </div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
            >
              <div className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Análise Inteligente</h3>
                <p className="text-slate-400 text-sm">IA compreende seu projeto e sugere soluções</p>
              </div>

              <div className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Geração Rápida</h3>
                <p className="text-slate-400 text-sm">Templates completos em menos de 30 segundos</p>
              </div>

              <div className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Estimativas Precisas</h3>
                <p className="text-slate-400 text-sm">Custos e prazos baseados em dados reais</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isGenerating && !result && !error && (
            <PromptInput 
              onSubmit={generateTemplate}
              isLoading={false}
            />
          )}

          {isGenerating && (
            <LoadingStates status={status} />
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-4">Erro na Geração</h3>
                <p className="text-slate-300 mb-6">{error}</p>
                <button
                  onClick={clearResult}
                  className="btn-primary"
                >
                  Tentar Novamente
                </button>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Success Message */}
              <div className="text-center">
                <div className="text-green-400 text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Template Gerado com Sucesso!
                </h3>
                <p className="text-slate-300">
                  Seu projeto: <span className="text-cyan-400 font-semibold">{result.analysis.title}</span>
                </p>
              </div>

              {/* Result Preview */}
              <div className="glass rounded-2xl p-8">
                <h4 className="text-xl font-bold text-white mb-6">Análise do Projeto</h4>
                
                <div className="grid gap-6">
                  <div>
                    <h5 className="font-semibold text-white mb-2">Descrição:</h5>
                    <p className="text-slate-300">{result.analysis.description}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">Funcionalidades Principais:</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">Stack Tecnológica:</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Frontend</div>
                        <div className="text-white font-medium">{result.techStack.frontend}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Backend</div>
                        <div className="text-white font-medium">{result.techStack.backend}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Database</div>
                        <div className="text-white font-medium">{result.techStack.database}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Complexidade</div>
                        <div className="text-white font-medium capitalize">{result.analysis.complexity}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">Estimativa:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          R$ {result.estimate.cost.min.toLocaleString()} - R$ {result.estimate.cost.max.toLocaleString()}
                        </div>
                        <div className="text-slate-400">Investimento estimado</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {result.estimate.timeWeeks} semanas
                        </div>
                        <div className="text-slate-400">Prazo de desenvolvimento</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => document.getElementById('budget')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-primary"
                  >
                    Solicitar Orçamento Real
                  </button>
                  <button
                    onClick={clearResult}
                    className="btn-secondary"
                  >
                    Gerar Novo Template
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}







