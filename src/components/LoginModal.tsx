'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, X, Send, ArrowLeft, KeyRound } from 'lucide-react';
import { signIn, signUp, getCurrentUser, resendConfirmationEmail, resetPasswordRequest } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
  pendingData?: {
    selectedType?: string;
    idea?: string;
    companyName?: string;
    businessSector?: string;
  } | null;
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialMode = 'login',
  pendingData = null
}: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setError(null);
      setSuccess(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowResendEmail(false);
      setResendingEmail(false);
      setShowForgotPassword(false);
      setSendingResetEmail(false);
    }
  }, [isOpen, initialMode]);

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
          
          // Obter usuário após login bem-sucedido
          const user = await getCurrentUser();
          
          // Disparar evento customizado para atualizar header imediatamente
          if (typeof window !== 'undefined' && user) {
            window.dispatchEvent(new CustomEvent('auth-state-changed', { 
              detail: { user, action: 'login' } 
            }));
          }
          
          // ✅ Se tem dados pendentes, manter animação e processar
          // A animação já está visível desde o clique inicial, então não precisa esconder
          if (pendingData && typeof window !== 'undefined' && user) {
            // Chamar onSuccess imediatamente (que vai processar e redirecionar)
            // A animação continuará visível até o redirecionamento
            onSuccess?.();
            // Não fechar modal imediatamente - deixar o onSuccess processar
            return;
          }
          
          // Sem dados pendentes, apenas fechar modal após pequeno delay
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 500);
        } else {
          const errorMsg = result.error || 'Erro ao fazer login';
          setError(errorMsg);
          
          // Se o erro é sobre email não confirmado, mostrar opção de reenviar
          const needsConfirmation = (result as any).requiresEmailConfirmation || 
              errorMsg.includes('confirme seu email') || 
              errorMsg.includes('Email not confirmed') ||
              (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('confirm'));
          
          if (needsConfirmation) {
            setShowResendEmail(true);
            // Limpar erro após alguns segundos para destacar o card de reenvio
            setTimeout(() => setError(null), 3000);
          }
        }
      } else {
        // Cadastro
        if (!name.trim()) {
          setError('Nome é obrigatório');
          setLoading(false);
          return;
        }
        
        // Validar senha
        if (password.length < 8) {
          setError('A senha deve ter pelo menos 8 caracteres');
          setLoading(false);
          return;
        }
        
        if (!/[a-zA-Z]/.test(password)) {
          setError('A senha deve conter pelo menos uma letra');
          setLoading(false);
          return;
        }
        
        if (!/[0-9]/.test(password)) {
          setError('A senha deve conter pelo menos um número');
          setLoading(false);
          return;
        }
        
        // Validar confirmação de senha
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        const result = await signUp(email, password, name);
        if (result.success) {
          // Verificar se o email precisa ser confirmado
          const user = await getCurrentUser();
          if (user) {
            // Usuário logado imediatamente (confirmação desabilitada)
            setSuccess('Conta criada com sucesso!');
            
            // Disparar evento customizado para atualizar header imediatamente
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth-state-changed', { 
                detail: { user, action: 'signup' } 
              }));
            }
            
            // ✅ Se tem dados pendentes, manter animação e processar
            // A animação já está visível desde o clique inicial
            if (pendingData && typeof window !== 'undefined') {
              // Chamar onSuccess imediatamente (que vai processar e redirecionar)
              // A animação continuará visível até o redirecionamento
              onSuccess?.();
              // Não fechar modal imediatamente - deixar o onSuccess processar
              return;
            }
            
            // Sem dados pendentes, apenas fechar modal após pequeno delay
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 500);
          } else {
            // Email precisa ser confirmado
            setSuccess('Conta criada! Verifique seu email para confirmar antes de fazer login.');
            // Não fechar o modal automaticamente
          }
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl w-full max-w-md pointer-events-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-slate-400 mb-6 text-sm">
                {isLogin 
                  ? 'Entre para acessar seus sites criados pela IA' 
                  : 'Crie sua conta e comece a criar sites com IA'}
              </p>

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

              {/* Botão para reenviar email de confirmação */}
              {showResendEmail && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-300 text-sm mb-2">
                    Não recebeu o email? Podemos reenviar para você.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setError('Por favor, insira seu email primeiro.');
                        return;
                      }
                      setResendingEmail(true);
                      setError(null);
                      const result = await resendConfirmationEmail(email);
                      if (result.success) {
                        setSuccess(result.message);
                        setShowResendEmail(false);
                      } else {
                        setError(result.error || 'Erro ao reenviar email');
                      }
                      setResendingEmail(false);
                    }}
                    disabled={resendingEmail || !email}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {resendingEmail ? 'Reenviando...' : 'Reenviar Email de Confirmação'}
                  </button>
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
                        autoComplete="name"
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                      required
                      autoComplete="email"
                    />
                  </div>
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
                      minLength={8}
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
                    <p className="mt-1 text-xs text-slate-400">
                      Mínimo de 8 caracteres, pelo menos uma letra e um número
                    </p>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                        required={!isLogin}
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-400">As senhas não coincidem</p>
                    )}
                  </div>
                )}

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

              {/* Forgot Password Link (only in login mode) */}
              {isLogin && !showForgotPassword && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError(null);
                      setSuccess(null);
                      setShowResendEmail(false);
                    }}
                    className="text-slate-400 hover:text-purple-400 text-sm transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              {/* Forgot Password Form */}
              {showForgotPassword && (
                <div className="mt-4 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Recuperar Senha</h3>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4">
                    Digite seu email e enviaremos um link para redefinir sua senha.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!email.trim()) {
                            setError('Por favor, insira seu email');
                            return;
                          }

                          setSendingResetEmail(true);
                          setError(null);
                          setSuccess(null);

                          const result = await resetPasswordRequest(email);
                          
                          if (result.success) {
                            setSuccess(result.message);
                            setTimeout(() => {
                              setShowForgotPassword(false);
                              setEmail('');
                            }, 3000);
                          } else {
                            setError(result.error || 'Erro ao enviar email de recuperação');
                          }
                          
                          setSendingResetEmail(false);
                        }}
                        disabled={sendingResetEmail || !email.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingResetEmail ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Enviar Link de Recuperação
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle Login/Cadastro */}
              {!showForgotPassword && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setSuccess(null);
                      setShowResendEmail(false);
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
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

