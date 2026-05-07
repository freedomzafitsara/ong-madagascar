'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LayoutDashboard, Users, Briefcase, Calendar, DollarSign, 
  FileText, Heart, Handshake, LogOut, Menu, X, 
  UserCheck, Newspaper, TrendingUp, Shield, Loader2,
  FolderOpen, Gift, BarChart3, Globe, ChevronRight, Home
} from 'lucide-react';

interface MenuItem {
  nameKey: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  roles: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'mg' : 'fr');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const userRole = user?.role || 'member';
  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'Utilisateur';

  // Menu items avec clés de traduction
  const menuItems: MenuItem[] = [
    { nameKey: 'dashboard.title', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'staff', 'member', 'volunteer', 'partner'] },
    { nameKey: 'nav.profile', href: '/dashboard/profile', icon: UserCheck, roles: ['super_admin', 'admin', 'staff', 'member', 'volunteer', 'partner'] },
    { nameKey: 'nav.members', href: '/dashboard/members', icon: Users, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'projects.title', href: '/dashboard/projects', icon: FolderOpen, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'events.title', href: '/dashboard/events', icon: Calendar, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'jobs.title', href: '/dashboard/jobs', icon: Briefcase, roles: ['super_admin', 'admin', 'staff', 'partner'] },
    { nameKey: 'jobs.applications', href: '/dashboard/applications', icon: FileText, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'nav.donate', href: '/dashboard/donations', icon: Gift, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'blog.title', href: '/dashboard/blog', icon: Newspaper, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'partners.title', href: '/dashboard/partners', icon: Handshake, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'volunteers.title', href: '/dashboard/volunteers', icon: Heart, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'nav.reports', href: '/dashboard/reports', icon: BarChart3, roles: ['super_admin', 'admin', 'staff'] },
    { nameKey: 'nav.users', href: '/dashboard/users', icon: Shield, roles: ['super_admin'] },
  ];

  const visibleMenu = menuItems.filter(item => item.roles.includes(userRole));
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Version hamburger */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:shadow-lg`}>
        <div className="flex flex-col h-full">
          {/* Logo et bouton fermeture */}
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Y-Mad</h1>
                <p className="text-xs text-gray-500">{t('nav.dashboard')}</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Info utilisateur */}
          <div className="p-4 mx-3 my-2 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <p className="text-xs text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {visibleMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{t(item.nameKey)}</span>
                      {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Section basse avec langue et déconnexion */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Bouton langue */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-between w-full px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{language === 'fr' ? 'Français' : 'Malagasy'}</span>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {language === 'fr' ? 'MG' : 'FR'}
              </span>
            </button>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-72">
        {/* Header avec menu hamburger */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            {/* Menu hamburger button - visible sur mobile et tablette */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Titre pour desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">{t('dashboard.title')}</h1>
                <p className="text-xs text-gray-500">{t('dashboard.welcome')}, {userName.split(' ')[0]}</p>
              </div>
            </div>

            {/* Espaceur pour mobile */}
            <div className="flex-1 lg:hidden" />

            {/* Indicateur de langue actuelle */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{language === 'fr' ? 'FR' : 'MG'}</span>
              </button>
            </div>

            {/* Version simplifiée pour mobile */}
            <button
              onClick={toggleLanguage}
              className="sm:hidden flex items-center gap-1 px-2 py-1.5 bg-gray-100 rounded-lg"
            >
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium">{language === 'fr' ? 'FR' : 'MG'}</span>
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="hidden lg:flex px-6 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 items-center gap-2">
            <span className="text-blue-600">Y-Mad</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span>{t('dashboard.title')}</span>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <Footer t={t} language={language} />
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT FOOTER
// ============================================

function Footer({ t, language }: { t: (key: string) => string; language: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="px-4 py-6 lg:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">Y</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">Y-Mad</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              © {currentYear} Y-Mad - {t('footer.rights')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'fr' ? 'Créé avec  pour la jeunesse malgache' : 'Natao tamin\'ny  ho an\'ny tanora malagasy'}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <button className="text-xs text-gray-500 hover:text-blue-600 transition">
              {t('footer.terms')}
            </button>
            <button className="text-xs text-gray-500 hover:text-blue-600 transition">
              {t('footer.privacy')}
            </button>
            <button className="text-xs text-gray-500 hover:text-blue-600 transition">
              {t('nav.contact')}
            </button>
            <button className="text-xs text-gray-500 hover:text-blue-600 transition">
              FAQ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}