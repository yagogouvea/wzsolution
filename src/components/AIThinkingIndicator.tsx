'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface AIThinkingIndicatorProps {
  message?: string;
}

export default function AIThinkingIndicator({ message = 'Analisando seu pedido...' }: AIThinkingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-pulse">
      <div className="relative">
        <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
        <Sparkles className="w-3 h-3 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message}
          <span className="inline-block w-4 text-blue-600 dark:text-blue-400">{dots}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          A IA está processando suas informações
        </p>
      </div>
    </div>
  );
}

