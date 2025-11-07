import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // ✅ Verificar se estamos no browser (não funciona em server-side)
    // Esta API só funciona quando chamada do cliente
    const user = await getCurrentUser();
    
    return NextResponse.json({
      success: true,
      user: user ? {
        id: user.id,
        email: user.email
      } : null
    });
  } catch (error) {
    console.error('❌ [Auth Check] Erro:', error);
    return NextResponse.json({
      success: false,
      user: null
    });
  }
}





