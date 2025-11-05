/**
 * 🔧 Script para criar usuário de teste no Supabase
 * 
 * Uso: npx tsx scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// ✅ Usar Service Role Key para criar usuário (bypassa email confirmation)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const email = 'teste@teste.com.br';
  const password = 'abc123456';
  const name = 'Usuário Teste';

  console.log('👤 Criando usuário de teste...');
  console.log('   Email:', email);
  console.log('   Nome:', name);

  try {
    // ✅ Criar usuário usando Service Role (admin)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Confirmar email automaticamente
      user_metadata: {
        name: name
      }
    });

    if (error) {
      // Se usuário já existe, tentar atualizar senha
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('⚠️  Usuário já existe. Atualizando senha...');
        
        // Buscar usuário existente
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === email);
        
        if (existingUser) {
          // Atualizar senha e confirmar email
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: password,
              email_confirm: true,
              user_metadata: {
                name: name
              }
            }
          );

          if (updateError) {
            console.error('❌ Erro ao atualizar usuário:', updateError.message);
            process.exit(1);
          }

          console.log('✅ Usuário atualizado com sucesso!');
          console.log('   ID:', updateData.user.id);
          console.log('   Email:', updateData.user.email);
          console.log('   Email confirmado:', updateData.user.email_confirmed_at ? '✅' : '❌');
          console.log('\n📝 Credenciais:');
          console.log('   Email:', email);
          console.log('   Senha:', password);
          return;
        }
      }
      
      console.error('❌ Erro ao criar usuário:', error.message);
      process.exit(1);
    }

    if (!data.user) {
      console.error('❌ Nenhum usuário foi criado');
      process.exit(1);
    }

    console.log('✅ Usuário criado com sucesso!');
    console.log('   ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Email confirmado:', data.user.email_confirmed_at ? '✅' : '❌');
    console.log('\n📝 Credenciais:');
    console.log('   Email:', email);
    console.log('   Senha:', password);
    console.log('\n🔗 Você pode fazer login em:');
    console.log('   https://app.wzsolutions.com.br/login');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

// Executar
createTestUser();

