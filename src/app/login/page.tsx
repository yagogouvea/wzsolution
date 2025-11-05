'use client';

// ✅ Forçar renderização dinâmica (não pré-renderizar)
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { signIn, signUp, getCurrentUser } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Verificar se já está logado
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        router.push('/cliente');
      }
    });
  }, [router]);

  // ✅ Verificar se email já existe quando usuário está em modo cadastro
  useEffect(() => {
    if (!isLogin && email) {
      // Validar formato de email primeiro
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailExists(false);
        return;
      }

      // Debounce para evitar muitas requisições
      const timeoutId = setTimeout(async () => {
        setCheckingEmail(true);
        try {
          const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          
          if (data.exists) {
            setEmailExists(true);
            setError('Este email já está cadastrado. Faça login ou recupere sua senha.');
          } else {
            setEmailExists(false);
            setError(null);
          }
        } catch (err) {
          console.error('Erro ao verificar email:', err);
          // Em caso de erro, não bloquear o cadastro
          setEmailExists(false);
        } finally {
          setCheckingEmail(false);
        }
      }, 500); // Aguardar 500ms após parar de digitar

      return () => clearTimeout(timeoutId);
    } else {
      setEmailExists(false);
      setError(null);
    }
  }, [email, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login
        const result = await signIn(email, password);
        if (result.success) {
          setSuccess('Login realizado com sucesso!');
          
          // Se tem redirect e é create-site, processar criação pendente
          if (redirect === 'create-site' && typeof window !== 'undefined') {
            const pendingData = sessionStorage.getItem('pending_site_creation');
            if (pendingData) {
              try {
                const data = JSON.parse(pendingData);
                sessionStorage.removeItem('pending_site_creation');
                
                // Gerar conversationId
                const newConversationId = crypto.randomUUID();
                const basicData = {
                  companyName: data.companyName || 'Meu Negócio',
                  businessSector: data.businessSector || 'A definir',
                  additionalPrompt: data.idea,
                  projectType: data.selectedType || 'site'
                };
                
                sessionStorage.setItem(`chat_${newConversationId}`, JSON.stringify(basicData));
                
                setTimeout(() => {
                  const chatUrl = `/chat/${newConversationId}?companyName=${encodeURIComponent(basicData.companyName)}&businessSector=${encodeURIComponent(basicData.businessSector)}&prompt=${encodeURIComponent(basicData.additionalPrompt)}`;
                  window.location.href = chatUrl;
                }, 1000);
                return;
              } catch (err) {
                console.error('Erro ao processar criação pendente:', err);
              }
            }
          }
          
          setTimeout(() => {
            router.push('/cliente');
          }, 1000);
        } else {
          setError(result.error || 'Erro ao fazer login');
        }
      } else {
        // Cadastro
        if (!name.trim()) {
          setError('Nome é obrigatório');
          setLoading(false);
          return;
        }

        // ✅ Verificar se email já existe antes de tentar cadastrar
        if (emailExists) {
          setError('Este email já está cadastrado. Faça login ou recupere sua senha.');
          setLoading(false);
          return;
        }

        // ✅ Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('Email inválido. Verifique o formato do email.');
          setLoading(false);
          return;
        }

        // ✅ Validar senha mínima
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }

        const result = await signUp(email, password, name);
        if (result.success) {
          setSuccess('Conta criada com sucesso! Redirecionando...');
          
          // Se tem redirect e é create-site, processar criação pendente
          if (redirect === 'create-site' && typeof window !== 'undefined') {
            const pendingData = sessionStorage.getItem('pending_site_creation');
            if (pendingData) {
              try {
                const data = JSON.parse(pendingData);
                sessionStorage.removeItem('pending_site_creation');
                
                // Gerar conversationId
                const newConversationId = crypto.randomUUID();
                const basicData = {
                  companyName: data.companyName || 'Meu Negócio',
                  businessSector: data.businessSector || 'A definir',
                  additionalPrompt: data.idea,
                  projectType: data.selectedType || 'site'
                };
                
                sessionStorage.setItem(`chat_${newConversationId}`, JSON.stringify(basicData));
                
                setTimeout(() => {
                  const chatUrl = `/chat/${newConversationId}?companyName=${encodeURIComponent(basicData.companyName)}&businessSector=${encodeURIComponent(basicData.businessSector)}&prompt=${encodeURIComponent(basicData.additionalPrompt)}`;
                  window.location.href = chatUrl;
                }, 1500);
                return;
              } catch (err) {
                console.error('Erro ao processar criação pendente:', err);
              }
            }
          }
          
          setTimeout(() => {
            router.push('/cliente');
          }, 1500);
        } else {
          setError(result.error || 'Erro ao criar conta');
        }
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
            </h1>
            <p className="text-slate-400">
              {isLogin 
                ? 'Entre para acessar seus sites criados pela IA' 
                : 'Crie sua conta e comece a criar sites com IA'}
            </p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Limpar erro quando usuário começar a digitar novamente
                      if (error && error.includes('já está cadastrado')) {
                        setError(null);
                      }
                    }}
                    placeholder="seu@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors ${
                      emailExists && !isLogin
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-600 focus:border-purple-500'
                    }`}
                    required
                    autoComplete="email"
                  />
                {checkingEmail && !isLogin && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  </div>
                )}
                {emailExists && !isLogin && !checkingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-red-400 text-xs">✗</span>
                  </div>
                )}
              </div>
              {emailExists && !isLogin && (
                <p className="mt-1 text-xs text-red-400">
                  Este email já está cadastrado. <button type="button" onClick={() => setIsLogin(true)} className="underline hover:text-red-300">Faça login</button> ou <button type="button" onClick={() => router.push('/reset-password')} className="underline hover:text-red-300">recupere sua senha</button>.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-slate-400">Mínimo de 6 caracteres</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Entrar
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Criar Conta
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Cadastro */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {isLogin ? (
                <>
                  Não tem uma conta? <span className="text-purple-400 font-medium">Cadastre-se</span>
                </>
              ) : (
                <>
                  Já tem uma conta? <span className="text-purple-400 font-medium">Faça login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

