'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isAdmin, isStaff } = usePermissions();

  const menuItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: '📊', roles: ['admin', 'staff', 'volunteer'] },
    { name: 'Projets', href: '/dashboard/projects', icon: '📁', roles: ['admin', 'staff'] },
    { name: 'Bénéficiaires', href: '/dashboard/beneficiaries', icon: '👥', roles: ['admin', 'staff'] },
    { name: 'Dons', href: '/dashboard/donations', icon: '💰', roles: ['admin', 'staff'] },
    { name: 'Bénévoles', href: '/dashboard/volunteers', icon: '🤝', roles: ['admin', 'staff'] },
    { name: 'Blog', href: '/dashboard/blog', icon: '✍️', roles: ['admin', 'staff'] },
    { name: 'Rapports', href: '/dashboard/reports', icon: '📄', roles: ['admin', 'staff'] },
    { name: 'Médias', href: '/dashboard/media', icon: '🖼️', roles: ['admin', 'staff'] },
    { name: 'Messages', href: '/dashboard/contacts', icon: '💬', roles: ['admin', 'staff'] },
    { name: 'Utilisateurs', href: '/dashboard/users', icon: '👤', roles: ['admin'] },
    { name: "Journal d'audit", href: '/dashboard/audit', icon: '📜', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (item.roles.includes('admin') && isAdmin) return true;
    if (item.roles.includes('staff') && isStaff) return true;
    if (item.roles.includes('volunteer')) return true;
    return false;
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary-600">ONG Madagascar</h1>
        <p className="text-sm text-gray-500 mt-1">Espace de gestion</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {filteredMenu.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-red-600 hover:text-red-700 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;