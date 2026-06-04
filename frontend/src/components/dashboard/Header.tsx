'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Shield, 
  Briefcase,
  LayoutDashboard,
  FolderOpen,
  Newspaper,
  BarChart3,
  Image,
  Mail,
  UserCircle,
  FileText
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  avatar_url?: string | null;
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Erreur parsing user:', error);
      }
    }
  }, []);

  const getPageTitle = () => {
    const secondLevel = pathname.split('/')[2];
    
    const titles: Record<string, { fr: string; mg: string }> = {
      'dashboard': { fr: 'Tableau de bord', mg: 'Takila fandraisana' },
      'jobs': { fr: 'Gestion des offres', mg: 'Fitantanana asa' },
      'applications': { fr: 'Candidatures', mg: 'Fangatahana' },
      'projects': { fr: 'Gestion des projets', mg: 'Fitantanana tetikasa' },
      'blog': { fr: 'Gestion du blog', mg: 'Fitantanana bitsika' },
      'contacts': { fr: 'Messages de contact', mg: 'Hafatra' },
      'profile': { fr: 'Mon profil', mg: 'Ny momba ahy' },
      'settings': { fr: 'Paramètres', mg: 'Fandrindrana' },
      'security': { fr: 'Sécurité', mg: 'Fiarovana' },
      'backgrounds': { fr: 'Fonds d\'écran', mg: 'Sary ambadika' },
      'pages': { fr: 'Gestion des pages', mg: 'Fitantanana pejy' },
    };
    
    const title = titles[secondLevel] || titles['dashboard'];
    return getText(title.fr, title.mg);
  };

  const getPageIcon = () => {
    const secondLevel = pathname.split('/')[2];
    const icons: Record<string, React.ElementType> = {
      'dashboard': LayoutDashboard,
      'jobs': Briefcase,
      'applications': FileText,
      'projects': FolderOpen,
      'blog': Newspaper,
      'contacts': Mail,
      'profile': UserCircle,
      'settings': Settings,
      'security': Shield,
      'backgrounds': Image,
      'pages': Image,
    };
    const Icon = icons[secondLevel] || LayoutDashboard;
    return <Icon className="w-6 h-6 text-blue-600" />;
  };

  const getRoleBadge = () => {
    const role = user?.role;
    if (role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
          <Shield className="w-3 h-3" />
          {getText('Super Administrateur', 'Super Admin')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
        <Shield className="w-3 h-3" />
        {getText('Administrateur', 'Admin')}
      </span>
    );
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const getUserInitials = (): string => {
    const first = user?.first_name?.charAt(0) || '';
    const last = user?.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'A';
  };

  const getUserFullName = (): string => {
    return `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Administrateur';
  };

  // Éviter l'hydratation mismatch
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Titre de la page - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getPageIcon()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500">
                  {getText('Bienvenue', 'Tonga soa')}, {getUserFullName()}
                </p>
                {getRoleBadge()}
              </div>
            </div>
          </div>

          {/* Titre mobile simplifié */}
          <div className="md:hidden">
            <h1 className="text-lg font-bold text-gray-800">{getPageTitle()}</h1>
            <p className="text-xs text-gray-500">{getUserFullName()}</p>
          </div>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 focus:outline-none group"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Infos utilisateur */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {getUserFullName()}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {user?.role === 'super_admin' ? 
                    (getText('Super Administrateur', 'Super Admin')) : 
                    (getText('Administrateur', 'Admin'))}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </p>
              </div>
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-20 border border-gray-100">
                  {/* En-tête dropdown */}
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-800">{getUserFullName()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    <div className="mt-2">{getRoleBadge()}</div>
                  </div>
                  
                  {/* Liens */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    {getText('Mon profil', 'Ny momba ahy')}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    {getText('Paramètres', 'Fandrindrana')}
                  </Link>
                  
                  <hr className="my-1" />
                  
                  {/* Déconnexion */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    {getText('Déconnexion', 'Fivoahana')}
                  </button>
                  
                  {/* Version */}
                  <div className="px-4 py-2 border-t mt-1 text-center">
                    <p className="text-xs text-gray-400">Y-MaD Admin v1.0</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;