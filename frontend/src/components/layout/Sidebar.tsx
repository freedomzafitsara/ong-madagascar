// frontend/src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  FileText, 
  Heart, 
  Settings,
  LogOut,
  Building2,
  HandHeart,
  Star,
  User,
  Award,
  FolderTree,
  Newspaper,
  Mail,
  Image as ImageIcon,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import Image from "next/image";

// Configuration des menus selon les rôles
const menuItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin", "super_admin"] },
  { href: "/dashboard/profile", label: "Mon profil", icon: User, roles: ["admin", "super_admin"] },
  { href: "/dashboard/jobs", label: "Offres d'emploi", icon: Briefcase, roles: ["admin", "super_admin"] },
  { href: "/dashboard/projects", label: "Projets", icon: FolderTree, roles: ["admin", "super_admin"] },
  { href: "/dashboard/blog", label: "Blog", icon: Newspaper, roles: ["admin", "super_admin"] },
  { href: "/dashboard/users", label: "Utilisateurs", icon: Users, roles: ["admin", "super_admin"] },
  { href: "/dashboard/contact", label: "Messages", icon: Mail, roles: ["admin", "super_admin"] },
  { href: "/dashboard/pages", label: "Pages", icon: FileText, roles: ["admin", "super_admin"] },
  { href: "/dashboard/backgrounds", label: "Fonds d'ecran", icon: ImageIcon, roles: ["admin", "super_admin"] },
  { href: "/dashboard/settings", label: "Parametres", icon: Settings, roles: ["admin", "super_admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Mettre à jour l'avatar quand l'utilisateur change
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

  // Filtrer les menus selon le rôle de l'utilisateur
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || "visitor")
  );

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const getUserInitial = (): string => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  const getUserFullName = (): string => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Utilisateur';
  };

  const getRoleLabel = (): string => {
    if (user?.role === 'super_admin') return 'Super Administrateur';
    if (user?.role === 'admin') return 'Administrateur';
    return 'Utilisateur';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Header - Logo et informations utilisateur */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">Y</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-600 leading-tight">Y-MaD</h2>
            <p className="text-[10px] text-gray-400 leading-tight">Administration</p>
          </div>
        </div>
        
        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={getUserFullName()} 
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <span className="text-blue-600 font-semibold text-sm">
                  {getUserInitial()}
                </span>
              )}
            </div>
            {/* Point vert de connexion */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {getUserFullName()}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 truncate">{user?.email}</span>
            </div>
            <span className="inline-block mt-0.5 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {getRoleLabel()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-6 py-2.5 text-sm transition ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer avec déconnexion */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          Deconnexion
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Y-MaD v2.0
        </p>
      </div>
    </aside>
  );
}