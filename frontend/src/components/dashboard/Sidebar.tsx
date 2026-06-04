// frontend/src/components/dashboard/Sidebar.tsx

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, Briefcase, FileText, FolderOpen, 
  BookOpen, Mail, Palette, Settings, LogOut, X, ChevronLeft,
  Users, Home
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const getText = (fr: string, mg: string) => {
    const language = localStorage.getItem('y-mad-language') || 'fr';
    return language === 'fr' ? fr : mg;
  };

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const menuSections = [
    { 
      title: getText('PRINCIPAL', 'LEHIBEVAVY'),
      items: [
        { href: '/dashboard', label: getText('Tableau de bord', 'Takila fandraisana'), icon: LayoutDashboard }
      ] 
    },
    { 
      title: getText('GESTION', 'FITANTANANA'),
      items: [
        { href: '/dashboard/jobs', label: getText('Offres d\'emploi', 'Toerana asa'), icon: Briefcase },
        { href: '/dashboard/applications', label: getText('Candidatures', 'Fangatahana'), icon: FileText },
        { href: '/dashboard/projects', label: getText('Projets', 'Tetikasa'), icon: FolderOpen },
        { href: '/dashboard/blog', label: getText('Blog', 'Bitsika'), icon: BookOpen },
        { href: '/dashboard/contacts', label: getText('Messages', 'Hafatra'), icon: Mail },
      ] 
    },
    { 
      title: getText('PERSONNALISATION', 'FANAMBOARANA'),
      items: [
        { href: '/dashboard/backgrounds', label: getText('Fonds d\'écran', 'Sary ambadika'), icon: Palette },
        { href: '/dashboard/pages', label: getText('Pages', 'Pejy'), icon: Home },
      ] 
    },
    { 
      title: getText('ADMINISTRATION', 'FITANTANANA'),
      items: [
        { href: '/dashboard/users', label: getText('Utilisateurs', 'Mpampiasa'), icon: Users },
        { href: '/dashboard/settings', label: getText('Paramètres', 'Fandrindrana'), icon: Settings },
      ] 
    },
  ];

  const hasAdminAccess = user?.role === 'super_admin' || user?.role === 'admin';

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.href === '/dashboard/users' && !hasAdminAccess) return false;
      if (item.href === '/dashboard/settings' && !hasAdminAccess) return false;
      return true;
    })
  })).filter(section => section.items.length > 0);

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === href;
    return pathname?.startsWith(href) || false;
  };

  const getUserName = (): string => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email?.split('@')[0] || getText('Administrateur', 'Mpandrindra');
  };

  const getUserInitial = (): string => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  const getUserRoleLabel = (): string => {
    if (user?.role === 'super_admin') return getText('Super Administrateur', 'Super Admin');
    return getText('Administrateur', 'Admin');
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-full ${sidebarWidth} bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* En-tête */}
        <div className={`p-4 border-b border-gray-800 bg-gray-900 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              {!isCollapsed && (
                <>
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Y</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Y-MaD</h1>
                    <p className="text-xs text-gray-400">{getText('Administration', 'Fitantanana')}</p>
                  </div>
                </>
              )}
              {isCollapsed && (
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-lg">Y</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Bouton de collapse */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-gray-800 rounded-full items-center justify-center border border-gray-700 hover:bg-gray-700 transition z-50"
        >
          <ChevronLeft className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Profil */}
        <div className={`p-4 mx-3 my-4 bg-gray-800 rounded-xl ${isCollapsed ? 'mx-2 px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{getUserInitial()}</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{getUserName()}</p>
                <p className="text-xs text-gray-400">{getUserRoleLabel()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </p>
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isCollapsed ? 'justify-center' : ''
                        } ${
                          active 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-800 bg-gray-900 ${isCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? getText('Déconnexion', 'Fivoahana') : ''}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">{getText('Déconnexion', 'Fivoahana')}</span>}
          </button>
          {!isCollapsed && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">Y-MaD Admin v1.0</p>
              <p className="text-xs text-gray-600 mt-1">© {new Date().getFullYear()} Y-MaD</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}