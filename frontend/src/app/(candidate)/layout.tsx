// frontend/src/app/(candidate)/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Briefcase, Heart, FileText, Settings, 
  LogOut, Home, Bell, Menu, X, Shield,
  ChevronRight, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      toast.error('Les administrateurs doivent accéder à leur espace dédié.');
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role === 'admin' || user.role === 'super_admin') {
    return null;
  }

  const getText = (fr: string, mg: string): string => {
    const language = typeof window !== 'undefined' 
      ? localStorage.getItem('y-mad-language') || 'fr' 
      : 'fr';
    return language === 'fr' ? fr : mg;
  };

  const navItems = [
    { 
      href: '/candidate/profile', 
      label: getText('Mon profil', 'Ny momba ahy'), 
      icon: User,
      active: pathname === '/candidate/profile'
    },
    { 
      href: '/candidate/applications', 
      label: getText('Mes candidatures', 'Ny fangatahako'), 
      icon: FileText,
      active: pathname === '/candidate/applications'
    },
    { 
      href: '/candidate/saved-jobs', 
      label: getText('Offres sauvegardées', 'Asa voatahiry'), 
      icon: Heart,
      active: pathname === '/candidate/saved-jobs'
    },
    { 
      href: '/candidate/settings', 
      label: getText('Paramètres', 'Fametrahana'), 
      icon: Settings,
      active: pathname === '/candidate/settings'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ============================================================
      HEADER
      ============================================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-blue-800">
                Y-MaD
              </Link>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                {getText('Candidat', 'Mpangataka')}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative rounded-full hover:bg-gray-100 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Profil utilisateur */}
              <Link 
                href="/candidate/profile"
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.first_name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </Link>

              {/* Déconnexion */}
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                title={getText('Déconnexion', 'Hivoaka')}
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Menu mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
      NAVIGATION MOBILE
      ============================================================ */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${item.active ? 'text-blue-400' : 'text-gray-300'}`} />
                </Link>
              );
            })}
            
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
            >
              <Home className="w-5 h-5 text-gray-400" />
              <span>{getText('Retour à l\'accueil', 'Hiverina any an-tokotany')}</span>
            </Link>
          </nav>
        </div>
      )}

      {/* ============================================================
      CONTENU PRINCIPAL
      ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          
          {/* Sidebar */}
          <aside className="hidden sm:block w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                        item.active
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <Home className="w-4 h-4" />
                  <span>{getText('Accueil', 'Trano')}</span>
                </Link>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-700">
                    {getText('Espace sécurisé', 'Toerana azo antoka')}
                  </p>
                </div>
              </div>
            </nav>
          </aside>

          {/* Contenu */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}