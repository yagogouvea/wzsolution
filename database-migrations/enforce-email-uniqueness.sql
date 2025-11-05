-- ==========================================
-- Migration: Garantir Unicidade de Email
-- ==========================================
-- 
-- Esta migration garante que emails sejam únicos no sistema.
-- NOTA: O Supabase Auth já garante unicidade na tabela auth.users,
-- mas esta migration documenta a regra e cria índices adicionais
-- se necessário para outras tabelas que possam ter emails.
--
-- Data: 2024
-- Descrição: Validação de email duplicado no cadastro
-- ==========================================

-- ==========================================
-- 1. VERIFICAR CONSTRAINT EXISTENTE NO SUPABASE AUTH
-- ==========================================
-- O Supabase Auth já garante unicidade de email na tabela auth.users
-- através de uma constraint UNIQUE no campo email.
-- Esta é a proteção principal e não precisa ser modificada.

-- ==========================================
-- 2. COMENTÁRIOS DOCUMENTANDO A REGRA
-- ==========================================

COMMENT ON TABLE auth.users IS 
'Usuários do sistema. O campo email é único e não permite duplicatas. 
A validação é feita em múltiplas camadas: frontend, backend e banco de dados.';

-- ==========================================
-- 3. ÍNDICES PARA PERFORMANCE (se necessário)
-- ==========================================
-- O Supabase já cria índices automaticamente para campos UNIQUE,
-- mas podemos documentar se precisarmos de índices adicionais:

-- Se tiver outras tabelas com emails (ex: leads, contacts), 
-- adicione índices únicos nelas também:

-- Exemplo (descomente se necessário):
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_email_leads 
-- ON leads(LOWER(TRIM(email))) 
-- WHERE email IS NOT NULL;

-- ==========================================
-- 4. POLÍTICAS RLS (Row Level Security)
-- ==========================================
-- Verificar se as políticas RLS estão configuradas corretamente
-- para evitar que usuários vejam emails de outros usuários

-- Exemplo de política (se necessário):
-- CREATE POLICY "Users can only see their own email"
-- ON auth.users FOR SELECT
-- USING (auth.uid() = id);

-- ==========================================
-- 5. FUNÇÃO DE VALIDAÇÃO (Opcional)
-- ==========================================
-- Função helper para validar formato de email (se necessário)

CREATE OR REPLACE FUNCTION validate_email_format(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validação básica de formato
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_email_format IS 
'Valida o formato de um email. Retorna true se válido, false caso contrário.';

-- ==========================================
-- 6. TRIGGER PARA NORMALIZAÇÃO (Opcional)
-- ==========================================
-- Se quiser garantir que emails sejam sempre normalizados no banco:

-- CREATE OR REPLACE FUNCTION normalize_user_email()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Normalizar email: lowercase e trim
--   NEW.email = LOWER(TRIM(NEW.email));
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER normalize_email_on_insert
-- BEFORE INSERT ON auth.users
-- FOR EACH ROW
-- EXECUTE FUNCTION normalize_user_email();

-- CREATE TRIGGER normalize_email_on_update
-- BEFORE UPDATE ON auth.users
-- FOR EACH ROW
-- WHEN (OLD.email IS DISTINCT FROM NEW.email)
-- EXECUTE FUNCTION normalize_user_email();

-- ==========================================
-- NOTAS IMPORTANTES
-- ==========================================
-- 
-- 1. O Supabase Auth já garante unicidade de email automaticamente
-- 2. Não é necessário criar constraints adicionais na tabela auth.users
-- 3. A validação no código (frontend/backend) é uma camada extra de proteção
-- 4. Sempre normalize emails (lowercase, trim) antes de salvar
-- 5. A Service Role Key permite verificação via Admin API (recomendado)
--
-- ==========================================

