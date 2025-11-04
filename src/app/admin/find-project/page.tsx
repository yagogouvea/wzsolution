'use client';

import { useState } from 'react';
import { Search, Loader2, ExternalLink, FileCode, Calendar, Building2 } from 'lucide-react';

export default function FindProjectPage() {
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!projectId.trim()) {
      setError('Por favor, insira um ID de projeto');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/find-site-by-project-id?projectId=${projectId.trim()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Site não encontrado');
        setResult(null);
      } else {
        setResult(data);
        setError(null);
      }
    } catch (err) {
      setError('Erro ao buscar site. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="text-blue-400" size={32} />
            Buscar Site por ID do Projeto
          </h1>
          <p className="text-slate-400 mb-6">
            Digite o ID do projeto para localizar e visualizar informações do site gerado
          </p>

          {/* Campo de busca */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: 812156"
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !projectId.trim()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                loading || !projectId.trim()
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Buscando...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Buscar
                </>
              )}
            </button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
              <p className="text-red-200 font-medium">❌ {error}</p>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-6">
              <div className="p-6 bg-green-900/20 border border-green-500/50 rounded-xl">
                <p className="text-green-200 font-semibold text-lg mb-2">
                  ✅ Site encontrado com sucesso!
                </p>
                <p className="text-slate-300">
                  <strong>ID do Projeto:</strong> {result.projectId}
                </p>
                <p className="text-slate-300">
                  <strong>Conversation ID:</strong> {result.conversationId}
                </p>
              </div>

              {/* Informações da Conversa */}
              {result.conversation && (
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileCode className="text-blue-400" size={24} />
                    Informações da Conversa
                  </h2>
                  <div className="space-y-2 text-slate-300">
                    <p><strong>Prompt Inicial:</strong> {result.conversation.initial_prompt || 'N/A'}</p>
                    <p><strong>Tipo de Projeto:</strong> {result.conversation.project_type || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className="capitalize">{result.conversation.status || 'N/A'}</span></p>
                    {result.conversation.created_at && (
                      <p className="flex items-center gap-2">
                        <Calendar size={16} />
                        <strong>Criado em:</strong> {new Date(result.conversation.created_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Informações do Projeto */}
              {result.projectData && (
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Building2 className="text-purple-400" size={24} />
                    Dados do Projeto
                  </h2>
                  <div className="space-y-2 text-slate-300">
                    {result.projectData.company_name && (
                      <p><strong>Empresa:</strong> {result.projectData.company_name}</p>
                    )}
                    {result.projectData.business_type && (
                      <p><strong>Setor:</strong> {result.projectData.business_type}</p>
                    )}
                    {result.projectData.business_objective && (
                      <p><strong>Objetivo:</strong> {result.projectData.business_objective}</p>
                    )}
                    {result.projectData.design_style && (
                      <p><strong>Estilo:</strong> {result.projectData.design_style}</p>
                    )}
                    {result.projectData.design_colors && Array.isArray(result.projectData.design_colors) && (
                      <p><strong>Cores:</strong> {result.projectData.design_colors.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Informações da Versão do Site */}
              {result.siteVersion && (
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Versão do Site
                  </h2>
                  <div className="space-y-3">
                    <div className="text-slate-300">
                      <p><strong>Versão:</strong> {result.siteVersion.version_number}</p>
                      <p><strong>Total de Versões:</strong> {result.totalVersions}</p>
                      {result.siteVersion.created_at && (
                        <p className="flex items-center gap-2">
                          <Calendar size={16} />
                          <strong>Criado em:</strong> {new Date(result.siteVersion.created_at).toLocaleString('pt-BR')}
                        </p>
                      )}
                      {result.siteVersion.modification_description && (
                        <p><strong>Última Modificação:</strong> {result.siteVersion.modification_description}</p>
                      )}
                    </div>
                    
                    {/* Links de acesso */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <a
                        href={result.siteVersion.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink size={18} />
                        Ver Preview
                      </a>
                      <a
                        href={result.siteVersion.chat_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink size={18} />
                        Abrir Chat
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

