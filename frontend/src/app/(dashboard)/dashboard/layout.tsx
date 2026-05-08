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
  FolderOpen, Gift, BarChart3, AlertTriangle
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language } = useLanguage();

  // 🔐 REDIRECTIONS DE SÉCURITÉ
  useEffect(() => {
    // Non authentifié → login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // VISITOR → accueil
    if (!isLoading && user && user.role === 'visitor') {
      router.push('/');
      return;
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Bloquer les visiteurs
  if (!user || user.role === 'visitor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès non autorisé</h1>
          <p className="text-gray-600">Vous n'avez pas les droits pour accéder à cette page.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const userRole = user?.role || 'member';
  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'Utilisateur';

  const menuItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'staff', 'member', 'volunteer', 'partner'] },
    { name: 'Mon profil', href: '/dashboard/profile', icon: UserCheck, roles: ['super_admin', 'admin', 'staff', 'member', 'volunteer', 'partner'] },
    { name: 'Membres', href: '/dashboard/members', icon: Users, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Projets', href: '/dashboard/projects', icon: FolderOpen, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Événements', href: '/dashboard/events', icon: Calendar, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Offres emploi', href: '/dashboard/jobs', icon: Briefcase, roles: ['super_admin', 'admin', 'staff', 'partner'] },
    { name: 'Candidatures', href: '/dashboard/applications', icon: FileText, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Dons', href: '/dashboard/donations', icon: Gift, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Blog', href: '/dashboard/blog', icon: Newspaper, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Partenaires', href: '/dashboard/partners', icon: Handshake, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Bénévoles', href: '/dashboard/volunteers', icon: Heart, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Rapports', href: '/dashboard/reports', icon: BarChart3, roles: ['super_admin', 'admin', 'staff'] },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: Shield, roles: ['super_admin'] },
  ];

  const visibleMenu = menuItems.filter(item => item.roles.includes(userRole));
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  if (visibleMenu.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès restreint</h1>
          <p className="text-gray-600">Votre rôle ne vous permet pas d'accéder à cette section.</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const displayName = (item: any) => language === 'fr' ? item.name : item.nameMg || item.name;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:shadow-lg`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Y-Mad</h1>
            <p className="text-xs text-gray-500 mt-0.5">Administration</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info utilisateur */}
        <div className="p-4 mx-3 my-2 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
              <p className="text-xs text-blue-600 capitalize">{userRole.replace('_', ' ')}</p>
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
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{displayName(item)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Déconnexion */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-800">Tableau de bord</h1>
              <p className="text-xs text-gray-500">Bienvenue, {userName}</p>
            </div>
            <div className="flex-1 lg:hidden" />
            <div className="text-right">
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}