'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  
  // Get current language from pathname
  const currentLang = pathname.startsWith('/en') ? 'en' : 'pt';
  
  // Get the path without language prefix
  const pathWithoutLang = pathname.replace(/^\/(pt|en)/, '') || '/';
  
  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-slate-300" />
      <div className="flex space-x-1">
        <Link
          href={`/pt${pathWithoutLang}`}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentLang === 'pt'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          🇧🇷 PT
        </Link>
        <Link
          href={`/en${pathWithoutLang}`}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentLang === 'en'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          🇺🇸 EN
        </Link>
      </div>
    </div>
  );
}
