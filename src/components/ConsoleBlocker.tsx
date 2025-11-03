/**
 * 🔒 Componente para bloquear console na área de conversa
 * Evita que usuários vejam logs ou acessem DevTools
 */

'use client';

import { useEffect } from 'react';

export default function ConsoleBlocker() {
  useEffect(() => {
    // Bloquear console imediatamente
    const noop = function() {};
    const fakeConsole = {
      log: noop, warn: noop, error: noop, info: noop, debug: noop,
      trace: noop, dir: noop, dirxml: noop, group: noop, groupEnd: noop,
      time: noop, timeEnd: noop, assert: noop, profile: noop, profileEnd: noop,
      count: noop, clear: noop, table: noop, memory: {}, exception: noop
    };

    // Múltiplas camadas de proteção
    try {
      Object.defineProperty(window, 'console', {
        value: fakeConsole,
        writable: false,
        configurable: false,
        enumerable: false
      });
    } catch(e) {}

    try {
      window.console = fakeConsole;
    } catch(e) {}

    // Proteger continuamente
    const protectInterval = setInterval(() => {
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

    // Bloquear DevTools (mas NÃO em mobile/iPhone)
    const blockDevTools = () => {
      // ✅ Detectar se é mobile/iPhone para não bloquear
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       window.innerWidth < 768 ||
                       ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0);
      
      // Em mobile, não bloquear - diferenças de viewport são normais
      if (isMobile) {
        return;
      }
      
      // Em desktop, usar threshold mais alto e verificar múltiplas condições
      const threshold = 200; // Aumentado de 160 para 200
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // ✅ Apenas bloquear se diferença for SIGNIFICATIVA e consistente
      // Não bloquear se for apenas uma pequena diferença de viewport
      if ((heightDiff > threshold || widthDiff > threshold) && 
          heightDiff < window.innerHeight * 0.5 && // Não bloquear se diferença for muito grande (pode ser redimensionamento normal)
          widthDiff < window.innerWidth * 0.5) {
        // ✅ Apenas avisar, não bloquear completamente no chat
        // O bloqueio completo só deve acontecer no preview do site gerado, não no chat
        console.warn('🔒 DevTools detectado');
      }
    };

    const devToolsInterval = setInterval(blockDevTools, 1000); // Reduzido de 500ms para 1000ms

    // Bloquear teclas de atalho
    const blockKeys = (e: KeyboardEvent) => {
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
      // Ctrl+U
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', blockKeys, true);

    // Cleanup
    return () => {
      clearInterval(protectInterval);
      clearInterval(devToolsInterval);
      document.removeEventListener('keydown', blockKeys, true);
    };
  }, []);

  return null;
}

