'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Code, 
  Palette, 
  MessageSquare, 
  Layout, 
  Component, 
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  Download
} from 'lucide-react';

interface GenerationDecision {
  conversation_id: string;
  initial_prompt: string;
  business_sector: string;
  theme: string;
  objective: string;
  target_audience: string;
  functionalities: string[];
  selected_stack: string;
  tone_of_voice: string;
  color_style: string;
  layout_sections: string[];
  required_components: string[];
  logo_color_dominant: string;
  logo_color_accent: string;
  profile_created_at: string;
  profile_updated_at: string;
}

export default function DecisionsDashboard() {
  const [decisions, setDecisions] = useState<GenerationDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStack, setFilterStack] = useState<string>('all');
  const [filterTheme, setFilterTheme] = useState<string>('all');

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/decisions');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar decisões');
      }
      
      const data = await response.json();
      setDecisions(data.decisions || []);
    } catch (err) {
      console.error('Erro ao buscar decisões:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Conversation ID', 'Stack', 'Tema', 'Objetivo', 'Público', 'Tom', 'Layout'].join(','),
      ...decisions.map(d => [
        d.conversation_id.substring(0, 8),
        d.selected_stack,
        d.theme,
        d.objective,
        d.target_audience,
        d.tone_of_voice,
        d.layout_sections.join(';')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decisions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filtrar decisões
  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = !searchTerm || 
      d.conversation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.selected_stack.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.objective.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStack = filterStack === 'all' || d.selected_stack === filterStack;
    const matchesTheme = filterTheme === 'all' || d.theme === filterTheme;
    
    return matchesSearch && matchesStack && matchesTheme;
  });

  // Estatísticas
  const stats = {
    total: decisions.length,
    stacks: new Set(decisions.map(d => d.selected_stack)).size,
    themes: new Set(decisions.map(d => d.theme)).size,
    avgComponents: decisions.reduce((sum, d) => sum + (d.required_components?.length || 0), 0) / (decisions.length || 1)
  };

  // Stacks únicas para filtro
  const uniqueStacks = Array.from(new Set(decisions.map(d => d.selected_stack))).sort();
  const uniqueThemes = Array.from(new Set(decisions.map(d => d.theme))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando decisões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🧠 Dashboard de Decisões AI
              </h1>
              <p className="text-slate-300">
                Visualize todas as decisões tomadas pelo AI Decision Engine
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchDecisions}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total de Decisões</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-sm">Stacks Diferentes</p>
                  <p className="text-3xl font-bold text-white">{stats.stacks}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <Palette className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-slate-400 text-sm">Temas Únicos</p>
                  <p className="text-3xl font-bold text-white">{stats.themes}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <Component className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Média Componentes</p>
                  <p className="text-3xl font-bold text-white">{stats.avgComponents.toFixed(1)}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filtros */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por ID, stack, tema..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <select
                value={filterStack}
                onChange={(e) => setFilterStack(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas as Stacks</option>
                {uniqueStacks.map(stack => (
                  <option key={stack} value={stack}>{stack}</option>
                ))}
              </select>
              
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos os Temas</option>
                {uniqueThemes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lista de Decisões */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6 text-red-300">
            Erro: {error}
          </div>
        )}

        <div className="space-y-4">
          {filteredDecisions.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-12 border border-slate-700 text-center">
              <p className="text-slate-400 text-lg">
                {decisions.length === 0 
                  ? 'Nenhuma decisão encontrada. Gere alguns sites primeiro!'
                  : 'Nenhuma decisão corresponde aos filtros selecionados.'}
              </p>
            </div>
          ) : (
            filteredDecisions.map((decision, index) => (
              <motion.div
                key={decision.conversation_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Coluna 1: Informações Básicas */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Stack & Info</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-400">Stack Selecionada</p>
                        <p className="text-white font-semibold">{decision.selected_stack}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Empresa/Setor</p>
                        <p className="text-white">{decision.business_sector || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Objetivo</p>
                        <p className="text-white">{decision.objective || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">ID Conversa</p>
                        <p className="text-blue-400 font-mono text-xs">{decision.conversation_id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Design & Layout */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Layout className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">Design & Layout</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-400">Tema Visual</p>
                        <p className="text-white font-semibold">{decision.theme || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Estilo de Cor</p>
                        <p className="text-white">{decision.color_style || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Layout</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.isArray(decision.layout_sections) ? decision.layout_sections.map((section, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                              {section}
                            </span>
                          )) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </div>
                      </div>
                      
                      {decision.logo_color_dominant && (
                        <div>
                          <p className="text-slate-400">Cores do Logo</p>
                          <div className="flex gap-2 mt-1">
                            <div 
                              className="w-6 h-6 rounded-full border border-slate-600"
                              style={{ backgroundColor: decision.logo_color_dominant }}
                              title={decision.logo_color_dominant}
                            />
                            {decision.logo_color_accent && (
                              <div 
                                className="w-6 h-6 rounded-full border border-slate-600"
                                style={{ backgroundColor: decision.logo_color_accent }}
                                title={decision.logo_color_accent}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna 3: Componentes & Voz */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                      <h3 className="text-xl font-bold text-white">Voz & Componentes</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-400">Tom de Voz</p>
                        <p className="text-white font-semibold">{decision.tone_of_voice || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Público-Alvo</p>
                        <p className="text-white">{decision.target_audience || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Componentes</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.isArray(decision.required_components) && decision.required_components.length > 0 ? (
                            decision.required_components.map((comp, i) => (
                              <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                {comp}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">Nenhum específico</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-slate-400">Funcionalidades</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.isArray(decision.functionalities) && decision.functionalities.length > 0 ? (
                            decision.functionalities.map((func, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                {func}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">Nenhuma específica</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 text-xs">Criado em</p>
                        <p className="text-slate-500 text-xs">
                          {decision.profile_created_at 
                            ? new Date(decision.profile_created_at).toLocaleString('pt-BR')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



