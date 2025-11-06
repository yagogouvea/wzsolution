/**
 * 🔒 Módulo de Segurança para Proteção de Código e Credenciais
 * 
 * Medidas implementadas:
 * - Proteção contra exposição de código fonte
 * - Validação de origem (CORS)
 * - Rate limiting
 * - Watermark em previews
 * - Sanitização de dados
 */

import { NextRequest } from 'next/server';

/**
 * Verifica se estamos em ambiente de produção
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Domínios permitidos para CORS
 */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://app.wzsolutions.com.br',
  'https://wzsolutions.com.br',
  'http://localhost:3000' // Apenas em desenvolvimento
];

/**
 * Valida origem da requisição
 * Aceita tanto NextRequest quanto Request padrão
 */
export function validateOrigin(request: NextRequest | Request): boolean {
  if (!isProduction) return true; // Em dev, permitir todas as origens
  
  const headers = request instanceof NextRequest 
    ? request.headers 
    : (request.headers as Headers);
  
  const origin = headers.get('origin') || headers.get('referer');
  if (!origin) {
    // Em produção, se não tem origem, pode ser requisição direta (permitir se for do mesmo domínio)
    try {
      const url = request instanceof NextRequest 
        ? request.url 
        : (request as { url?: string }).url || '';
      if (url) {
        const urlObj = new URL(url);
        return ALLOWED_ORIGINS.some(allowed => {
          const allowedUrl = new URL(allowed);
          return urlObj.hostname === allowedUrl.hostname;
        });
      }
    } catch {
      // Se não conseguir parsear, negar por segurança
    }
    return false;
  }
  
  try {
    const originUrl = new URL(origin);
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      const allowedUrl = new URL(allowed);
      return originUrl.hostname === allowedUrl.hostname;
    });
    
    return isAllowed;
  } catch {
    return false;
  }
}

/**
 * Adiciona headers de segurança
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    ...(isProduction && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    })
  };
}

/**
 * Adiciona watermark ao código HTML
 */
export function addWatermark(html: string, options?: {
  text?: string;
  opacity?: number;
  position?: 'fixed' | 'absolute';
}): string {
  const {
    text = 'PREVIEW • WZ SOLUTION',
    opacity = 0.1,
    position = 'fixed'
  } = options || {};
  
  // Verificar se já tem watermark (evitar duplicação)
  if (html.includes('wz-watermark')) {
    return html;
  }
  
  const watermarkStyle = `
    <style>
      .wz-watermark {
        position: ${position};
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: bold;
        color: #000;
        opacity: ${opacity};
        transform: rotate(-45deg);
        user-select: none;
        -webkit-user-select: none;
        font-family: Arial, sans-serif;
      }
      .wz-watermark::before {
        content: "${text}";
      }
    </style>
  `;
  
  // Inserir antes do </head> ou no início do <body>
  if (html.includes('</head>')) {
    return html.replace('</head>', `${watermarkStyle}</head>`);
  } else if (html.includes('<body')) {
    return html.replace('<body', `${watermarkStyle}<body`);
  } else {
    return `${watermarkStyle}${html}`;
  }
}

/**
 * Remove código fonte sensível do HTML (comentários, scripts inline complexos)
 */
export function sanitizePreviewCode(html: string): string {
  let sanitized = html;
  
  // Remover comentários HTML que possam conter informações sensíveis
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remover console.log que possam expor dados
  sanitized = sanitized.replace(/console\.(log|warn|error|info)\([^)]*\)/g, '');
  
  // Adicionar proteção contra right-click e seleção (opcional, pode ser removido se muito restritivo)
  if (isProduction) {
    const protectionScript = `
      <script>
        (function() {
          // Prevenir seleção de texto
          document.addEventListener('selectstart', function(e) { e.preventDefault(); return false; });
          // Prevenir right-click
          document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
          // Prevenir F12, Ctrl+Shift+I, Ctrl+U
          document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U')) {
              e.preventDefault();
              return false;
            }
          });
        })();
      </script>
    `;
    
    if (sanitized.includes('</head>')) {
      sanitized = sanitized.replace('</head>', `${protectionScript}</head>`);
    }
  }
  
  return sanitized;
}

/**
 * Verifica se código contém informações sensíveis
 */
export function containsSensitiveData(code: string): boolean {
  const sensitivePatterns = [
    /process\.env\./i,
    /API_KEY/i,
    /SECRET/i,
    /PASSWORD/i,
    /TOKEN/i,
    /CLAUDE_API_KEY/i,
    /OPENAI_API_KEY/i,
    /SUPABASE.*KEY/i,
    /DATABASE_URL/i,
    /RAILWAY/i,
    /\.env/i
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(code));
}

/**
 * Sanitiza código removendo dados sensíveis
 */
export function removeSensitiveData(code: string): string {
  let sanitized = code;
  
  // Remover qualquer referência a env vars
  sanitized = sanitized.replace(/process\.env\.[A-Z_]+/g, '"[REDACTED]"');
  sanitized = sanitized.replace(/process\.env\[['"]([^'"]+)['"]\]/g, '"[REDACTED]"');
  
  // Remover API keys (padrões comuns)
  sanitized = sanitized.replace(/(api[_-]?key|apikey)\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi, '$1: "[REDACTED]"');
  sanitized = sanitized.replace(/(secret|token|password)\s*[:=]\s*['"]?[a-zA-Z0-9_-]{10,}['"]?/gi, '$1: "[REDACTED]"');
  
  return sanitized;
}

/**
 * Rate limiting simples (em memória)
 * Em produção, usar Redis ou serviço dedicado
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetAt) {
    // Nova janela
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Gera token temporário para download de código (apenas após aprovação)
 */
export function generateDownloadToken(conversationId: string, expiresInMs: number = 3600000): string {
  const crypto = require('crypto');
  const secret = process.env.DOWNLOAD_TOKEN_SECRET || 'change-me-in-production';
  const payload = {
    conversationId,
    expiresAt: Date.now() + expiresInMs,
    timestamp: Date.now()
  };
  
  const token = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return `${Buffer.from(JSON.stringify(payload)).toString('base64')}.${token}`;
}

/**
 * Valida token de download
 */
export function validateDownloadToken(token: string): { valid: boolean; conversationId?: string; error?: string } {
  try {
    const crypto = require('crypto');
    const secret = process.env.DOWNLOAD_TOKEN_SECRET || 'change-me-in-production';
    const [payloadBase64, signature] = token.split('.');
    
    if (!payloadBase64 || !signature) {
      return { valid: false, error: 'Token inválido' };
    }
    
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    // Verificar expiração
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Token expirado' };
    }
    
    // Verificar assinatura
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Assinatura inválida' };
    }
    
    return { valid: true, conversationId: payload.conversationId };
  } catch (error) {
    return { valid: false, error: 'Erro ao validar token' };
  }
}

/**
 * Valida se requisição vem de origem confiável
 * Aceita tanto NextRequest quanto Request padrão
 */
export function validateRequest(request: NextRequest | Request): {
  valid: boolean;
  error?: string;
} {
  // Converter para NextRequest se necessário
  const nextRequest = request instanceof NextRequest 
    ? request 
    : new NextRequest(request.url || '', {
        method: request.method,
        headers: request.headers as Headers,
      });
  
  // Validar origem
  if (!validateOrigin(nextRequest)) {
    return { valid: false, error: 'Origem não permitida' };
  }
  
  // Validar método
  const method = nextRequest.method;
  if (!['GET', 'POST'].includes(method)) {
    return { valid: false, error: 'Método não permitido' };
  }
  
  return { valid: true };
}

