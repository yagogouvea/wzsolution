'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Star, 
  Smartphone,
  Tablet,
  Laptop,
  XCircle,
  CheckCircle
} from 'lucide-react';

interface SurveyResponse {
  id: string;
  name: string;
  age: number;
  profession: string;
  heard_about_ai: boolean;
  site_created: boolean;
  problems?: string;
  prompt_matched?: boolean;
  prompt_issues?: string;
  layout_score?: number;
  aesthetics_score?: number;
  functionality_score?: number;
  ease_of_use_score?: number;
  overall_score?: number;
  creation_time?: string;
  device_used?: string;
  would_recommend?: number;
  features_most_valued?: string[];
  improvements?: string;
  submitted_at: string;
}

interface SurveyStats {
  total: number;
  siteCreated: number;
  siteNotCreated: number;
  avgOverallScore: number;
  avgNPS: number;
  deviceUsage: {
    pc: number;
    tablet: number;
    celular: number;
  };
}

export default function BetaSurveyAdminPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/beta-survey');
      const result = await response.json();
      
      if (result.success) {
        setResponses(result.data || []);
        setStats(result.stats);
      } else {
        setError(result.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      setError('Erro ao conectar com a API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (responses.length === 0) return;
    
    const headers = [
      'ID', 'Nome', 'Idade', 'Profissão', 'Conhecia IA', 
      'Criou Site', 'Problemas', 'Prompt Match', 'Prompt Issues',
      'Layout Score', 'Aesthetics Score', 'Functionality Score', 
      'Ease of Use Score', 'Overall Score', 'Tempo Criação', 
      'Dispositivo', 'NPS (0-10)', 'Funcionalidades Valorizadas', 
      'Melhorias', 'Data Submissão'
    ];
    
    const rows = responses.map(r => [
      r.id,
      r.name,
      r.age || '',
      r.profession,
      r.heard_about_ai ? 'Sim' : 'Não',
      r.site_created ? 'Sim' : 'Não',
      r.problems || '',
      r.prompt_matched === null ? '' : (r.prompt_matched ? 'Sim' : 'Não'),
      r.prompt_issues || '',
      r.layout_score || '',
      r.aesthetics_score || '',
      r.functionality_score || '',
      r.ease_of_use_score || '',
      r.overall_score || '',
      r.creation_time || '',
      r.device_used || '',
      r.would_recommend || '',
      (r.features_most_valued || []).join('; '),
      r.improvements || '',
      new Date(r.submitted_at).toLocaleString('pt-BR')
    ]);
    
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `beta-survey-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCreationTime = (time?: string) => {
    const map: Record<string, string> = {
      'muito_rapido': 'Muito Rápido',
      'rapido': 'Rápido',
      'normal': 'Normal',
      'lento': 'Lento',
      'muito_lento': 'Muito Lento'
    };
    return time ? map[time] || time : 'N/A';
  };

  const formatDevice = (device?: string) => {
    const map: Record<string, string> = {
      'pc': '💻 PC',
      'tablet': '📱 Tablet',
      'celular': '📱 Celular'
    };
    return device ? map[device] || device : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando respostas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={loadResponses}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              📊 Dashboard - Pesquisa Beta
            </h1>
            <p className="text-slate-300">Visualize todas as respostas coletadas</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Respostas</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Sites Criados</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.siteCreated}</p>
                  {stats.total > 0 && (
                    <p className="text-slate-400 text-xs mt-1">
                      {Math.round((stats.siteCreated / stats.total) * 100)}% do total
                    </p>
                  )}
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Nota Média Geral</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">
                    {stats.avgOverallScore.toFixed(1)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">de 5.0</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">NPS Médio</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">
                    {stats.avgNPS.toFixed(1)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">de 10.0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Uso por Dispositivo */}
        {stats && stats.deviceUsage && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Uso por Dispositivo</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Laptop className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.deviceUsage.pc}</p>
                <p className="text-slate-400 text-sm">PC</p>
              </div>
              <div className="text-center">
                <Tablet className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.deviceUsage.tablet}</p>
                <p className="text-slate-400 text-sm">Tablet</p>
              </div>
              <div className="text-center">
                <Smartphone className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.deviceUsage.celular}</p>
                <p className="text-slate-400 text-sm">Celular</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Respostas */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Respostas ({responses.length})
          </h2>
          
          {responses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma resposta encontrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response.id}
                  onClick={() => setSelectedResponse(response)}
                  className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{response.name}</h3>
                        <span className="text-sm text-slate-400">({response.age} anos)</span>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-400">{response.profession}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <span className={response.site_created ? 'text-green-400' : 'text-red-400'}>
                          {response.site_created ? '✅ Criou site' : '❌ Não criou'}
                        </span>
                        {response.overall_score !== null && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {response.overall_score}/5
                          </span>
                        )}
                        {response.would_recommend !== null && (
                          <span>NPS: {response.would_recommend}/10</span>
                        )}
                        {response.device_used && (
                          <span>{formatDevice(response.device_used)}</span>
                        )}
                        {response.creation_time && (
                          <span>Tempo: {formatCreationTime(response.creation_time)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(response.submitted_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {response.improvements && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {response.improvements}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedResponse && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Detalhes da Resposta</h2>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400">Nome</p>
                  <p className="text-white font-medium">{selectedResponse.name}</p>
                </div>
                <div>
                  <p className="text-slate-400">Idade</p>
                  <p className="text-white font-medium">{selectedResponse.age}</p>
                </div>
                <div>
                  <p className="text-slate-400">Profissão</p>
                  <p className="text-white font-medium">{selectedResponse.profession}</p>
                </div>
                <div>
                  <p className="text-slate-400">Conhecia IA</p>
                  <p className="text-white font-medium">
                    {selectedResponse.heard_about_ai ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400 mb-2">Criou Site</p>
                <p className={`font-medium ${selectedResponse.site_created ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedResponse.site_created ? 'Sim' : 'Não'}
                </p>
                {selectedResponse.problems && (
                  <>
                    <p className="text-slate-400 mt-2 mb-1">Problemas Encontrados</p>
                    <p className="text-white">{selectedResponse.problems}</p>
                  </>
                )}
              </div>

              {selectedResponse.site_created && (
                <>
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-slate-400 mb-2">Prompt Match</p>
                    <p className="text-white font-medium">
                      {selectedResponse.prompt_matched === null ? 'N/A' : (selectedResponse.prompt_matched ? 'Sim' : 'Não')}
                    </p>
                    {selectedResponse.prompt_issues && (
                      <>
                        <p className="text-slate-400 mt-2 mb-1">Problemas com Prompt</p>
                        <p className="text-white">{selectedResponse.prompt_issues}</p>
                      </>
                    )}
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-slate-400 mb-2">Avaliações (0-5)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-300 text-xs">Layout</p>
                        <p className="text-white font-medium">{selectedResponse.layout_score ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-300 text-xs">Estética</p>
                        <p className="text-white font-medium">{selectedResponse.aesthetics_score ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-300 text-xs">Funcionalidade</p>
                        <p className="text-white font-medium">{selectedResponse.functionality_score ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-300 text-xs">Facilidade</p>
                        <p className="text-white font-medium">{selectedResponse.ease_of_use_score ?? 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-300 text-xs">Geral</p>
                        <p className="text-white font-medium text-lg">{selectedResponse.overall_score ?? 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-slate-700 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400">Tempo de Criação</p>
                    <p className="text-white font-medium">
                      {formatCreationTime(selectedResponse.creation_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Dispositivo</p>
                    <p className="text-white font-medium">
                      {formatDevice(selectedResponse.device_used)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">NPS (0-10)</p>
                    <p className="text-white font-medium">
                      {selectedResponse.would_recommend ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedResponse.features_most_valued && selectedResponse.features_most_valued.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 mb-2">Funcionalidades Valorizadas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedResponse.features_most_valued.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResponse.improvements && (
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 mb-2">Sugestões de Melhoria</p>
                  <p className="text-white">{selectedResponse.improvements}</p>
                </div>
              )}

              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-400">Data de Submissão</p>
                <p className="text-white">
                  {new Date(selectedResponse.submitted_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

