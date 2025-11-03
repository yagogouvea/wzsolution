-- Tabela para armazenar respostas da Pesquisa Beta
CREATE TABLE IF NOT EXISTS beta_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados básicos
  name TEXT NOT NULL,
  age INTEGER,
  profession TEXT NOT NULL,
  
  -- Conhecimento prévio
  heard_about_ai BOOLEAN NOT NULL,
  
  -- Criação do site
  site_created BOOLEAN NOT NULL,
  problems TEXT, -- Apenas se site_created = false
  
  -- Especificações do prompt
  prompt_matched BOOLEAN, -- Apenas se site_created = true
  prompt_issues TEXT, -- Apenas se prompt_matched = false
  
  -- Avaliações (0-5)
  layout_score INTEGER CHECK (layout_score >= 0 AND layout_score <= 5),
  aesthetics_score INTEGER CHECK (aesthetics_score >= 0 AND aesthetics_score <= 5),
  functionality_score INTEGER CHECK (functionality_score >= 0 AND functionality_score <= 5),
  ease_of_use_score INTEGER CHECK (ease_of_use_score >= 0 AND ease_of_use_score <= 5),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 5),
  
  -- Questões adicionais
  creation_time TEXT CHECK (creation_time IN ('muito_rapido', 'rapido', 'normal', 'lento', 'muito_lento')),
  device_used TEXT CHECK (device_used IN ('pc', 'tablet', 'celular')),
  would_recommend INTEGER CHECK (would_recommend >= 0 AND would_recommend <= 10), -- NPS
  features_most_valued TEXT[], -- Array de funcionalidades
  
  -- Sugestões de melhoria
  improvements TEXT,
  
  -- Metadados
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_beta_surveys_submitted_at ON beta_surveys(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_surveys_site_created ON beta_surveys(site_created);
CREATE INDEX IF NOT EXISTS idx_beta_surveys_overall_score ON beta_surveys(overall_score);

-- Comentários na tabela
COMMENT ON TABLE beta_surveys IS 'Armazena respostas da pesquisa beta de criação de sites com IA';
COMMENT ON COLUMN beta_surveys.would_recommend IS 'Score NPS (Net Promoter Score) de 0 a 10';
COMMENT ON COLUMN beta_surveys.features_most_valued IS 'Array de funcionalidades mais valorizadas pelo usuário';

