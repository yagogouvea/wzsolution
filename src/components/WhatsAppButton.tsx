'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '5511947293221'; // Número atualizado
    const message = 'Olá! Gostaria de saber mais sobre os serviços da WZ Solution.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
      className="fixed bottom-8 left-8 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 z-40"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.button>
  );
}
