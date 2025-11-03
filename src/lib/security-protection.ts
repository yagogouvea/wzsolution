/**
 * 🔒 Sistema de Proteção de Segurança
 * Bloqueia acesso indevido ao código, console, edição e tokens
 */

/**
 * Injeta proteções de segurança no HTML antes de servir
 * IMPORTANTE: Deve ser injetado ANTES de qualquer outro script
 */
export function injectSecurityProtections(html: string, siteId: string): string {
  // Script de proteção COMPLETO e ROBUSTO
  // Executado IMEDIATAMENTE, antes de qualquer outro script
  const securityScript = `
<script>
// 🔒 PROTEÇÃO DE SEGURANÇA WZ SOLUTION - EXECUTAR IMEDIATAMENTE
(function() {
  'use strict';
  
  // Executar IMEDIATAMENTE, antes de qualquer outro código
  try {
  
  // 🔒 BLOQUEAR CONSOLE DE FORMA DEFINITIVA (múltiplas camadas)
  (function() {
    const noop = function() {};
    const noopReturn = function() { return {}; };
    
    // Camada 1: Sobrescrever console antes de qualquer script
    const fakeConsole = {
      log: noop, warn: noop, error: noop, info: noop, debug: noop,
      trace: noop, dir: noop, dirxml: noop, group: noop, groupEnd: noop,
      time: noop, timeEnd: noop, assert: noop, profile: noop, profileEnd: noop,
      count: noop, clear: noop, table: noop, memory: {}, exception: noop,
      Console: function() {}
    };
    
    // Bloquear console de múltiplas formas
    try {
      Object.defineProperty(window, 'console', {
        value: fakeConsole,
        writable: false,
        configurable: false,
        enumerable: false
      });
    } catch(e) {}
    
    // Tentar bloquear de outras formas
    try {
      window.console = fakeConsole;
    } catch(e) {}
    
    // Bloquear acesso via getter
    const originalConsole = window.console;
    Object.defineProperty(window, 'console', {
      get: function() { return fakeConsole; },
      set: function() {},
      configurable: false,
      enumerable: false
    });
    
    // Proteger contra Object.getOwnPropertyDescriptor
    try {
      Object.freeze(fakeConsole);
      Object.seal(fakeConsole);
    } catch(e) {}
    
    // Bloquear DevTools (mas NÃO em mobile/iPhone)
    let devtools = {open: false, orientation: null};
    const threshold = 200; // Aumentado de 160 para 200
    
    setInterval(() => {
      // ✅ AJUSTE: Não bloquear se estiver em iframe (preview mode)
      const isInIframe = window.self !== window.top;
      
      // ✅ Detectar se é mobile/iPhone para não bloquear
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       window.innerWidth < 768 ||
                       ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0);
      
      // Em mobile ou iframe, não bloquear - diferenças de viewport são normais
      if (isMobile || isInIframe) {
        devtools.open = false;
        return;
      }
      
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // ✅ Apenas bloquear se diferença for SIGNIFICATIVA e consistente
      if (!isInIframe && (heightDiff > threshold || widthDiff > threshold) &&
          heightDiff < window.innerHeight * 0.5 &&
          widthDiff < window.innerWidth * 0.5) {
        if (!devtools.open) {
          devtools.open = true;
          // Apenas avisar, não bloquear completamente em preview
          try {
            // Não bloquear completamente - apenas avisar
            console.warn('🔒 DevTools detectado');
          } catch(e) {
            // Ignorar erro se não conseguir bloquear
          }
        }
      } else {
        devtools.open = false;
      }
    }, 1000); // Reduzido de 500ms para 1000ms
    
    // Bloquear teclas de atalho
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+S (save)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+P (print)
      if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
  })();
  
  // 🔒 2. BLOQUEAR CLIQUE DIREITO E SELEÇÃO
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  // 🔒 3. BLOQUEAR COPY/PASTE
  document.addEventListener('copy', (e) => {
    e.clipboardData.setData('text/plain', '🔒 Código protegido - WZ Solution');
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  document.addEventListener('cut', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  document.addEventListener('paste', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  // 🔒 4. BLOQUEAR INSERÇÃO DE SCRIPTS MALICIOSOS
  // ✅ AJUSTE: Permitir Tailwind CDN e scripts necessários para o site funcionar
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child: any) {
    if (child.tagName === 'SCRIPT') {
      const script = child as HTMLScriptElement;
      // ✅ Permitir Tailwind CDN e scripts inline
      if (script.src && (script.src.includes('cdn.tailwindcss.com') || script.src.includes('tailwind'))) {
        return originalAppendChild.call(this, child);
      }
      // ✅ Permitir scripts inline (sem src) - necessários para o site funcionar
      if (!script.src) {
        return originalAppendChild.call(this, child);
      }
      // Bloquar outros scripts externos por segurança
      if (!script.dataset.allowed) {
        // console.warn('🔒 Script bloqueado por segurança');
        return child;
      }
    }
    return originalAppendChild.call(this, child);
  };
  
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode: any, referenceNode: any) {
    if (newNode.tagName === 'SCRIPT') {
      const script = newNode as HTMLScriptElement;
      // ✅ Permitir Tailwind CDN
      if (script.src && (script.src.includes('cdn.tailwindcss.com') || script.src.includes('tailwind'))) {
        return originalInsertBefore.call(this, newNode, referenceNode);
      }
      // ✅ Permitir scripts inline
      if (!script.src) {
        return originalInsertBefore.call(this, newNode, referenceNode);
      }
      // Bloquar outros scripts externos
      if (!script.dataset.allowed) {
        // console.warn('🔒 Script bloqueado por segurança');
        return newNode;
      }
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
  
  // 🔒 5. REMOVER INFORMAÇÕES SENSÍVEIS DO DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Remover atributos que podem expor dados
          // Remover atributos sensíveis
          ['data-api-key', 'data-token', 'data-secret', 'api-key', 'auth-token', 'access-token'].forEach(attr => {
            if (node.hasAttribute(attr)) {
              node.removeAttribute(attr);
            }
          });
          // Bloquear iframes externos
          if (node.tagName === 'IFRAME' && !node.src.startsWith(window.location.origin)) {
            node.remove();
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-api-key', 'data-token', 'data-secret', 'api-key', 'auth-token', 'access-token', 'src']
  });
  
  // 🔒 6. BLOQUEAR ACESSO A OBJETOS SENSÍVEIS
  Object.defineProperty(window, 'localStorage', {
    get: () => {
      console.warn('🔒 Acesso a localStorage bloqueado');
      return {};
    },
    set: () => {},
    configurable: false
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    get: () => {
      console.warn('🔒 Acesso a sessionStorage bloqueado');
      return {};
    },
    set: () => {},
    configurable: false
  });
  
  // 🔒 BLOQUEAR process.env (se por algum motivo estiver disponível)
  try {
    if (typeof process !== 'undefined' && process.env) {
      Object.defineProperty(process, 'env', {
        get: () => ({}),
        configurable: false
      });
    }
  } catch(e) {}
  
  // 🔒 BLOQUEAR window.location.search e hash (podem conter tokens em URLs)
  try {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      get: () => ({
        ...originalLocation,
        search: '', // Remover query params que podem conter tokens
        hash: ''    // Remover hash que pode conter tokens
      }),
      configurable: false
    });
  } catch(e) {}
  
  // 🔒 7. WATERMARK VISUAL PERMANENTE
  const watermark = document.createElement('div');
  watermark.id = 'wz-security-watermark';
  watermark.style.cssText = \`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 999999;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 100px,
      rgba(0,0,0,0.03) 100px,
      rgba(0,0,0,0.03) 200px
    );
    user-select: none;
  \`;
  
  const watermarkText = document.createElement('div');
  watermarkText.textContent = 'PREVIEW PROTEGIDO • WZ SOLUTION';
  watermarkText.style.cssText = \`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 48px;
    color: rgba(0,0,0,0.05);
    font-weight: bold;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  \`;
  
  watermark.appendChild(watermarkText);
  document.body.appendChild(watermark);
  
  // 🔒 8. BLOQUEAR PRINT SCREEN (tentativa)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'PrintScreen') {
      navigator.clipboard.writeText('');
      e.preventDefault();
    }
  });
  
  // 🔒 9. REMOVER CÓDIGO DO HTML APÓS CARREGAR
  setTimeout(() => {
    const scripts = document.querySelectorAll('script[type="text/plain"]');
    scripts.forEach(script => script.remove());
  }, 1000);
  
  // 🔒 10. PROTEGER CONTRA REATRIBUIÇÃO DE CONSOLE
  setInterval(() => {
    if (window.console !== fakeConsole) {
      try {
        Object.defineProperty(window, 'console', {
          value: fakeConsole,
          writable: false,
          configurable: false
        });
      } catch(e) {}
    }
  }, 100);
  
  // 🔒 11. BLOQUEAR WINDOW.CONSOLE DIRETAMENTE
  try {
    delete window.console;
    window.console = fakeConsole;
  } catch(e) {}
  
  // 🔒 12. BLOQUEAR VIA PROXY (se suportado)
  try {
    if (typeof Proxy !== 'undefined') {
      window.console = new Proxy(fakeConsole, {
        get: function(target, prop) {
          return noop;
        },
        set: function() {
          return false;
        }
      });
    }
  } catch(e) {}
  
  // 🔒 13. AVISO NO CONSOLE (se ainda conseguir abrir)
  if (typeof console !== 'undefined' && console.log) {
    try {
      console.log('%c🔒 CÓDIGO PROTEGIDO', 'color: red; font-size: 24px; font-weight: bold;');
      console.log('%cEste código é propriedade da WZ Solution', 'color: red; font-size: 16px;');
      console.log('%cAcesso não autorizado é proibido', 'color: red; font-size: 16px;');
    } catch(e) {}
  }
  
  } catch(e) {
    // Silenciar erros para não expor informações
  }
})();
// 🔒 FIM DA PROTEÇÃO DE SEGURANÇA
</script>
  `;
  
  // ✅ INJETAR NO INÍCIO DO <head> para garantir execução ANTES de outros scripts
  // Esta é a forma mais eficaz de garantir que o script execute primeiro
  if (html.includes('<head>')) {
    // Injetar imediatamente após <head>
    html = html.replace('<head>', '<head>' + securityScript);
  } else if (html.includes('</head>')) {
    // Se já tem </head>, injetar antes dele
    html = html.replace('</head>', securityScript + '</head>');
  } else if (html.includes('<html')) {
    // Se não tem <head>, criar um antes do <html>
    html = html.replace('<html', '<head>' + securityScript + '</head><html');
  } else if (html.includes('<!DOCTYPE')) {
    // Se tem DOCTYPE, injetar após ele mas antes de tudo
    const doctypeMatch = html.match(/<!DOCTYPE[^>]*>/i);
    if (doctypeMatch) {
      html = html.replace(doctypeMatch[0], doctypeMatch[0] + '<head>' + securityScript + '</head>');
    }
  } else {
    // Último recurso: início do documento com <head>
    html = '<head>' + securityScript + '</head>' + html;
  }
  
  return html;
}

/**
 * Remove informações sensíveis do código antes de servir
 */
export function sanitizeCodeForPreview(code: string): string {
  // 🔒 REMOVER APENAS COMENTÁRIOS HTML (que podem conter tokens)
  // ✅ NÃO remover comentários CSS dentro de <style> - eles são código válido!
  // ✅ NÃO remover comentários JS dentro de <script> - eles são código válido!
  code = code.replace(/<!--[\s\S]*?-->/g, '');
  
  // ⚠️ NÃO remover comentários CSS/JS dentro de tags - isso quebra o código!
  // Remover apenas comentários soltos que possam conter tokens
  // code = code.replace(/\/\*[\s\S]*?\*\//g, ''); // REMOVIDO - quebra CSS válido
  // code = code.replace(/\/\/.*$/gm, ''); // REMOVIDO - quebra JS válido
  
  // 🔒 REMOVER ATRIBUTOS DE API KEYS (múltiplos padrões)
  code = code.replace(/data-api-key=["'][^"']*["']/gi, '');
  code = code.replace(/data-token=["'][^"']*["']/gi, '');
  code = code.replace(/data-secret=["'][^"']*["']/gi, '');
  code = code.replace(/api[_-]?key=["'][^"']*["']/gi, '');
  code = code.replace(/auth[_-]?token=["'][^"']*["']/gi, '');
  code = code.replace(/secret[_-]?key=["'][^"']*["']/gi, '');
  code = code.replace(/access[_-]?token=["'][^"']*["']/gi, '');
  
  // 🔒 REMOVER PATTERNS DE TOKENS EM TEXTO
  // Padrão: sk-ant-xxxxx, sk-xxxxx, pat-xxxxx, etc
  code = code.replace(/\b(sk-ant-[a-zA-Z0-9_-]{20,})\b/gi, '[TOKEN_REMOVIDO]');
  code = code.replace(/\b(sk-[a-zA-Z0-9_-]{20,})\b/gi, '[TOKEN_REMOVIDO]');
  code = code.replace(/\b(pat-[a-zA-Z0-9_-]{20,})\b/gi, '[TOKEN_REMOVIDO]');
  code = code.replace(/\b(hub_[a-zA-Z0-9_-]{20,})\b/gi, '[TOKEN_REMOVIDO]');
  
  // 🔒 REMOVER FETCH/AXIOS CALLS COM TOKENS
  code = code.replace(/fetch\([^)]*['"]\s*,\s*\{[^}]*headers[^}]*Authorization[^}]*\}[^)]*\)/gi, '');
  code = code.replace(/axios\.(get|post|put|delete)\([^)]*['"]\s*,\s*\{[^}]*headers[^}]*Authorization[^}]*\}[^)]*\)/gi, '');
  
  // 🔒 REMOVER XMLHttpRequest COM TOKENS
  code = code.replace(/xhr\.setRequestHeader\(['"]Authorization['"][^)]*\)/gi, '');
  
  // 🔒 REMOVER VARIÁVEIS DE AMBIENTE QUE PODEM SER EXPOSTAS
  code = code.replace(/process\.env\.(ANTHROPIC_API_KEY|OPENAI_API_KEY|HUBSPOT_API_KEY|SUPABASE_SERVICE_ROLE_KEY)/gi, '[ENV_VAR_REMOVIDA]');
  
  // Adicionar watermark CSS
  const watermarkCSS = `
<style id="wz-security-watermark-css">
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 999998;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 50px,
    rgba(0,0,0,0.02) 50px,
    rgba(0,0,0,0.02) 100px
  );
}
</style>
  `;
  
  if (code.includes('</head>')) {
    code = code.replace('</head>', watermarkCSS + '</head>');
  } else if (code.includes('<body')) {
    code = code.replace('<body', watermarkCSS + '<body');
  }
  
  return code;
}

