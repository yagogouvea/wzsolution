-- Adicionar coluna project_name na tabela conversations
-- Execute este script no Supabase SQL Editor

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'project_name'
    ) THEN
        ALTER TABLE conversations 
        ADD COLUMN project_name TEXT;
        
        -- Criar índice para melhorar performance de buscas
        CREATE INDEX IF NOT EXISTS idx_conversations_project_name 
        ON conversations(project_name);
        
        RAISE NOTICE 'Coluna project_name adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna project_name já existe na tabela conversations.';
    END IF;
END $$;

-- Atualizar projetos existentes com nome padrão baseado no prompt inicial
UPDATE conversations
SET project_name = CASE
    WHEN client_name IS NOT NULL THEN 'Site ' || client_name
    WHEN initial_prompt ~* '(?:site|site\s+para|para)\s+([^,\.]+)' THEN 
        'Site ' || substring(initial_prompt from '(?:site|site\s+para|para)\s+([^,\.]+)')
    ELSE 'Site ' || substring(initial_prompt for 30)
END
WHERE project_name IS NULL;

-- Comentário na coluna para documentação
COMMENT ON COLUMN conversations.project_name IS 'Nome personalizado do projeto, permitindo ao usuário renomear seus projetos';

