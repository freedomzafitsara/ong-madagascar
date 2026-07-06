// frontend/src/app/(candidate)/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, Briefcase, Heart, FileText, Settings, 
  LogOut, Home, Bell, Menu, X, Shield,
  ChevronRight, UserCircle, ArrowLeft
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
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ============================================================
  // TRADUCTION
  // ============================================================

  const getText = (fr: string, mg: string): string => {
    return language === 'fr' ? fr : mg;
  };

  // ============================================================
  // REDIRECTIONS ET VERIFICATIONS - CORRIGE
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // ✅ CORRECTION: Vérifier les rôles autorisés pour l'espace candidat
    // Les rôles autorisés sont: 'candidate'
    // Les rôles non autorisés: 'admin', 'super_admin', 'visitor'
    
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      toast.error(getText(
        'Acces reserve aux candidats.',
        'Fidirana ho an\'ny mpangataka ihany.'
      ));
      router.push('/dashboard');
      return;
    }

    if (user?.role === 'visitor') {
      toast.error(getText(
        'Vous devez etre candidat pour acceder a cet espace.',
        'Tsy maintsy mpangataka ianao vao afaka miditra amin\'ity toerana ity.'
      ));
      router.push('/');
      return;
    }

    // ✅ Si l'utilisateur n'est pas candidat (role inconnu), rediriger vers l'accueil
    if (user?.role !== 'candidate') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router, getText]);

  // ============================================================
  // AVATAR UTILISATEUR
  // ============================================================

  useEffect(() => {
    if (user?.avatar_url) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
      const avatarUrl = user.avatar_url.startsWith('http') 
        ? user.avatar_url 
        : `${baseUrl}${user.avatar_url}`;
      setAvatarUrl(avatarUrl);
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  // ============================================================
  // GESTION DE LA DECONNEXION
  // ============================================================

  const handleLogout = () => {
    logout();
    toast.success(getText('Deconnexion reussie', 'Vita ny fivoahana'));
    router.push('/');
  };

  // ============================================================
  // MENU DE NAVIGATION
  // ============================================================

  const navItems = [
    { 
      href: '/candidate/profil-candidat', 
      label: getText('Mon profil', 'Ny momba ahy'), 
      icon: User,
      active: pathname === '/candidate/profil-candidat'
    },
    { 
      href: '/candidate/applications', 
      label: getText('Mes candidatures', 'Ny fangatahako'), 
      icon: FileText,
      active: pathname === '/candidate/applications'
    },
    { 
      href: '/candidate/saved-jobs', 
      label: getText('Offres sauvegardees', 'Asa voatahiry'), 
      icon: Heart,
      active: pathname === '/candidate/saved-jobs'
    },
    { 
      href: '/candidate/settings', 
      label: getText('Parametres', 'Fametrahana'), 
      icon: Settings,
      active: pathname === '/candidate/settings'
    },
  ];

  // ============================================================
  // RENDU SI NON AUTHENTIFIE OU NON CANDIDAT
  // ============================================================

  // ✅ CORRECTION: Ne rendre le layout que si l'utilisateur est un candidat
  if (!user || user.role !== 'candidate') {
    return null;
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ============================================================
      HEADER CANDIDAT
      ============================================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo + Retour */}
            <div className="flex items-center gap-4">
              <Link 
                href="/candidate/profil-candidat" 
                className="flex items-center gap-2"
              >
                <span className="text-xl font-bold text-blue-800">Y-MaD</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  {getText('Candidat', 'Mpangataka')}
                </span>
              </Link>
              
              <Link 
                href="/"
                className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition"
              >
                <ArrowLeft className="w-3 h-3" />
                {getText('Retour', 'Hiverina')}
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Notifications */}
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 relative rounded-full hover:bg-gray-100 transition"
                aria-label={getText('Notifications', 'Fampandrenesana')}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Profil utilisateur */}
              <Link 
                href="/candidate/profil-candidat"
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={user.first_name} 
                      className="w-full h-full rounded-full object-cover"
                      onError={() => setAvatarUrl(null)}
                    />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                </div>
              </Link>

              {/* Deconnexion */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                title={getText('Deconnexion', 'Hivoaka')}
                aria-label={getText('Deconnexion', 'Hivoaka')}
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Menu mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                aria-label={getText('Menu', 'Menio')}
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
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
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
              <span>{getText('Retour a l\'accueil', 'Hiverina any an-tokotany')}</span>
            </Link>
          </nav>
        </div>
      )}

      {/* ============================================================
      CONTENU PRINCIPAL
      ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
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
                    {getText('Espace securise', 'Toerana azo antoka')}
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 text-center">
                  Y-MaD - Young for Madagascar Development
                </p>
              </div>
            </nav>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}