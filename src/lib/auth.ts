/**
 * 🔐 Sistema de Autenticação
 * Gerencia autenticação de usuários com Supabase Auth
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Cliente Supabase lazy-loaded para evitar erros de inicialização
let _supabaseAuthInstance: SupabaseClient | null = null;

function getSupabaseAuth(): SupabaseClient {
  if (_supabaseAuthInstance) {
    return _supabaseAuthInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL e Anon Key são obrigatórios');
  }

  // Usar storage key única para evitar conflitos com outras instâncias
  const storageKey = 'wz-solution-auth';
  
  _supabaseAuthInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: storageKey, // ✅ Chave única para evitar conflitos
      // Não exigir confirmação de email para desenvolvimento/produção
      // Isso pode ser sobrescrito pelas configurações do Supabase Dashboard
    }
  });

  return _supabaseAuthInstance;
}

// Export para compatibilidade - usando Proxy seguro
export const supabaseAuth = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    try {
      const client = getSupabaseAuth();
      const value = (client as any)[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      // Para objetos complexos como auth, retornar diretamente
      if (prop === 'auth' && value) {
        return value;
      }
      return value;
    } catch (error) {
      console.error('❌ [Auth] Erro ao acessar propriedade:', prop, error);
      // Retornar função vazia se houver erro para evitar crashes
      if (typeof prop === 'string' && prop.startsWith('on')) {
        return () => {};
      }
      return undefined;
    }
  }
});

export interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * Faz login do usuário
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await getSupabaseAuth().auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    // Tratar erros específicos do Supabase
    let errorMessage = 'Erro ao fazer login';
    let requiresEmailConfirmation = false;
    
    // Verificar se é erro de email não confirmado
    const isEmailNotConfirmed = 
      error?.message?.includes('Email not confirmed') || 
      error?.message?.includes('email_not_confirmed') ||
      error?.status === 400 && error?.message?.toLowerCase().includes('email') ||
      error?.code === 'email_not_confirmed';
    
    if (isEmailNotConfirmed) {
      errorMessage = 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada (incluindo spam).';
      requiresEmailConfirmation = true;
      // Não logar como erro crítico, apenas info
      console.log('ℹ️ [Auth] Email não confirmado para:', email);
    } else if (error?.message) {
      // Logar outros erros normalmente
      console.error('❌ [Auth] Erro ao fazer login:', error);
      
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('invalid_credentials') ||
          error.message.includes('Invalid credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
      } else if (error.message.includes('Too many requests') || 
                 error.message.includes('rate limit')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      } else {
        errorMessage = error.message || 'Erro desconhecido ao fazer login';
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      requiresEmailConfirmation
    };
  }
}

/**
 * Verifica se um email já está cadastrado
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // Normalizar email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Tentar fazer signIn com senha incorreta para verificar se email existe
    // Isso é uma forma indireta, mas funcional
    // O Supabase retornará erro diferente se email não existir vs senha incorreta
    
    // Alternativa melhor: usar a API de verificação
    // Por enquanto, retornar false e deixar o Supabase validar no signUp
    return false;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return false;
  }
}

/**
 * Cria nova conta
 */
export async function signUp(email: string, password: string, name?: string) {
  try {
    // ✅ Validar formato de email antes de enviar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        error: 'Email inválido. Verifique o formato do email.'
      };
    }

    // ✅ Validar senha mínima
    if (password.length < 6) {
      return {
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres.'
      };
    }

    const { data, error } = await getSupabaseAuth().auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name || normalizedEmail.split('@')[0]
        }
      }
    });

    if (error) throw error;

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    console.error('Erro ao criar conta:', error);
    
    // ✅ Tratar erros específicos do Supabase com mensagens claras
    let errorMessage = 'Erro ao criar conta';
    
    if (error?.message) {
      // Email já cadastrado
      if (
        error.message.includes('already registered') || 
        error.message.includes('User already registered') ||
        error.message.includes('already exists') ||
        error.message.includes('duplicate key') ||
        error.code === '23505' // PostgreSQL unique violation
      ) {
        errorMessage = 'Este email já está cadastrado. Faça login ou recupere sua senha.';
      } 
      // Senha muito curta
      else if (error.message.includes('Password') || error.message.includes('password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } 
      // Email inválido
      else if (error.message.includes('Invalid email') || error.message.includes('invalid email')) {
        errorMessage = 'Email inválido. Verifique o formato do email.';
      }
      // Rate limit
      else if (error.message.includes('rate limit') || error.message.includes('too many')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      }
      // Outros erros
      else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Faz logout
 */
export async function signOut() {
  try {
    const client = getSupabaseAuth();
    
    // Limpar sessão local primeiro
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || '') + '-auth-token');
      } catch (e) {
        // Ignorar erros de localStorage
      }
    }
    
    // Fazer logout no Supabase
    const { error } = await client.auth.signOut();
    
    // Não tratar erro como crítico se o token já estava expirado
    if (error && !error.message.includes('expired') && !error.message.includes('invalid')) {
      console.warn('⚠️ [Auth] Aviso ao fazer logout:', error.message);
    }
    
    return { success: true };
  } catch (error) {
    // Ignorar erros de token expirado no logout
    if (error instanceof Error && (error.message.includes('expired') || error.message.includes('invalid'))) {
      console.log('ℹ️ [Auth] Token já estava expirado, limpando sessão local');
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignorar
        }
      }
      return { success: true };
    }
    
    console.error('❌ [Auth] Erro ao fazer logout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Obtém usuário atual
 */
export async function getCurrentUser() {
  try {
    // ✅ Verificar se estamos no browser
    if (typeof window === 'undefined') {
      console.log('⚠️ [Auth] window não disponível (server-side)');
      return null;
    }

    // ✅ Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ [Auth] Variáveis de ambiente do Supabase não configuradas!');
      return null;
    }

    // ✅ Usar getSession primeiro para evitar erro de sessão faltando
    const client = getSupabaseAuth();
    const { data: { session }, error: sessionError } = await client.auth.getSession();
    
    if (sessionError) {
      console.log('⚠️ [Auth] Erro ao obter sessão:', sessionError.message);
      return null;
    }

    if (!session) {
      console.log('ℹ️ [Auth] Nenhuma sessão encontrada (usuário não logado)');
      return null;
    }

    // Verificar se o token está expirado antes de tentar obter usuário
    const now = Math.floor(Date.now() / 1000);
    const tokenExpiry = session.expires_at;
    
    if (tokenExpiry && tokenExpiry < now) {
      console.log('⚠️ [Auth] Token expirado, tentando refresh...');
      
      // Tentar refresh do token
      try {
        const { data: refreshData, error: refreshError } = await client.auth.refreshSession();
        if (refreshError) {
          console.log('⚠️ [Auth] Erro ao renovar sessão:', refreshError.message);
          // Limpar sessão expirada
          await client.auth.signOut();
          return null;
        }
        
        if (refreshData?.session) {
          // Usar usuário da sessão renovada
          return refreshData.session.user;
        }
      } catch (refreshErr) {
        console.log('⚠️ [Auth] Erro ao renovar sessão expirada:', refreshErr);
        await client.auth.signOut();
        return null;
      }
    }
    
    // Se tem sessão válida, obter usuário
    const { data: { user }, error } = await client.auth.getUser();
    if (error) {
      // Se erro de token expirado, tentar refresh
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        try {
          const { data: refreshData, error: refreshError } = await client.auth.refreshSession();
          if (!refreshError && refreshData?.session) {
            return refreshData.session.user;
          }
          // Se refresh falhou, limpar sessão
          await client.auth.signOut();
          return null;
        } catch (refreshErr) {
          await client.auth.signOut();
          return null;
        }
      }
      
      // Se erro mas tem sessão válida, usar usuário da sessão
      if (session.user) {
        console.log('⚠️ [Auth] Erro ao obter usuário, usando usuário da sessão:', error.message);
        return session.user;
      }
      
      return null;
    }
    
    console.log('✅ [Auth] Usuário obtido:', user?.email || 'sem email');
    return user;
  } catch (error) {
    // Ignorar erros de sessão faltando (usuário não logado)
    if (error instanceof Error) {
      if (error.message.includes('session') || error.message.includes('Auth session missing')) {
        console.log('ℹ️ [Auth] Nenhuma sessão de autenticação encontrada');
        return null;
      }
      console.error('❌ [Auth] Erro ao obter usuário:', error.message);
    } else {
      console.error('❌ [Auth] Erro desconhecido ao obter usuário:', error);
    }
    return null;
  }
}

/**
 * Obtém sessão atual
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await getSupabaseAuth().auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
}

/**
 * Reenvia email de confirmação
 */
export async function resendConfirmationEmail(email: string) {
  try {
    const { error } = await getSupabaseAuth().auth.resend({
      type: 'signup',
      email: email
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Email de confirmação reenviado! Verifique sua caixa de entrada.'
    };
  } catch (error) {
    console.error('Erro ao reenviar email de confirmação:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao reenviar email'
    };
  }
}

/**
 * Solicita reset de senha (envia email com link)
 */
export async function resetPasswordRequest(email: string) {
  try {
    // Configurar URL de redirect para a página de reset
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/reset-password`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`;

    const { error } = await getSupabaseAuth().auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Email de recuperação enviado! Verifique sua caixa de entrada (incluindo spam).'
    };
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    
    let errorMessage = 'Erro ao enviar email de recuperação';
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Email inválido. Verifique o endereço de email.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Confirma reset de senha com novo token e senha
 */
export async function resetPassword(newPassword: string) {
  try {
    // Validar senha
    if (newPassword.length < 8) {
      return {
        success: false,
        error: 'A senha deve ter pelo menos 8 caracteres'
      };
    }
    
    if (!/[a-zA-Z]/.test(newPassword)) {
      return {
        success: false,
        error: 'A senha deve conter pelo menos uma letra'
      };
    }
    
    if (!/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: 'A senha deve conter pelo menos um número'
      };
    }

    const { error } = await getSupabaseAuth().auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Senha alterada com sucesso! Você já pode fazer login com a nova senha.'
    };
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    
    let errorMessage = 'Erro ao alterar senha';
    if (error instanceof Error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        errorMessage = 'Link de recuperação expirado ou inválido. Solicite um novo link.';
      } else if (error.message.includes('same')) {
        errorMessage = 'A nova senha deve ser diferente da senha atual.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Hook para observar mudanças de autenticação
 */
export function onAuthStateChange(callback: (user: any) => void) {
  try {
    return getSupabaseAuth().auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  } catch (error) {
    console.error('Erro ao observar mudanças de autenticação:', error);
    // Retornar um objeto com unsubscribe vazio para evitar erros
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }
}

