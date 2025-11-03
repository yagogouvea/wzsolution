import { NextRequest, NextResponse } from 'next/server';
import { analyzeLogo } from '@/lib/openai-vision';
import { DatabaseService } from '@/lib/supabase';
import { uploadLogo } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ Iniciando upload e análise de logo...');
    
    // ✅ Verificar se o body pode ser parseado como FormData
    let formData: FormData;
    let file: File;
    let conversationId: string;
    
    try {
      formData = await request.formData();
      file = formData.get('logo') as File;
      conversationId = formData.get('conversationId') as string;
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      console.error('❌ Erro ao parsear FormData:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao processar dados da requisição',
          details: errorMessage,
          message: 'Failed to parse body as FormData'
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📋 Dados recebidos:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      conversationId
    });

        if (!file || !conversationId) {
          return NextResponse.json(
            { error: 'Arquivo e ID da conversa são obrigatórios' },
            { status: 400 }
          );
        }

        // ✅ VERIFICAR SE CONVERSA EXISTE - SEM CRIAR AUTOMATICAMENTE
        console.log('🔍 Verificando se conversa existe:', conversationId);
        let conversation = await DatabaseService.getConversation(conversationId);
        
        if (!conversation) {
          // ✅ TENTAR CRIAR SÓ SE NÃO EXISTIR (com tratamento de conflito)
          console.log('🆕 Conversa não existe, tentando criar para logo upload');
          try {
            conversation = await DatabaseService.createConversation({
              id: conversationId,
              project_type: 'site',
              initial_prompt: 'Upload de logo iniciado',
              status: 'active'
            });
            console.log('✅ Conversa criada para logo upload:', conversationId);
          } catch (createError: unknown) {
            // ✅ SE DER ERRO DE CHAVE DUPLICADA, TENTAR BUSCAR NOVAMENTE
            const errorCode = (createError as { code?: string })?.code;
            if (errorCode === '23505') {
              console.log('⚠️ Conversa já existe (race condition), buscando novamente...');
              conversation = await DatabaseService.getConversation(conversationId);
              if (conversation) {
                console.log('✅ Conversa encontrada após race condition');
              } else {
                console.error('❌ Conversa ainda não encontrada após race condition');
                return NextResponse.json(
                  { error: 'Erro de sincronização - tente novamente' },
                  { status: 409 }
                );
              }
            } else {
              console.error('❌ Erro ao criar conversa para logo:', createError);
              return NextResponse.json(
                { error: 'Erro ao preparar upload de logo' },
                { status: 500 }
              );
            }
          }
        } else {
          console.log('✅ Conversa já existe:', conversationId);
        }

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      );
    }

    // Verificar tamanho do arquivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    console.log('🔄 Convertendo imagem para base64...');
    
    // Converter para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    console.log('✅ Conversão base64 concluída, tamanho:', base64.length);

    // Verificar se as chaves de API estão configuradas
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY não configurada');
      return NextResponse.json(
        { error: 'OpenAI API não configurada' },
        { status: 500 }
      );
    }

    console.log('🤖 Analisando logo com GPT-4 Vision...');
    
    // Analisar logo com GPT-4 Vision (com tratamento de erro)
    let logoAnalysis;
    try {
      logoAnalysis = await analyzeLogo(base64);
      console.log('✅ Análise de logo concluída:', logoAnalysis);
    } catch (visionError: unknown) {
      console.error('❌ Erro na análise do logo:', visionError);
      
      // Fallback: usar análise padrão
      logoAnalysis = {
        colors: {
          dominant: ['#1e3a8a', '#ffffff'],
          accent: ['#fbbf24', '#e5e7eb']
        },
        style: 'corporate',
        sector: 'profissional',
        mood: ['confiável', 'profissional'],
        recommendations: {
          siteStyle: 'Layout clean e profissional com foco em credibilidade',
          colorScheme: 'Cores neutras com toques de azul para transmitir confiança',
          typography: 'Tipografia serif para títulos e sans-serif para textos'
        }
      };
      console.log('🔄 Usando análise padrão como fallback');
    }

    // ✅ NOVO: Upload para Supabase Storage (URL pública permanente)
    console.log('📤 Fazendo upload para Supabase Storage...');
    let logoUrl: string;
    
    try {
      logoUrl = await uploadLogo(buffer, conversationId);
      console.log('✅ Logo salvo no Supabase Storage:', logoUrl);
    } catch (storageError: unknown) {
      console.error('⚠️ Erro ao fazer upload no Supabase Storage, usando data URI como fallback:', storageError);
      // Fallback: usar data URI se storage falhar
      logoUrl = `data:${file.type};base64,${base64}`;
    }

    console.log('💾 Salvando dados no banco...');

    // ✅ Salvar no banco usando função segura
    try {
      await DatabaseService.createProjectDataIfNotExists(conversationId, {
        logo_url: logoUrl,
        logo_analysis: JSON.stringify(logoAnalysis),
        has_logo: true
      });
      console.log('✅ Dados do projeto atualizados/criados');
    } catch (updateError: unknown) {
      console.error('❌ Erro ao salvar projeto:', updateError);
      // Continuar mesmo se falhar - não é crítico para o upload
    }

        // Salvar na tabela de uploads (com tratamento de erro)
        try {
          await DatabaseService.addFileUpload({
            conversation_id: conversationId,
            file_type: 'logo',
            file_name: file.name,
            file_url: logoUrl,
            file_size: file.size,
            mime_type: file.type,
            analysis_result: JSON.stringify(logoAnalysis)
          });
          console.log('✅ Upload salvo na tabela file_uploads');
        } catch (uploadError: unknown) {
          console.error('⚠️ Erro ao salvar upload (não crítico):', uploadError);
          // Continuar mesmo se falhar - a tabela pode não existir
        }

    console.log('💬 Adicionando mensagem da IA...');

    // Adicionar mensagem da IA (com tratamento de erro)
    try {
      await DatabaseService.addMessage({
        conversation_id: conversationId,
        sender_type: 'ai',
        content: `✨ **Perfeito! Analisei seu logo:**

🎨 **Identidade Visual Identificada:**
• **Cores principais**: ${(logoAnalysis as any).colors?.dominant?.join(', ') || 'Não detectado'}
• **Estilo**: ${(logoAnalysis as any).style || 'Não detectado'}
• **Setor**: ${(logoAnalysis as any).sector || 'Não detectado'}
• **Transmite**: ${(logoAnalysis as any).mood?.join(', ') || 'Não detectado'}

${(logoAnalysis as any).recommendations?.siteStyle || ''}

Vou usar essas cores e esse estilo para criar um site que combine perfeitamente com sua identidade visual! 🎯

**Você gostaria de:**`,
        message_type: 'text',
        metadata: {
          logoAnalysis,
          hasOptions: true,
          options: [
            { label: '📄 Diversas páginas', value: 'multiple_pages' },
            { label: '📋 Página única', value: 'single_page' }
          ]
        }
      });
      
      console.log('✅ Mensagem da IA adicionada com sucesso');
      
    } catch (messageError: unknown) {
      console.error('❌ Erro ao adicionar mensagem:', messageError);
      // Continuar mesmo se falhar
    }

    console.log('🎉 Upload e análise de logo concluídos com sucesso!');

    return NextResponse.json({
      success: true,
      logoAnalysis,
      message: 'Logo analisado e salvo com sucesso!',
      logoUrl // ✅ Retornar URL completa do Supabase Storage
    });

  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ [upload-logo] Erro geral no upload do logo:', errorObj);
    console.error('❌ [upload-logo] Stack trace:', errorObj.stack);
    console.error('❌ [upload-logo] Error message:', errorObj.message);
    
    // ✅ GARANTIR QUE SEMPRE RETORNA JSON, NUNCA HTML
    try {
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro interno do servidor',
          message: errorObj.message || 'Erro desconhecido',
          details: process.env.NODE_ENV === 'development' ? {
            name: errorObj.name,
            stack: errorObj.stack?.substring(0, 500)
          } : undefined
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (jsonError) {
      console.error('❌ [upload-logo] Erro crítico ao retornar JSON:', jsonError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro crítico no servidor'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
}
