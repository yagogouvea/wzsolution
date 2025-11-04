-- Tabela para armazenar solicitações de orçamento do formulário
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS budget_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  project_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_budget_requests_email ON budget_requests(email);
CREATE INDEX IF NOT EXISTS idx_budget_requests_created_at ON budget_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_requests_project_type ON budget_requests(project_type);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_budget_requests_updated_at ON budget_requests;
CREATE TRIGGER update_budget_requests_updated_at 
    BEFORE UPDATE ON budget_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar RLS para simplicidade
ALTER TABLE budget_requests DISABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE budget_requests IS 'Solicitações de orçamento enviadas pelo formulário de contato';
COMMENT ON COLUMN budget_requests.project_type IS 'Tipo de projeto: mobile, web, site, custom';



