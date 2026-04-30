// src/components/dashboard/Header.tsx
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
  Heart,
  LayoutDashboard,
  FolderOpen,
  Users,
  DollarSign,
  HandHeart,
  Newspaper,
  BarChart3,
  Image,
  Mail,
  Activity,
  Menu
} from 'lucide-react';

// Interface pour l'utilisateur
interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff' | 'volunteer' | 'reader';
  isActive: boolean;
  avatar?: string | null;
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Récupérer l'utilisateur depuis localStorage
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
    const path = pathname.split('/').pop();
    const secondLevel = pathname.split('/')[2];
    
    const titles: Record<string, string> = {
      'dashboard': 'Tableau de bord',
      'projects': 'Gestion des projets',
      'beneficiaries': 'Gestion des bénéficiaires',
      'donations': 'Gestion des dons',
      'volunteers': 'Gestion des bénévoles',
      'recruitment': 'Gestion des recrutements',
      'blog': 'Gestion du blog',
      'reports': 'Rapports et statistiques',
      'media': 'Bibliothèque média',
      'logo': 'Gestion du logo',
      'banner': 'Gestion de la bannière',
      'projects-bg': 'Fond d\'écran projets',
      'contacts': 'Messages de contact',
      'users': 'Gestion des utilisateurs',
      'audit': 'Journal d\'audit',
      'profile': 'Mon profil',
      'settings': 'Paramètres',
      'security': 'Sécurité',
      'database': 'Base de données',
      'notifications': 'Notifications',
      'help': 'Aide'
    };
    
    if (secondLevel && titles[secondLevel]) {
      return titles[secondLevel];
    }
    
    return titles[path || 'dashboard'] || 'Tableau de bord';
  };

  const getPageIcon = () => {
    const path = pathname.split('/').pop();
    const icons: Record<string, React.ElementType> = {
      'dashboard': LayoutDashboard,
      'projects': FolderOpen,
      'beneficiaries': Users,
      'donations': DollarSign,
      'volunteers': HandHeart,
      'recruitment': Briefcase,
      'blog': Newspaper,
      'reports': BarChart3,
      'media': Image,
      'contacts': Mail,
      'users': Users,
      'audit': Activity,
      'profile': User,
      'settings': Settings,
    };
    const Icon = icons[path || 'dashboard'] || LayoutDashboard;
    return <Icon className="w-6 h-6 text-blue-400" />;
  };

  const getRoleBadge = () => {
    const role = user?.role;
    if (role === 'admin') {
      return (
        <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
          <Shield className="w-3 h-3" /> Administrateur
        </span>
      );
    }
    if (role === 'staff') {
      return (
        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          <Briefcase className="w-3 h-3" /> Staff
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
        <Heart className="w-3 h-3" /> Bénévole
      </span>
    );
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    // Supprimer tous les tokens
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const userInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const userFullName = () => {
    return `${user?.firstName || 'Utilisateur'} ${user?.lastName || ''}`.trim();
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
    <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Titre de la page - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              {getPageIcon()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-ymad-blue-800">{getPageTitle()}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500">
                  Bienvenue, {userFullName()}
                </p>
                {getRoleBadge()}
              </div>
            </div>
          </div>

          {/* Titre mobile simplifié */}
          <div className="md:hidden">
            <h1 className="text-lg font-bold text-ymad-blue-800">{getPageTitle()}</h1>
            <p className="text-xs text-gray-500">{userFullName()}</p>
          </div>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 focus:outline-none group"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full flex items-center justify-center text-gray-900 font-bold shadow-md group-hover:scale-105 transition">
                  {userInitials()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Infos utilisateur */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {userFullName()}
                </p>
                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                  {user?.role === 'admin' ? '👑 Administrateur' : 
                   user?.role === 'staff' ? '📋 Staff ONG' : '🤝 Bénévole'}
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-20 border border-gray-100 animate-fade-in">
                  {/* En-tête dropdown */}
                  <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-800">{userFullName()}</p>
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
                    Mon profil
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Paramètres
                  </Link>
                  
                  <hr className="my-1" />
                  
                  {/* Déconnexion */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                  
                  {/* Version */}
                  <div className="px-4 py-2 border-t mt-1 text-center">
                    <p className="text-xs text-gray-400">Y-Mad Admin v2.0</p>
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