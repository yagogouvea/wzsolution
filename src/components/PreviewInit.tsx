'use client';

import { useEffect } from 'react';

export default function PreviewInit() {
  useEffect(() => {
    // Adicionar classe preview-mode no body
    document.body.classList.add('preview-mode');
    
    // Ajustar main para fullscreen
    const main = document.querySelector('main');
    if (main) {
      main.style.cssText = 'height: 100vh; margin: 0; padding: 0;';
    }
  }, []);

  return null;
}

