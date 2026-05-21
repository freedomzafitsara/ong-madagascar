'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  Loader2, ChevronDown, User, LogOut, Menu, 
  Settings as SettingsIcon, Clock, UserCircle 
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    if (!loading && user && user.role === 'visitor') {
      router.push('/');
    }
  }, [loading, isAuthenticated, router, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileOpen && !target.closest('.profile-menu')) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', String(newState));
      return newState;
    });
  }, []);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role === 'visitor') {
    return null;
  }

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() || 
                       user?.lastName?.charAt(0)?.toUpperCase() || 
                       user?.email?.charAt(0)?.toUpperCase() || 'U';
  
  const userDisplayName = user?.firstName && user?.lastName 
    ? user.firstName + ' ' + user.lastName 
    : user?.email?.split('@')[0] || 'Utilisateur';
  
  const userRoleDisplay = user?.role?.replace(/_/g, ' ') || 'Super Admin';
  const capitalizedRole = userRoleDisplay.charAt(0).toUpperCase() + userRoleDisplay.slice(1);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              title={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-base font-semibold text-gray-800">Y-Mad Madagascar</h1>
                <p className="text-xs text-gray-500">Jeunesse Malgache en Action</p>
              </div>
              <span className="lg:hidden font-semibold text-gray-800 text-sm">Y-Mad</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">{currentDateTime}</span>
            </div>
            
            <div className="sm:hidden">
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="relative profile-menu">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Menu profil"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-semibold">{userInitial}</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{userDisplayName}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold">{userInitial}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{userDisplayName}</p>
                        <p className="text-xs text-gray-500 capitalize">{capitalizedRole}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/dashboard/profile" 
                    onClick={() => setIsProfileOpen(false)} 
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-gray-500" />
                    Mon profil
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings" 
                    onClick={() => setIsProfileOpen(false)} 
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-gray-500" />
                    Parametres
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button 
                      onClick={() => { 
                        logout(); 
                        setIsProfileOpen(false); 
                      }} 
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Deconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        {children}
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}