// frontend/src/app/(dashboard)/dashboard/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Loader2, ChevronDown, User, LogOut, Menu, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar ouverte par défaut sur PC
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Mise à jour de la date et l'heure
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Gestion de l'authentification
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
    if (!loading && user && user.role === 'visitor') router.push('/');
  }, [loading, isAuthenticated, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role === 'visitor') return null;

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.email || 'Admin';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Header avec bouton burger visible sur TOUS les appareils */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* ✅ BOUTON MENU BURGER - VISIBLE SUR PC ET MOBILE */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Y</span>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-gray-800">Y-Mad Madagascar</h1>
                <p className="text-xs text-gray-500">Jeunesse Malgache en Action pour le Développement</p>
              </div>
              <span className="lg:hidden font-semibold text-gray-800">Y-Mad</span>
            </div>
          </div>

          {/* Date/Heure + Profil */}
          <div className="flex items-center gap-4">
            {/* ✅ Date et heure visible sur mobile ET desktop */}
            <div className="text-sm text-gray-600">{currentDateTime}</div>
            
            {/* Menu profil */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{userName}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
                  </div>
                  <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                    <User className="w-4 h-4" /> Mon profil
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">
                    <SettingsIcon className="w-4 h-4" /> Paramètres
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={() => { logout(); setIsProfileOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="p-5 lg:p-8">
        {children}
      </main>
    </div>
  );
}