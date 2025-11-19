'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Plus, 
  Eye, 
  MessageSquare, 
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  Settings,
  Edit2,
  Save,
  X,
  Download,
  Share2,
  Code,
  Shield,
  FileText,
  BarChart3,
  Phone
} from 'lucide-react';
import { getCurrentUser, signOut, supabaseAuth } from '@/lib/auth';
import { DatabaseService } from '@/lib/supabase';
import { generateProjectId, getWhatsAppUrl } from '@/lib/project-limits';
import Link from 'next/link';

interface SiteProject {
  conversationId: string;
  projectId: number;
  projectName?: string;
  companyName?: string;
  businessSector?: string;
  initialPrompt: string;
  createdAt: string;
  status: string;
  hasSite: boolean;
  latestVersion?: number;
}

interface UserProfile {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt?: string;
}

type TabType = 'projects' | 'profile';

export default function ClientePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    company: ''
  });

  useEffect(() => {
    // Verificar autenticação
    getCurrentUser().then(currentUser => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      setProfile({
        email: currentUser.email || '',
        name: currentUser.user_metadata?.name || '',
        phone: currentUser.user_metadata?.phone || '',
        company: currentUser.user_metadata?.company || '',
        createdAt: currentUser.created_at
      });
      setProfileData({
        name: currentUser.user_metadata?.name || '',
        phone: currentUser.user_metadata?.phone || '',
        company: currentUser.user_metadata?.company || ''
      });
      setLoading(false);
      loadUserProjects(currentUser.id);
    });

    // Observar mudanças de autenticação
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const authState = supabaseAuth.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        if (!currentUser) {
          router.push('/login');
        } else {
          setUser(currentUser);
          loadUserProjects(currentUser.id);
        }
      });
      subscription = authState.data.subscription;
    } catch (error) {
      console.warn('Erro ao configurar observador de autenticação:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [router]);

  const loadUserProjects = async (userId: string) => {
    try {
      setLoadingProjects(true);
      
      // Buscar todas as conversas do usuário
      const supabase = DatabaseService.supabase;
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar projetos:', error);
        setLoadingProjects(false);
        return;
      }

      // Para cada conversa, verificar se tem site gerado
      const projectsWithSites: SiteProject[] = [];
      
      for (const conv of conversations || []) {
        const versions = await DatabaseService.getSiteVersions(conv.id);
        const hasSite = versions && versions.length > 0;
        
        if (hasSite) {
          const projectData = await DatabaseService.getProjectData(conv.id);
          
          projectsWithSites.push({
            conversationId: conv.id,
            projectId: generateProjectId(conv.id),
            projectName: (conv as any).project_name || projectData?.company_name || `Site ${conv.id.substring(0, 8)}`,
            companyName: projectData?.company_name || undefined,
            businessSector: projectData?.business_type || undefined,
            initialPrompt: conv.initial_prompt,
            createdAt: conv.created_at,
            status: conv.status,
            hasSite: true,
            latestVersion: versions[versions.length - 1]?.version_number
          });
        }
      }

      setProjects(projectsWithSites);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleRenameProject = async (conversationId: string, newName: string) => {
    if (!newName.trim()) {
      alert('O nome do projeto não pode estar vazio');
      return;
    }

    try {
      await DatabaseService.updateConversation(conversationId, {
        project_name: newName.trim()
      });
      
      // Atualizar na lista local
      setProjects(projects.map(p => 
        p.conversationId === conversationId 
          ? { ...p, projectName: newName.trim() }
          : p
      ));
      
      setEditingProjectId(null);
      setEditingProjectName('');
    } catch (error) {
      console.error('Erro ao renomear projeto:', error);
      alert('Erro ao renomear projeto. Tente novamente.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabaseAuth.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          company: profileData.company
        }
      });

      if (error) throw error;

      setProfile({
        ...profile!,
        name: profileData.name,
        phone: profileData.phone,
        company: profileData.company
      });
      setEditingProfile(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Painel do Cliente</h1>
              <p className="text-slate-400 text-sm mt-1">
                {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/#ia-site"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Criar Novo Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'projects'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Meus Projetos
            </div>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil
            </div>
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'projects' ? (
          <>
            {loadingProjects ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
                <p className="text-slate-400">Carregando seus sites...</p>
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Nenhum site criado ainda
                </h2>
                <p className="text-slate-400 mb-6">
                  Comece criando seu primeiro site com IA!
                </p>
                <Link
                  href="/#ia-site"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Criar Meu Primeiro Site
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Meus Sites ({projects.length})
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Gerencie e visualize todos os seus sites criados pela IA
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.conversationId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {editingProjectId === project.conversationId ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingProjectName}
                                onChange={(e) => setEditingProjectName(e.target.value)}
                                className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleRenameProject(project.conversationId, editingProjectName);
                                  } else if (e.key === 'Escape') {
                                    setEditingProjectId(null);
                                    setEditingProjectName('');
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleRenameProject(project.conversationId, editingProjectName)}
                                className="p-1 text-green-400 hover:text-green-300"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProjectId(null);
                                  setEditingProjectName('');
                                }}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {project.projectName || project.companyName || 'Site sem nome'}
                                </h3>
                                <button
                                  onClick={() => {
                                    setEditingProjectId(project.conversationId);
                                    setEditingProjectName(project.projectName || project.companyName || '');
                                  }}
                                  className="p-1 text-slate-400 hover:text-purple-400 transition-colors"
                                  title="Renomear projeto"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                              {project.businessSector && (
                                <p className="text-sm text-slate-400">{project.businessSector}</p>
                              )}
                            </>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          project.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {project.status === 'completed' ? 'Concluído' : 'Ativo'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                        {project.initialPrompt}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {project.latestVersion && (
                          <>
                            <span>•</span>
                            <span>Versão {project.latestVersion}</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mb-3">
                        <Link
                          href={`/preview/${project.conversationId}`}
                          target="_blank"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Visualizar Preview
                        </Link>
                        <a
                          href={getWhatsAppUrl(project.projectId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Entrar em Contato
                        </a>
                      </div>

                      <div className="pt-3 border-t border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>ID: {project.projectId}</span>
                          <div className="flex items-center gap-1" title="Código protegido contra cópia">
                            <Shield className="w-3 h-3" />
                            <span>Protegido</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>

              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-slate-500">O email não pode ser alterado</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Nome da sua empresa"
                    />
                  </div>

                  {profile?.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Membro desde
                      </label>
                      <p className="text-slate-400">
                        {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileData({
                          name: profile?.name || '',
                          phone: profile?.phone || '',
                          company: profile?.company || ''
                        });
                      }}
                      className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Nome Completo
                    </label>
                    <p className="text-white text-lg">
                      {profile?.name || 'Não informado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Email
                    </label>
                    <p className="text-white text-lg">
                      {profile?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Telefone
                    </label>
                    <p className="text-white text-lg">
                      {profile?.phone || 'Não informado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Empresa
                    </label>
                    <p className="text-white text-lg">
                      {profile?.company || 'Não informado'}
                    </p>
                  </div>

                  {profile?.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Membro desde
                      </label>
                      <p className="text-white text-lg">
                        {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{projects.length}</p>
                    <p className="text-sm text-slate-400">Projetos Criados</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                    <p className="text-sm text-slate-400">Projetos Concluídos</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Code className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {projects.reduce((acc, p) => acc + (p.latestVersion || 1), 0)}
                    </p>
                    <p className="text-sm text-slate-400">Versões Totais</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
