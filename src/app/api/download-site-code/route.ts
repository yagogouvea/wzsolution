/**
 * 🔒 API PROTEGIDA para download de código fonte
 * 
 * Esta API só deve ser acessada após aprovação do projeto e pagamento.
 * Requer token de autenticação gerado pelo sistema administrativo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';
import { 
  validateRequest, 
  getSecurityHeaders, 
  validateDownloadToken,
  isProduction 
} from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    // ✅ VALIDAÇÃO DE SEGURANÇA
    const validation = validateRequest(request);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Requisição não autorizada" },
        { 
          status: 403,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // ✅ OBTER TOKEN DA QUERY STRING
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const conversationId = searchParams.get('conversationId');
    
    if (!token) {
      return NextResponse.json(
        { error: "Token de acesso requerido. Entre em contato com nossa equipe para obter acesso ao código fonte." },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // ✅ VALIDAR TOKEN
    const tokenValidation = validateDownloadToken(token);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error || "Token inválido ou expirado" },
        { 
          status: 401,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // ✅ VALIDAR CONVERSATION ID
    const validConversationId = conversationId || tokenValidation.conversationId;
    if (!validConversationId) {
      return NextResponse.json(
        { error: "ID da conversa não fornecido" },
        { 
          status: 400,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // ✅ BUSCAR CÓDIGO NO BANCO
    const versions = await DatabaseService.getSiteVersions(validConversationId);
    if (!versions || versions.length === 0) {
      return NextResponse.json(
        { error: "Código não encontrado" },
        { 
          status: 404,
          headers: getSecurityHeaders()
        }
      );
    }
    
    // ✅ OBTER ÚLTIMA VERSÃO
    const latestVersion = versions.sort((a, b) => 
      (b.version_number || 0) - (a.version_number || 0)
    )[0];
    
    let siteCode = latestVersion.site_code;
    if (typeof siteCode !== 'string') {
      siteCode = String(siteCode || '');
    }
    
    // ✅ RETORNAR CÓDIGO COMO ARQUIVO PARA DOWNLOAD
    return new NextResponse(siteCode, {
      status: 200,
      headers: {
        ...getSecurityHeaders(),
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="site-${validConversationId}-v${latestVersion.version_number}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('❌ [download-site-code] Erro:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { 
        status: 500,
        headers: getSecurityHeaders()
      }
    );
  }
}

