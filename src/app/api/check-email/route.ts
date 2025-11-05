import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route para verificar se um email já está cadastrado
 * GET /api/check-email?email=user@example.com
 * 
 * IMPORTANTE: Esta API usa uma abordagem indireta para verificar emails,
 * já que não temos acesso direto ao admin do Supabase sem service role key.
 * A validação final sempre será feita pelo Supabase no momento do cadastro.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // ✅ Tentar usar Supabase Admin API se tiver service role key
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseServiceKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        // Criar cliente admin do Supabase
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseServiceKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );

        // Buscar usuário por email usando Admin API
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (!listError && users?.users) {
          const emailExists = users.users.some(user => 
            user.email?.toLowerCase() === normalizedEmail
          );

          return NextResponse.json({
            exists: emailExists,
            message: emailExists 
              ? 'Este email já está cadastrado' 
              : 'Email disponível'
          });
        }
      } catch (adminError) {
        console.warn('⚠️ Não foi possível usar Admin API, usando método alternativo:', adminError);
      }
    }

    // ✅ Método alternativo: tentar fazer signIn com senha incorreta
    // O Supabase retorna erro diferente se email não existe vs senha incorreta
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({
          exists: false,
          message: 'Configuração incompleta. Tente criar a conta.'
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Tentar fazer signIn com senha incorreta
      // Se email não existir: "Invalid login credentials" ou "Email not confirmed"
      // Se email existir mas senha errada: "Invalid login credentials" ou "Email not confirmed"
      // Diferença sutil, mas vamos tentar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: '___CHECK_EMAIL___' // Senha incorreta propositalmente
      });

      // Se retornar erro específico de credenciais inválidas, pode ser que email exista
      // Mas isso não é confiável, então vamos retornar false positivo
      // A validação final sempre será feita pelo Supabase no signUp
      
      // Por segurança, retornar false (não existe) e deixar o Supabase validar
      return NextResponse.json({
        exists: false,
        message: 'Email disponível (validação final será feita no cadastro)'
      });

    } catch (error) {
      console.error('Erro ao verificar email:', error);
      
      // Em caso de erro, retornar false positivo
      // É melhor permitir tentar cadastrar e deixar o Supabase bloquear se existir
      return NextResponse.json({
        exists: false,
        message: 'Não foi possível verificar. Tente criar a conta.'
      });
    }

  } catch (error) {
    console.error('Erro na API check-email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

