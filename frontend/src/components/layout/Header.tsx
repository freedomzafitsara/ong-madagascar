'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Globe, ChevronDown, User, 
  LayoutDashboard, LogOut, Home,
  FolderTree, Briefcase, Newspaper, Mail
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation principale
  const navLinks = [
    { nameFr: 'Accueil', nameMg: 'Fandraisana', href: '/', icon: Home },
    { nameFr: 'Projets', nameMg: 'Tetikasa', href: '/projects', icon: FolderTree },
    { nameFr: 'Offres d\'emploi', nameMg: 'Toerana asa', href: '/jobs', icon: Briefcase },
    { nameFr: 'Blog', nameMg: 'Vaovao', href: '/blog', icon: Newspaper },
    { nameFr: 'Contact', nameMg: 'Fifandraisana', href: '/contact', icon: Mail },
  ];

  const getNavName = (link: typeof navLinks[0]) => {
    return language === 'fr' ? link.nameFr : link.nameMg;
  };

  const handleLanguageChange = (lang: 'fr' | 'mg') => {
    setLanguage(lang);
    setIsLangOpen(false);
  };

  const getUserInitial = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  const hasDashboardAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* ==================== LOGO ==================== */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo-ymad.png"
                  alt="Y-MaD - Jeunesse pour Madagascar"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-medium text-sm leading-tight">
                  Young for <span className="text-blue-400 font-semibold">Madagascar</span>
                </p>
                <p className="text-white/60 text-[10px] leading-tight tracking-wide">
                  Jeunesse & Développement
                </p>
              </div>
            </Link>

            {/* ==================== NAVIGATION DESKTOP ==================== */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-white bg-blue-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {getNavName(link)}
                </Link>
              ))}
            </nav>

            {/* ==================== ACTIONS DESKTOP ==================== */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Sélecteur de langue */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-mono text-sm">{language.toUpperCase()}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-28 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        language === 'fr' ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => handleLanguageChange('mg')}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        language === 'mg' ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Malagasy
                    </button>
                  </div>
                )}
              </div>

              {/* Menu utilisateur */}
              {isAuthenticated ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{getUserInitial()}</span>
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isUserOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        {language === 'fr' ? 'Mon profil' : 'Ny momba ahy'}
                      </Link>
                      {hasDashboardAccess && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {language === 'fr' ? 'Administration' : 'Fitantanana'}
                        </Link>
                      )}
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          setIsUserOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {language === 'fr' ? 'Déconnexion' : 'Fivoahana'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {language === 'fr' ? 'Connexion' : 'Hiditra'}
                </Link>
              )}
            </div>

            {/* ==================== MENU MOBILE ==================== */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Menu mobile déroulant */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActiveLink(link.href)
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {getNavName(link)}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-700">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLanguageChange('fr')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      language === 'fr' ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => handleLanguageChange('mg')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      language === 'mg' ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Malagasy
                  </button>
                </div>
                {isAuthenticated ? (
                  <button onClick={() => { setIsMenuOpen(false); logout(); }} className="text-sm text-gray-400 hover:text-blue-400">
                    {language === 'fr' ? 'Déconnexion' : 'Fivoahana'}
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-400 hover:text-blue-400">
                    {language === 'fr' ? 'Connexion' : 'Hiditra'}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Espace réservé pour le header fixe */}
      <div className="h-16"></div>
    </>
  );
}