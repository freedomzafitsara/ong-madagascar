// frontend/src/components/layout/Header.tsx

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, X, Globe, ChevronDown, User, 
  LayoutDashboard, LogOut, Home,
  FolderTree, Briefcase, Newspaper, Mail,
  UserCircle, Settings, Heart, FileText,
  Shield, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// ============================================================
// CONSTANTES
// ============================================================

const ADMIN_ROLES = ['super_admin', 'admin'] as const;
type AdminRole = typeof ADMIN_ROLES[number];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  
  // ============================================================
  // ÉTATS
  // ============================================================
  
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isUserOpen, setIsUserOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // ============================================================
  // REFS
  // ============================================================
  
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // TRADUCTION
  // ============================================================

  const t = useCallback((fr: string, mg: string): string => {
    return language === 'fr' ? fr : mg;
  }, [language]);

  // ============================================================
  // EFFETS
  // ============================================================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user?.avatar_url) {
      setAvatarUrl(null);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
      const url = user.avatar_url.startsWith('http') 
        ? user.avatar_url 
        : `${baseUrl}${user.avatar_url}`;
      setAvatarUrl(url);
    } catch (error) {
      console.error('[Header] Erreur de chargement de l\'avatar:', error);
      setAvatarUrl(null);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (langRef.current && !langRef.current.contains(target)) {
        setIsLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // ============================================================
  // FONCTIONS UTILITAIRES
  // ============================================================

  const navLinks = useMemo(() => [
    { nameFr: 'Accueil', nameMg: 'Fandraisana', href: '/', icon: Home },
    { nameFr: 'Projets', nameMg: 'Tetikasa', href: '/projects', icon: FolderTree },
    { nameFr: 'Offres d\'emploi', nameMg: 'Toerana asa', href: '/jobs', icon: Briefcase },
    { nameFr: 'Blog', nameMg: 'Vaovao', href: '/blog', icon: Newspaper },
    { nameFr: 'Contact', nameMg: 'Fifandraisana', href: '/contact', icon: Mail },
  ], []);

  const getNavName = useCallback((link: typeof navLinks[0]) => {
    return language === 'fr' ? link.nameFr : link.nameMg;
  }, [language]);

  const isActiveLink = useCallback((href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  }, [pathname]);

  const getUserInitial = useCallback((): string => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  }, [user]);

  const getUserFullName = useCallback((): string => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Utilisateur';
  }, [user]);

  const hasDashboardAccess = useCallback((): boolean => {
    return user?.role === 'super_admin' || user?.role === 'admin';
  }, [user]);

  const isCandidate = useCallback((): boolean => {
    return user?.role === 'candidate';
  }, [user]);

  const getUserRoleLabel = useCallback((): string => {
    const role = user?.role;
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    if (role === 'candidate') return t('Candidat', 'Mpangataka');
    if (role === 'visitor') return t('Visiteur', 'Mpitsidika');
    return role || 'Utilisateur';
  }, [user, t]);

  // ============================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================

  const handleLanguageChange = useCallback((lang: 'fr' | 'mg') => {
    setLanguage(lang);
    setIsLangOpen(false);
  }, [setLanguage]);

  const handleLogout = useCallback(() => {
    setIsUserOpen(false);
    setIsMenuOpen(false);
    logout();
    toast.success(t('Déconnexion réussie', 'Vita ny fivoahana'));
    router.push('/');
  }, [logout, router, t]);

  const handleProfileClick = useCallback(() => {
    setIsUserOpen(false);
    setIsMenuOpen(false);
    
    if (!isAuthenticated || !user) {
      toast(t(
        'Veuillez vous connecter pour accéder à votre profil.',
        'Mba midira aloha vao hahita ny momba anao.'
      ), {
        duration: 4000,
        style: { background: '#3b82f6', color: '#ffffff' },
      });
      router.push('/login');
      return;
    }

    const role = user.role;
    
    if (role === 'super_admin' || role === 'admin') {
      router.push('/dashboard/profil-admin');
    } else if (role === 'candidate') {
      router.push('/candidat/profil-candidat');
    } else {
      toast(t(
        'Votre espace personnel est en cours de configuration.',
        'Ny toeranao manokana dia mbola amboarina.'
      ), {
        duration: 4000,
        style: { background: '#f59e0b', color: '#ffffff' },
      });
      router.push('/');
    }
  }, [isAuthenticated, user, router, t]);

  // ============================================================
  // GESTIONNAIRE DASHBOARD
  // ============================================================

  const handleDashboardClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsUserOpen(false);
    setIsMenuOpen(false);
    
    if (!isAuthenticated || !user) {
      toast(t(
        'Veuillez vous connecter pour accéder au tableau de bord.',
        'Mba midira aloha vao hahita ny dashboard.'
      ), {
        duration: 4000,
        style: { background: '#3b82f6', color: '#ffffff' },
      });
      router.push('/login');
      return;
    }

    const role = user.role;
    
    if (role === 'admin' || role === 'super_admin') {
      router.push('/dashboard');
    } else {
      toast(t(
        'Vous n\'avez pas les droits pour accéder au tableau de bord.',
        'Tsy manana zo hiditra amin\'ny dashboard ianao.'
      ), {
        duration: 4000,
        style: { background: '#ef4444', color: '#ffffff' },
      });
      router.push('/');
    }
  }, [isAuthenticated, user, router, t]);

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' 
            : 'bg-gray-800 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* LOGO */}
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-3 group flex-shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo-ymad.png"
                  alt="Y-MaD - Young for Madagascar Development"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden xs:block">
                <p className="text-white font-medium text-xs sm:text-sm leading-tight">
                  Young for <span className="text-blue-400 font-semibold">Madagascar</span> Development
                </p>
                <p className="text-white/50 text-[8px] sm:text-[10px] leading-tight tracking-wide">
                  {t('Plateforme de gestion des offres d\'emploi', 'Fitantanana ny asa')}
                </p>
              </div>
            </Link>

            {/* NAVIGATION DESKTOP */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-white bg-blue-600'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  <span className="hidden xl:inline">{getNavName(link)}</span>
                </Link>
              ))}
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              
              {/* SÉLECTEUR DE LANGUE */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  aria-label={t('Changer la langue', 'Hanova ny fiteny')}
                >
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-mono text-[10px] sm:text-xs">{language.toUpperCase()}</span>
                  <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLangOpen && (
                  <div className="absolute top-full right-0 mt-1 sm:mt-2 w-24 sm:w-28 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                    <button
                      onClick={() => handleLanguageChange('fr')}
                      className={`block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                        language === 'fr' ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => handleLanguageChange('mg')}
                      className={`block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                        language === 'mg' ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Malagasy
                    </button>
                  </div>
                )}
              </div>

              {/* MENU UTILISATEUR */}
              {isAuthenticated ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setIsUserOpen(!isUserOpen)}
                    className="flex items-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-2 sm:py-1 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                    aria-label={t('Menu utilisateur', 'Mpampiasa')}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-blue-400/50">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={getUserFullName()} 
                            className="w-full h-full rounded-full object-cover"
                            onError={() => setAvatarUrl(null)}
                          />
                        ) : (
                          <span className="text-white text-xs sm:text-sm font-semibold">
                            {getUserInitial()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>
                    
                    <span className="hidden sm:inline text-xs truncate max-w-[60px]">
                      {getUserFullName()}
                    </span>
                    <ChevronDown className={`w-3 h-3 hidden sm:block transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserOpen && (
                    <div className="absolute right-0 mt-1 sm:mt-2 w-56 sm:w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-blue-400/50">
                              {avatarUrl ? (
                                <img 
                                  src={avatarUrl} 
                                  alt={getUserFullName()} 
                                  className="w-full h-full rounded-full object-cover"
                                  onError={() => setAvatarUrl(null)}
                                />
                              ) : (
                                <span className="text-white text-sm font-semibold">
                                  {getUserInitial()}
                                </span>
                              )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800">
                              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">
                              {getUserFullName()}
                            </p>
                            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                          </div>
                        </div>
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-blue-600 rounded-full text-white">
                          {getUserRoleLabel()}
                        </span>
                      </div>
                      
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        {t('Mon profil', 'Ny momba ahy')}
                        <ChevronRight className="w-3 h-3 ml-auto text-gray-500" />
                      </button>
                      
                      {/* ✅ SUPPRESSION DES LIENS "Mes candidatures" et "Offres sauvegardées" */}
                      {/* ✅ Les liens ont été supprimés ci-dessous */}
                      
                      {/* LIEN DASHBOARD */}
                      {hasDashboardAccess() && (
                        <Link
                          href="/dashboard"
                          onClick={handleDashboardClick}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {t('Administration', 'Fitantanana')}
                          <ChevronRight className="w-3 h-3 ml-auto text-gray-500" />
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-700 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('Déconnexion', 'Fivoahana')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                >
                  {t('Connexion', 'Hiditra')}
                </Link>
              )}

              {/* BOUTON MENU MOBILE */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                aria-label={t('Menu', 'Menio')}
              >
                {isMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* MENU MOBILE */}
          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="lg:hidden py-3 border-t border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActiveLink(link.href)
                      ? 'text-blue-400 bg-gray-700'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {getNavName(link)}
                </Link>
              ))}
              
              {isAuthenticated && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={getUserFullName()} 
                            className="w-full h-full rounded-full object-cover"
                            onError={() => setAvatarUrl(null)}
                          />
                        ) : (
                          <span className="text-white text-[10px] font-semibold">
                            {getUserInitial()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></div>
                    </div>
                    {t('Mon profil', 'Ny momba ahy')}
                  </button>
                  
                  {/* ✅ SUPPRESSION DES LIENS "Mes candidatures" et "Offres sauvegardées" DANS LE MENU MOBILE */}
                  {/* ✅ Les liens ont été supprimés ci-dessous */}
                  
                  {/* LIEN DASHBOARD MOBILE */}
                  {hasDashboardAccess() && (
                    <Link
                      href="/dashboard"
                      onClick={handleDashboardClick}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t('Administration', 'Fitantanana')}
                    </Link>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('fr')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                      language === 'fr' ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => handleLanguageChange('mg')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                      language === 'mg' ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    MG
                  </button>
                </div>
                
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogout} 
                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-red-900/20 transition-colors"
                  >
                    {t('Déconnexion', 'Fivoahana')}
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-900/20 transition-colors"
                  >
                    {t('Connexion', 'Hiditra')}
                  </Link>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-[10px] text-gray-500 text-center">
                  Y-MaD - Young for Madagascar Development
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="h-14 sm:h-16"></div>
    </>
  );
}