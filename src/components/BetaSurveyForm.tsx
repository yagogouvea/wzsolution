'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

interface SurveyAnswers {
  // Dados básicos
  name: string;
  age: string;
  profession: string;
  
  // Conhecimento prévio
  heardAboutAI: 'sim' | 'nao';
  
  // Criação do site
  siteCreated: 'sim' | 'nao';
  problems?: string; // Apenas se siteCreated = 'nao'
  
  // Especificações do prompt
  promptMatched: 'sim' | 'nao';
  promptIssues?: string; // Apenas se promptMatched = 'nao'
  
  // Avaliações (0-5)
  layoutScore: number;
  aestheticsScore: number;
  functionalityScore: number;
  easeOfUseScore: number;
  overallScore: number;
  
  // Questões adicionais
  creationTime: 'muito_rapido' | 'rapido' | 'normal' | 'lento' | 'muito_lento';
  deviceUsed: 'pc' | 'tablet' | 'celular';
  wouldRecommend: number; // 0-10 (NPS)
  featuresMostValued: string[];
  improvements?: string;
}

const FEATURES_OPTIONS = [
  'Interface intuitiva',
  'Geração rápida',
  'Design automático',
  'Customização fácil',
  'Preview em tempo real'
];

export default function BetaSurveyForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<Partial<SurveyAnswers>>({
    layoutScore: 0,
    aestheticsScore: 0,
    functionalityScore: 0,
    easeOfUseScore: 0,
    overallScore: 0,
    wouldRecommend: 5,
    featuresMostValued: []
  });

  const updateField = (field: keyof SurveyAnswers, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    const current = formData.featuresMostValued || [];
    if (current.includes(feature)) {
      updateField('featuresMostValued', current.filter(f => f !== feature));
    } else {
      updateField('featuresMostValued', [...current, feature]);
    }
  };

  const handleNext = () => {
    // Validações por etapa
    if (step === 1) {
      if (!formData.name || !formData.age || !formData.profession || !formData.heardAboutAI) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.siteCreated) {
        alert('Por favor, informe se conseguiu criar o site.');
        return;
      }
      if (formData.siteCreated === 'nao' && !formData.problems?.trim()) {
        alert('Por favor, descreva os problemas encontrados.');
        return;
      }
      // Se não conseguiu criar, encerra aqui
      if (formData.siteCreated === 'nao') {
        handleSubmit();
        return;
      }
    }
    
    if (step === 3) {
      if (!formData.promptMatched) {
        alert('Por favor, informe se o site incluiu suas especificações.');
        return;
      }
      if (formData.promptMatched === 'nao' && !formData.promptIssues?.trim()) {
        alert('Por favor, descreva o que foi solicitado e não foi feito.');
        return;
      }
    }
    
    if (step === 4) {
      if (!formData.layoutScore || !formData.aestheticsScore || !formData.functionalityScore || 
          !formData.easeOfUseScore || !formData.overallScore) {
        alert('Por favor, avalie todos os critérios.');
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/beta-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Erro ao enviar formulário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="glass rounded-2xl p-12 max-w-md text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Obrigado pela sua participação! 🎉
          </h2>
          <p className="text-slate-300 text-lg">
            Sua opinião é muito importante para melhorarmos nosso sistema.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Pesquisa Beta - Criação de Sites com IA
          </h1>
          <p className="text-slate-300">
            Ajude-nos a melhorar! Sua opinião é muito valiosa.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500 w-8' : 'bg-slate-700 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-8"
        >
          <AnimatePresence mode="wait">
            {/* ETAPA 1: Dados Básicos */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Dados Básicos</h2>
                
                <div>
                  <label className="block text-white font-medium mb-2">Nome *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Idade *</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => updateField('age', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                    placeholder="Sua idade"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Profissão *</label>
                  <input
                    type="text"
                    value={formData.profession || ''}
                    onChange={(e) => updateField('profession', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                    placeholder="Sua profissão"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Você já tinha ouvido falar de um sistema de criação de sites utilizando prompts/IA? *
                  </label>
                  <div className="flex space-x-4 mt-3">
                    <button
                      type="button"
                      onClick={() => updateField('heardAboutAI', 'sim')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                        formData.heardAboutAI === 'sim'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5 inline mr-2" />
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('heardAboutAI', 'nao')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                        formData.heardAboutAI === 'nao'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5 inline mr-2" />
                      Não
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: Criação do Site */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Criação do Site</h2>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    Conseguiu realizar a criação do seu site? *
                  </label>
                  <div className="flex space-x-4 mt-3">
                    <button
                      type="button"
                      onClick={() => updateField('siteCreated', 'sim')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                        formData.siteCreated === 'sim'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('siteCreated', 'nao')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                        formData.siteCreated === 'nao'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {formData.siteCreated === 'nao' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <label className="block text-white font-medium mb-2">
                      Quais problemas você identificou? *
                    </label>
                    <textarea
                      value={formData.problems || ''}
                      onChange={(e) => updateField('problems', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none"
                      placeholder="Descreva os problemas encontrados..."
                      rows={4}
                    />
                  </motion.div>
                )}

              </motion.div>
            )}

            {/* ETAPA 3: Especificações do Prompt */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Especificações do Prompt</h2>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    IA incluiu suas especificações do prompt inicial? *
                  </label>
                  <div className="flex space-x-4 mt-3">
                    <button
                      type="button"
                      onClick={() => updateField('promptMatched', 'sim')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                        formData.promptMatched === 'sim'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('promptMatched', 'nao')}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                        formData.promptMatched === 'nao'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {formData.promptMatched === 'nao' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <label className="block text-white font-medium mb-2">
                      Descreva o que você solicitou que não foi feito: *
                    </label>
                    <textarea
                      value={formData.promptIssues || ''}
                      onChange={(e) => updateField('promptIssues', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none"
                      placeholder="Ex: Solicitei um formulário de contato, mas não foi incluído..."
                      rows={4}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ETAPA 4: Avaliações (0-5) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Avaliação - De 0 a 5, qual nota você daria?
                </h2>
                
                {[
                  { key: 'layoutScore' as const, label: 'Layout do site criado', icon: '🎨' },
                  { key: 'aestheticsScore' as const, label: 'Estética/Design visual', icon: '✨' },
                  { key: 'functionalityScore' as const, label: 'Funcionalidades incluídas', icon: '⚙️' },
                  { key: 'easeOfUseScore' as const, label: 'Facilidade de uso do sistema', icon: '👆' },
                  { key: 'overallScore' as const, label: 'Experiência geral', icon: '⭐' }
                ].map(({ key, label, icon }) => (
                  <div key={key}>
                    <label className="block text-white font-medium mb-3">
                      {icon} {label} *
                    </label>
                    <div className="flex items-center justify-between space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => updateField(key, score)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                            formData[key] === score
                              ? 'bg-blue-500 text-white scale-110'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {score === 0 ? '0' : score === 5 ? '5' : score}
                        </button>
                      ))}
                    </div>
                    {formData[key] !== undefined && formData[key] !== 0 && (
                      <div className="mt-2 flex items-center justify-center">
                        {Array.from({ length: formData[key] as number }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* ETAPA 5: Questões Adicionais */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Informações Adicionais</h2>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    Quanto tempo levou para criar o site? *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                    {[
                      { value: 'muito_rapido', label: 'Muito Rápido' },
                      { value: 'rapido', label: 'Rápido' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'lento', label: 'Lento' },
                      { value: 'muito_lento', label: 'Muito Lento' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateField('creationTime', value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.creationTime === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Em qual dispositivo você criou o site? *
                  </label>
                  <div className="flex space-x-4 mt-3">
                    {[
                      { value: 'pc', label: '💻 PC' },
                      { value: 'tablet', label: '📱 Tablet' },
                      { value: 'celular', label: '📱 Celular' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateField('deviceUsed', value)}
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                          formData.deviceUsed === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    De 0 a 10, quanto você recomendaria este sistema para outras pessoas? (NPS) *
                  </label>
                  <div className="mt-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.wouldRecommend || 5}
                      onChange={(e) => updateField('wouldRecommend', parseInt(e.target.value))}
                      className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-sm text-slate-400 mt-1">
                      <span>0</span>
                      <span className="text-xl font-bold text-blue-400">{formData.wouldRecommend || 5}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Quais funcionalidades você mais valorizou? (pode selecionar várias)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {FEATURES_OPTIONS.map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                          formData.featuresMostValued?.includes(feature)
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {formData.featuresMostValued?.includes(feature) && '✓ '}
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ETAPA 6: Melhorias e Comentários */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Sugestões de Melhoria</h2>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    O que poderia ser melhorado ou alguma sugestão de função? (opcional)
                  </label>
                  <textarea
                    value={formData.improvements || ''}
                    onChange={(e) => updateField('improvements', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-none"
                    placeholder="Descreva sugestões de melhorias ou novas funcionalidades..."
                    rows={4}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              Voltar
            </button>
            
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Enviar Pesquisa</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

