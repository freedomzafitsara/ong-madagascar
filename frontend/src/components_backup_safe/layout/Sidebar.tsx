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
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Configuration des menus selon les rôles
const menuItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin", "super_admin", "staff"] },
  { href: "/dashboard/emploi", label: "Offres d'emploi", icon: Briefcase, roles: ["admin", "super_admin", "staff"] },
  { href: "/dashboard/members", label: "Membres", icon: Users, roles: ["admin", "super_admin", "staff"] },
  { href: "/dashboard/events", label: "Événements", icon: Calendar, roles: ["admin", "super_admin", "staff"] },
  { href: "/dashboard/blog", label: "Blog", icon: FileText, roles: ["admin", "super_admin", "staff"] },
  { href: "/dashboard/donations", label: "Dons", icon: Heart, roles: ["admin", "super_admin"] },
  { href: "/dashboard/partners", label: "Partenaires", icon: Building2, roles: ["admin", "super_admin"] },
  { href: "/dashboard/volunteers", label: "Bénévoles", icon: HandHeart, roles: ["admin", "super_admin", "staff"] },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings, roles: ["admin", "super_admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Filtrer les menus selon le rôle de l'utilisateur
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || "visitor")
  );

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-600">Y-Mad Admin</h2>
        <p className="text-sm text-gray-500 mt-1">
          {user?.firstName} {user?.lastName}
        </p>
        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Administrateur" : user?.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-6 py-3 transition ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : "text-gray-700 hover:bg-gray-50"
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
          className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}