/**
 * 🔧 Script simples para criar usuário de teste
 * 
 * Uso: node scripts/create-test-user-simple.js
 * 
 * Requer: .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

// Tentar carregar dotenv se disponível
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv não disponível, usar variáveis de ambiente do sistema
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.error('   Certifique-se de que .env.local existe e contém:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

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
  console.log('');

  try {
    // Criar usuário usando Service Role (admin)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (error) {
      // Se usuário já existe, atualizar senha
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('⚠️  Usuário já existe. Atualizando senha...');
        
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersData.users.find(u => u.email === email);
        
        if (existingUser) {
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
          console.log('');
          console.log('📝 Credenciais:');
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
    console.log('');
    console.log('📝 Credenciais:');
    console.log('   Email:', email);
    console.log('   Senha:', password);
    console.log('');
    console.log('🔗 Você pode fazer login em:');
    console.log('   https://app.wzsolutions.com.br/login');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  }
}

createTestUser();

