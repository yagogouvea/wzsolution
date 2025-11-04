'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGoogleAnalytics } from '@/components/GoogleAnalytics';

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const { trackEvent } = useGoogleAnalytics();

  useEffect(() => {
    setMounted(true);
    
    // Proteção adicional: garantir que nenhum interceptador global interfira
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Se o clique foi no botão flutuante ou seus filhos, garantir que funciona
      if (target.closest('[aria-label="Contato via WhatsApp"]')) {
        // O handler do botão já vai tratar, mas garantimos que não seja bloqueado
        e.stopImmediatePropagation();
      }
    };
    
    // Adicionar listener na fase de captura para interceptar antes de outros
    document.addEventListener('click', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  const handleWhatsAppClick = (e?: React.MouseEvent) => {
    // Prevenir comportamento padrão se houver evento
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation(); // IMPORTANTE: parar TODOS os handlers
    }
    
    // Log para debug
    console.log('📱 [WhatsAppButton] Clique detectado');
    
    try {
      // Track WhatsApp click (não bloquear se falhar)
      try {
        trackEvent('whatsapp_click', {
          button_location: 'floating_button',
          phone_number: '5511947293221',
        });
      } catch (trackError) {
        console.warn('Erro ao rastrear evento:', trackError);
      }
      
      // Garantir número sempre correto - CONSTANTE para evitar qualquer modificação
      const PHONE_NUMBER = '5511947293221';
      const DEFAULT_MESSAGE = 'Olá! Gostaria de saber mais sobre os serviços da WZ Solution.';
      
      // Validar número antes de construir URL
      if (!PHONE_NUMBER || PHONE_NUMBER.length < 10 || !/^\d+$/.test(PHONE_NUMBER)) {
        console.error('❌ [WhatsAppButton] Número do WhatsApp inválido:', PHONE_NUMBER);
        return;
      }
      
      // Construir URL de forma segura
      const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);
      const url = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
      
      // Validar URL antes de abrir - múltiplas verificações
      if (!url || 
          url === 'https://wa.me/' || 
          url === 'https://wa.me' ||
          url.indexOf('wa.me/') === -1 ||
          !url.includes(PHONE_NUMBER)) {
        console.error('❌ [WhatsAppButton] URL do WhatsApp inválida:', {
          url,
          hasPhoneNumber: url.includes(PHONE_NUMBER),
          urlLength: url.length
        });
        // Criar URL de fallback garantida
        const fallbackUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
        console.log('📱 [WhatsAppButton] Usando URL de fallback:', fallbackUrl);
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      
      console.log('📱 [WhatsAppButton] Abrindo WhatsApp:', {
        url,
        phoneNumber: PHONE_NUMBER,
        urlLength: url.length
      });
      
      // Tentar abrir em nova janela - usar múltiplas estratégias
      let opened = false;
      
      // Estratégia 1: window.open normal
      try {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          opened = true;
          console.log('✅ [WhatsAppButton] WhatsApp aberto em nova janela');
        }
      } catch (openError) {
        console.warn('⚠️ [WhatsAppButton] window.open falhou:', openError);
      }
      
      // Estratégia 2: Se window.open foi bloqueado, tentar criar link temporário
      if (!opened) {
        try {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          opened = true;
          console.log('✅ [WhatsAppButton] WhatsApp aberto via link temporário');
        } catch (linkError) {
          console.warn('⚠️ [WhatsAppButton] Link temporário falhou:', linkError);
        }
      }
      
      // Estratégia 3: Último recurso - redirecionar na mesma janela
      if (!opened) {
        console.log('📱 [WhatsAppButton] Redirecionando na mesma janela (fallback)');
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erro no handleWhatsAppClick:', error);
      // Fallback: tentar abrir com URL padrão
      const fallbackUrl = 'https://wa.me/5511947293221?text=' + encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços da WZ Solution.');
      try {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = fallbackUrl;
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-8 left-8 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 z-[9999]"
      aria-label="Contato via WhatsApp"
      type="button"
      style={{ pointerEvents: 'auto' }}
    >
      <MessageCircle className="w-7 h-7" />
    </motion.button>
  );
}
