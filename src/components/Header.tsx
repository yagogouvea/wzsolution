'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser, signOut, supabaseAuth } from '@/lib/auth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false); // ✅ Começar como false para mostrar botão imediatamente

  useEffect(() => {
    setMounted(true);
    setActiveSection('home');
    
    // ✅ Verificar usuário logado em background (não bloquear renderização)
    getCurrentUser()
      .then(user => {
        console.log('🔐 [Header] Usuário obtido:', user ? user.email : 'não logado');
        setUser(user);
      })
      .catch((error) => {
        console.error('❌ [Header] Erro ao obter usuário:', error);
        // Não fazer nada - user permanece null, botão "Entrar" já está visível
      });

    // Observar mudanças de autenticação (com tratamento de erro)
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const authState = supabaseAuth.auth.onAuthStateChange((_event: string, session: any) => {
        console.log('🔄 [Header] Mudança de autenticação:', _event, session?.user?.email || 'sem usuário');
        setUser(session?.user ?? null);
      });
      subscription = authState.data.subscription;
    } catch (error) {
      console.warn('⚠️ [Header] Erro ao configurar observador de autenticação:', error);
      // Não fazer nada - botão já está visível
    }

    const handleScroll = () => {
      const sections = ['home', 'about', 'budget', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    // Só adiciona o listener após a hidratação
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Redirecionar "Contato" para área de orçamento
    const targetSectionId = sectionId === 'contact' ? 'budget' : sectionId;
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      const element = document.getElementById(targetSectionId);
      if (element) {
        // Calcular posição considerando o header fixo
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        // Se não encontrou, tentar procurar em iframes
        console.warn(`Seção "${targetSectionId}" não encontrada. Tentando buscar no iframe...`);
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentWindow) {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const iframeElement = iframeDoc.getElementById(targetSectionId);
            if (iframeElement) {
              iframeElement.scrollIntoView({ behavior: 'smooth' });
            }
          } catch (e) {
            console.warn('Não foi possível acessar o iframe:', e);
          }
        }
      }
    }, 100);
    
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'about', label: 'Serviços' },
    { id: 'ia-site', label: 'IA Site', isLink: true, href: '/ia-criador-site-v3' },
    { id: 'budget', label: 'Orçamento' },
  ];

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 mr-8">
              <button className="text-3xl font-bold text-gradient cursor-pointer whitespace-nowrap">
                WZ Solutions
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 mr-8"
          >
            <button
              onClick={() => scrollToSection('home')}
              className="text-3xl font-bold text-gradient cursor-pointer whitespace-nowrap"
            >
              WZ Solutions
            </button>
          </motion.div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex items-center space-x-6">
              {menuItems.map((item) => {
                if ((item as any).isLink && (item as any).href) {
                  return (
                    <Link
                      key={item.id}
                      href={(item as any).href}
                      className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                        activeSection === item.id
                          ? 'text-cyan-400 bg-cyan-400/10'
                          : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-400/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-400/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Side: Contato Button & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0 ml-8">
            {/* Contato Button */}
            <button
              onClick={() => scrollToSection('budget')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-base font-medium transition-all duration-300 whitespace-nowrap"
            >
              Contato
            </button>
            {/* ✅ SEMPRE renderizar botões - mostrar "Entrar" por padrão se não houver usuário */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/cliente"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Área do Cliente</span>
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    setUser(null);
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 text-slate-300 hover:text-white text-sm transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Entrar</span>
              </Link>
            )}
            
            {/* Spinner opcional apenas durante carregamento inicial (primeiro segundo) */}
            {isLoadingUser && !user && (
              <div className="flex items-center gap-2 px-2 text-slate-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-400"></div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white transition-colors duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => {
                if ((item as any).isLink && (item as any).href) {
                  return (
                    <Link
                      key={item.id}
                      href={(item as any).href}
                      className={`block w-full text-left px-4 py-3 rounded-md text-lg font-medium transition-all duration-300 ${
                        activeSection === item.id
                          ? 'text-cyan-400 bg-cyan-400/10'
                          : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-400/5'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-4 py-3 rounded-md text-lg font-medium transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-400/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => scrollToSection('budget')}
                className="block w-full text-left px-4 py-3 rounded-md text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Contato
              </button>
              {!isLoadingUser && (
                <div className="pt-2 border-t border-slate-700">
                  {user ? (
                    <>
                      <Link
                        href="/cliente"
                        className="block px-4 py-3 rounded-md text-lg font-medium text-purple-300 hover:bg-purple-600/10 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Área do Cliente
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut();
                          setUser(null);
                          setIsMenuOpen(false);
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-3 rounded-md text-lg font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-3 rounded-md text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Entrar
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
