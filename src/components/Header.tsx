'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveSection('home');
    
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
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Início' },
    { id: 'about', label: 'WZ Solution' },
    { id: 'budget', label: 'Orçamento' },
    { id: 'contact', label: 'Contato' },
  ];

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <button className="text-3xl font-bold text-gradient cursor-pointer">
                WZ Solution
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
            className="flex-shrink-0"
          >
            <button
              onClick={() => scrollToSection('home')}
              className="text-3xl font-bold text-gradient cursor-pointer"
            >
              WZ Solution
            </button>
          </motion.div>

          {/* Desktop Menu */}
          <nav className="hidden md:block">
            <div className="flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                    activeSection === item.id
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-400/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Language Switcher & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white transition-colors duration-300"
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
              {menuItems.map((item) => (
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
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
