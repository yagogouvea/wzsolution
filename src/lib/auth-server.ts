/**
 * 🔐 Autenticação Server-Side
 * Obtém usuário atual de requisições API
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Obtém usuário atual da requisição (server-side)
 * Recebe token do header Authorization
 */
export async function getServerUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Criar cliente Supabase com service role para verificar token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || ''
    };
  } catch (error) {
    console.error('Erro ao obter usuário do servidor:', error);
    return null;
  }
}

/**
 * Obtém user_id do body da requisição (fallback)
 */
export function getUserIdFromBody(body: any): string | null {
  return body?.userId || body?.user_id || null;
}

