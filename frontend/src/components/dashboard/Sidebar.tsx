// frontend/src/components/dashboard/Sidebar.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, Users, FolderOpen, Calendar, Briefcase, 
  FileText, Heart, HandHeart, BookOpen, Handshake, 
  Settings, LogOut, X, Palette, BarChart3, Shield,
  Gift
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const menuSections = [
    { title: 'PRINCIPAL', items: [{ href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard }] },
    { title: 'GESTION', items: [
      { href: '/dashboard/members', label: 'Membres', icon: Users },
      { href: '/dashboard/projects', label: 'Projets', icon: FolderOpen },
      { href: '/dashboard/events', label: 'Événements', icon: Calendar },
      { href: '/dashboard/jobs', label: 'Offres emploi', icon: Briefcase },
      { href: '/dashboard/applications', label: 'Candidatures', icon: FileText },
      { href: '/dashboard/donations', label: 'Dons', icon: Gift },
      { href: '/dashboard/volunteers', label: 'Bénévoles', icon: HandHeart },
    ]},
    { title: 'CONTENU', items: [
      { href: '/dashboard/blog', label: 'Blog', icon: BookOpen },
      { href: '/dashboard/partners', label: 'Partenaires', icon: Handshake },
    ]},
    { title: 'PERSONNALISATION', items: [{ href: '/dashboard/backgrounds', label: 'Fonds d\'écran', icon: Palette }] },
    { title: 'RAPPORTS', items: [{ href: '/dashboard/reports', label: 'Rapports', icon: BarChart3 }] },
    { title: 'ADMINISTRATION', items: [
      { href: '/dashboard/users', label: 'Utilisateurs', icon: Shield },
      { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
    ]},
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname?.startsWith(href);
  };

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'Super Admin';

  const userRole = user?.role?.replace('_', ' ') || 'super admin';

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* ✅ SIDEBAR AVEC FOND GRIS CLAIR */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-72 bg-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* En-tête avec bouton X pour fermer sur mobile */}
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Y-Mad</h1>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Profil utilisateur */}
        <div className="p-4 mx-3 my-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Navigation avec défilement */}
        <div className="flex-1 overflow-y-auto px-3 py-2 pb-32">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</p>
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Pied de page avec déconnexion */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">Version 1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">© 2025 Y-Mad</p>
          </div>
        </div>
      </aside>
    </>
  );
}