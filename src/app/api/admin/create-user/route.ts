import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 🔧 Endpoint Admin para criar usuário de teste
 * 
 * ⚠️ SEGURANÇA: Este endpoint deve ser protegido em produção!
 * Por enquanto, funciona apenas em desenvolvimento ou com autenticação admin
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // ✅ Verificar se está em desenvolvimento ou tem autenticação admin
    // Em produção, você deve adicionar verificação de autenticação aqui
    // Por enquanto, permitir em desenvolvimento sem autenticação
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    
    if (!isDevelopment) {
      // Em produção, verificar token de admin se configurado
      const adminToken = process.env.ADMIN_API_TOKEN;
      
      if (adminToken) {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
          return NextResponse.json({
            success: false,
            error: 'Acesso negado. Token de admin necessário em produção.',
            hint: 'Configure ADMIN_API_TOKEN no Railway ou remova esta verificação temporariamente'
          }, { status: 403 });
        }
      }
      // Se não tiver ADMIN_API_TOKEN configurado, permitir (não recomendado para produção)
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente do Supabase não configuradas',
        details: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }

    // ✅ Usar Service Role Key para criar usuário (bypassa email confirmation)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('👤 Criando usuário de teste...', { email, name });

    // ✅ Criar usuário usando Service Role (admin)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Confirmar email automaticamente
      user_metadata: {
        name: name || email.split('@')[0]
      }
    });

    if (error) {
      // Se usuário já existe, tentar atualizar senha
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('⚠️  Usuário já existe. Atualizando senha...');
        
        // Buscar usuário existente
        const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          throw listError;
        }

        const existingUser = usersData.users.find(u => u.email === email);
        
        if (existingUser) {
          // Atualizar senha e confirmar email
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: password,
              email_confirm: true,
              user_metadata: {
                name: name || email.split('@')[0]
              }
            }
          );

          if (updateError) {
            throw updateError;
          }

          return NextResponse.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            user: {
              id: updateData.user.id,
              email: updateData.user.email,
              email_confirmed: !!updateData.user.email_confirmed_at,
              name: updateData.user.user_metadata?.name
            }
          });
        }
      }
      
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum usuário foi criado'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed: !!data.user.email_confirmed_at,
        name: data.user.user_metadata?.name
      }
    });

  } catch (error: unknown) {
    console.error('❌ Erro ao criar usuário:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar usuário',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

