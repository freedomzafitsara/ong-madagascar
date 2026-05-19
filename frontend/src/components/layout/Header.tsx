'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Globe, ChevronDown, User, 
  LayoutDashboard, LogOut, Heart, Home,
  FolderTree, Calendar, Briefcase, Newspaper, Mail
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks = [
    { nameFr: 'Accueil', nameMg: 'Fandraisana', href: '/', icon: Home },
    { nameFr: 'Projets', nameMg: 'Tetikasa', href: '/projects', icon: FolderTree },
    { nameFr: 'Événements', nameMg: 'Hetsika', href: '/events', icon: Calendar },
    { nameFr: 'Emploi', nameMg: 'Asa', href: '/emploi', icon: Briefcase },
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
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const hasDashboardAccess = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'staff';

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled ? 'bg-gray-800 shadow-md py-2' : 'bg-gray-800 py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* ==================== LOGO + TEXTE ALIGNÉ HORIZONTALEMENT ==================== */}
            <Link href="/" className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded-xl flex items-center justify-center border border-gray-600">
                <Image
                  src="/images/logo-ymad.png"
                  alt="Y-Mad"
                  width={40}
                  height={40}
                  className="object-contain p-1"
                  priority
                />
              </div>
              
              {/* Texte aligné horizontalement */}
              <div className="hidden sm:block">
                <span className="text-white font-medium text-sm md:text-base">
                  Young for{' '}
                </span>
                <span className="text-blue-400 font-semibold text-sm md:text-base">
                  Madagascar Development
                </span>
              </div>
            </Link>

            {/* ==================== DESKTOP NAVIGATION ==================== */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-gray-300 hover:text-blue-400 hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {getNavName(link)}
                </Link>
              ))}
            </nav>

            {/* ==================== DESKTOP ACTIONS ==================== */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/join"
                className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
              >
                {language === 'fr' ? 'Adhérer' : 'Hanaramaso'}
              </Link>

              <Link
                href="/donate"
                className="flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full transition-colors"
              >
                <Heart className="w-3 h-3" />
                {language === 'fr' ? 'Donner' : 'Hanome'}
              </Link>

              {/* Language Selector */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-2 w-24 bg-gray-700 rounded-lg shadow-lg py-1 z-50 border border-gray-600">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`block w-full px-3 py-1.5 text-sm text-left ${language === 'fr' ? 'text-blue-400 bg-gray-600' : 'text-gray-300 hover:bg-gray-600'}`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => handleLanguageChange('mg')}
                      className={`block w-full px-3 py-1.5 text-sm text-left ${language === 'mg' ? 'text-blue-400 bg-gray-600' : 'text-gray-300 hover:bg-gray-600'}`}
                    >
                      Malagasy
                    </button>
                  </div>
                )}
              </div>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{getUserInitial()}</span>
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUserOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isUserOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-50 border border-gray-600">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                      >
                        <User className="w-4 h-4" />
                        {language === 'fr' ? 'Mon profil' : 'Ny momba ahy'}
                      </Link>
                      {hasDashboardAccess && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {language === 'fr' ? 'Administration' : 'Fitantanana'}
                        </Link>
                      )}
                      <div className="border-t border-gray-600 my-1"></div>
                      <button
                        onClick={() => {
                          setIsUserOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
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
                  className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {language === 'fr' ? 'Connexion' : 'Hiditra'}
                </Link>
              )}
            </div>

            {/* ==================== MOBILE MENU BUTTON ==================== */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:text-blue-400 hover:bg-gray-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* ==================== MOBILE MENU ==================== */}
          {isMenuOpen && (
            <div className="lg:hidden mt-3 pb-3 border-t border-gray-700 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActiveLink(link.href)
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {getNavName(link)}
                </Link>
              ))}
              
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-700">
                <div className="flex gap-3">
                  <Link href="/join" onClick={() => setIsMenuOpen(false)} className="text-xs text-gray-300 hover:text-blue-400">
                    {language === 'fr' ? 'Adhérer' : 'Hanaramaso'}
                  </Link>
                  <Link href="/donate" onClick={() => setIsMenuOpen(false)} className="text-xs text-gray-300 hover:text-blue-400">
                    {language === 'fr' ? 'Donner' : 'Hanome'}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`text-xs px-2 py-0.5 rounded ${language === 'fr' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      FR
                    </button>
                    <button
                      onClick={() => handleLanguageChange('mg')}
                      className={`text-xs px-2 py-0.5 rounded ${language === 'mg' ? 'text-blue-400' : 'text-gray-400'}`}
                    >
                      MG
                    </button>
                  </div>
                  {isAuthenticated ? (
                    <button onClick={() => { setIsMenuOpen(false); logout(); }} className="text-xs text-gray-300 hover:text-blue-400">
                      {language === 'fr' ? 'Déconnexion' : 'Fivoahana'}
                    </button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-xs text-gray-300 hover:text-blue-400">
                      {language === 'fr' ? 'Connexion' : 'Hiditra'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14 md:h-16"></div>
    </>
  );
}