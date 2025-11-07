import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API Route para servir o HTML estático baixado
 * Lê o arquivo HTML diretamente do sistema de arquivos
 */
export async function GET() {
  try {
    // Caminho para o arquivo HTML baixado
    const htmlFilePath = path.join(
      process.cwd(),
      'downloaded-site-codes',
      'site-code-1994e494-ac3e-4e4b-aa09-ee3445ae615f-v1.html'
    );

    // Verificar se o arquivo existe
    if (!fs.existsSync(htmlFilePath)) {
      console.error('❌ Arquivo HTML não encontrado:', htmlFilePath);
      return new NextResponse('Arquivo HTML não encontrado', { status: 404 });
    }

    // Ler o arquivo HTML
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

    // Retornar o HTML
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('❌ Erro ao ler arquivo HTML:', error);
    return new NextResponse(
      `Erro ao carregar HTML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      { status: 500 }
    );
  }
}






