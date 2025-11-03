-- WZ Solution - Schema COMPLETO e ATUALIZADO para Claude IA
-- Execute este SQL no Supabase SQL Editor
-- Data: 2025-01-28

-- ========================================
-- EXTENSÕES NECESSÁRIAS
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABELA: conversations
-- ========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email VARCHAR(255),
  client_name VARCHAR(255),
  initial_prompt TEXT NOT NULL,
  project_type VARCHAR(50) NOT NULL DEFAULT 'site',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: messages
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'options', 'site_preview')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: project_data
-- ========================================
CREATE TABLE IF NOT EXISTS project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID UNIQUE NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Dados básicos da empresa
  company_name TEXT, -- Nome da empresa (separado de business_type)
  business_type VARCHAR(255), -- Setor/Negócio (Barbearia, Restaurante, etc.)
  business_objective TEXT,
  target_audience TEXT,
  short_description TEXT,
  slogan TEXT,
  
  -- Estrutura do site
  pages_needed TEXT[],
  site_structure VARCHAR(50), -- 'single_page' ou 'multiple_pages'
  
  -- Identidade visual
  design_style VARCHAR(100),
  design_colors TEXT[],
  has_logo BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  logo_analysis JSONB, -- Análise da IA sobre o logo
  use_logo_colors BOOLEAN DEFAULT FALSE,
  font_style TEXT,
  
  -- Funcionalidades
  functionalities TEXT[],
  
  -- Conteúdo
  content_needs JSONB, -- Dados flexíveis (tone, inspiration_sites, additional_prompt, etc)
  has_ai_generated_text BOOLEAN DEFAULT TRUE,
  cta_text TEXT,
  
  -- Visual avançado
  animation_level TEXT, -- 'nenhum', 'sutil', 'moderado', 'alto'
  avoid_styles TEXT,
  
  -- Estimativas
  estimated_cost VARCHAR(50),
  estimated_time VARCHAR(50),
  
  -- Código gerado
  current_site_code TEXT,
  site_version INTEGER DEFAULT 1,
  modification_history JSONB DEFAULT '[]'::jsonb,
  preview_url TEXT,
  
  -- Pipeline modular (6 camadas)
  structure_json JSONB,
  visual_identity_json JSONB,
  interactivity_settings JSONB,
  final_code TEXT,
  
  -- Integração HubSpot
  hubspot_contact_id TEXT,
  hubspot_deal_id TEXT,
  
  -- Imagens geradas
  generated_images TEXT[],
  final_summary TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: leads
-- ========================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  lead_source VARCHAR(100) DEFAULT 'ai_chat',
  lead_quality VARCHAR(50) DEFAULT 'warm' CHECK (lead_quality IN ('hot', 'warm', 'cold')),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: site_versions (histórico)
-- ========================================
CREATE TABLE IF NOT EXISTS site_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  site_code TEXT NOT NULL,
  site_code_id TEXT, -- ✅ ID protegido do código para preview
  modification_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABELA: file_uploads
-- ========================================
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES para performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_project_type ON conversations(project_type);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_project_data_conversation_id ON project_data(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_data_company_name ON project_data(company_name);

CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON leads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_quality ON leads(lead_quality);

CREATE INDEX IF NOT EXISTS idx_site_versions_conversation_id ON site_versions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_site_versions_version ON site_versions(conversation_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_site_versions_site_code_id ON site_versions(site_code_id);

CREATE INDEX IF NOT EXISTS idx_file_uploads_conversation_id ON file_uploads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_type ON file_uploads(file_type);

-- ========================================
-- TRIGGERS para updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_data_updated_at ON project_data;
CREATE TRIGGER update_project_data_updated_at 
    BEFORE UPDATE ON project_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================
-- Desabilitar RLS para simplicidade (pode habilitar depois)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads DISABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
-- Verificar se as tabelas foram criadas
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'project_data', 'leads', 'site_versions', 'file_uploads')
ORDER BY tablename;

-- Contar registros em cada tabela
SELECT 'conversations' as tabela, COUNT(*) as registros FROM conversations
UNION ALL
SELECT 'messages' as tabela, COUNT(*) as registros FROM messages
UNION ALL  
SELECT 'project_data' as tabela, COUNT(*) as registros FROM project_data
UNION ALL
SELECT 'leads' as tabela, COUNT(*) as registros FROM leads
UNION ALL
SELECT 'site_versions' as tabela, COUNT(*) as registros FROM site_versions
UNION ALL
SELECT 'file_uploads' as tabela, COUNT(*) as registros FROM file_uploads
ORDER BY tabela;

-- ========================================
-- COMMENTS para documentação
-- ========================================
COMMENT ON TABLE conversations IS 'Armazena todas as conversas iniciadas pelos clientes';
COMMENT ON TABLE messages IS 'Histórico completo de mensagens de cada conversa';
COMMENT ON TABLE project_data IS 'Dados estruturados coletados durante a conversa';
COMMENT ON TABLE leads IS 'Leads qualificados gerados pelas conversas';
COMMENT ON TABLE site_versions IS 'Histórico de todas as versões do site geradas';
COMMENT ON TABLE file_uploads IS 'Arquivos enviados pelos clientes (logos, imagens, etc.)';

COMMENT ON COLUMN conversations.status IS 'Status: active, completed, abandoned';
COMMENT ON COLUMN messages.sender_type IS 'Quem enviou: user ou ai';
COMMENT ON COLUMN messages.message_type IS 'Tipo: text, image, options, site_preview';
COMMENT ON COLUMN project_data.company_name IS 'Nome da empresa (separado do setor)';
COMMENT ON COLUMN project_data.business_type IS 'Setor/Negócio (Barbearia, Restaurante, etc.)';
COMMENT ON COLUMN project_data.site_code_id IS 'ID protegido para acesso ao código do site';
COMMENT ON COLUMN leads.lead_quality IS 'Qualidade: hot, warm, cold baseada nos dados coletados';
COMMENT ON COLUMN leads.status IS 'Status do lead: new, contacted, qualified, closed';


