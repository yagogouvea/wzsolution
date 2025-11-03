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

    // Bloquear DevTools
    const blockDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-family:monospace;font-size:24px;">🔒 Acesso bloqueado - WZ Solution</div>';
      }
    };

    const devToolsInterval = setInterval(blockDevTools, 500);

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

