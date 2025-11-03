/**
 * 🔒 API PROTEGIDA - Download de Código
 * 
 * Esta API só deve ser acessível após:
 * - Aprovação do cliente
 * - Pagamento confirmado
 * - Autenticação/autorização
 * 
 * NÃO deve ser exposta no frontend durante preview!
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    
    // 🔒 VERIFICAÇÃO DE AUTORIZAÇÃO
    // TODO: Implementar verificação de:
    // - Token de autenticação
    // - Status de pagamento
    // - Aprovação do projeto
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Token de acesso necessário.' },
        { status: 401 }
      );
    }
    
    // TODO: Validar token e verificar permissões
    // const token = authHeader.replace('Bearer ', '');
    // const hasAccess = await verifyTokenAndPayment(token, siteId);
    // if (!hasAccess) {
    //   return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    // }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("site_versions")
      .select("site_code")
      .eq("id", siteId)
      .single();

    if (error || !data?.site_code) {
      return NextResponse.json(
        { error: "Código não encontrado" },
        { status: 404 }
      );
    }

    // Retornar código completo SEM proteções (apenas para clientes autorizados)
    return new NextResponse(data.site_code, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="site-${siteId}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error("Erro ao baixar código:", error);
    return NextResponse.json(
      { error: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}

