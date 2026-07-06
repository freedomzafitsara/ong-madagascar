// frontend/src/app/(dashboard)/dashboard/layout.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// CONSTANTES
// ============================================================

const ADMIN_ROLES = ['admin', 'super_admin'] as const;
const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // État local
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // ============================================================
  // CHARGEMENT DE L'ÉTAT DU SIDEBAR
  // ============================================================

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (savedState !== null) {
        setIsCollapsed(savedState === 'true');
      }
    } catch (error) {
      console.error('[DashboardLayout] Erreur de chargement du sidebar:', error);
    }
  }, []);

  // ============================================================
  // ✅ VÉRIFICATION DE L'AUTHENTIFICATION - CORRIGÉE
  // ============================================================

  useEffect(() => {
    // Ne pas exécuter la vérification si le chargement est en cours
    if (isLoading) return;

    console.log('[DashboardLayout] Vérification d\'authentification...');
    console.log('[DashboardLayout] État:', { 
      isAuthenticated, 
      user: user?.email, 
      role: user?.role,
      isLoading 
    });
    
    // ✅ Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated || !user) {
      console.log('[DashboardLayout] Non authentifié - Redirection vers login');
      toast.error('Veuillez vous connecter pour accéder à cette page.');
      router.replace('/login'); // ✅ Utiliser replace pour éviter de revenir en arrière
      return;
    }

    // ✅ Vérifier si l'utilisateur est admin
    const isAdmin = ADMIN_ROLES.includes(user.role as any);
    
    if (!isAdmin) {
      console.log('[DashboardLayout] Accès refusé - Rôle:', user.role);
      toast.error('Accès réservé aux administrateurs.');
      router.replace('/'); // ✅ Utiliser replace pour éviter de revenir en arrière
      return;
    }

    console.log('[DashboardLayout] Admin authentifié:', user.email);
    setIsVerifying(false);
    
  }, [isLoading, isAuthenticated, user, router]);

  // ============================================================
  // RENDU - ÉTAT DE CHARGEMENT
  // ============================================================

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {isLoading ? 'Chargement de la session...' : 'Vérification des autorisations...'}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU - UTILISATEUR NON AUTHENTIFIÉ
  // ============================================================

  if (!user) {
    return null;
  }

  // ============================================================
  // RENDU PRINCIPAL
  // ============================================================

  const mainMargin = isCollapsed ? 'ml-20' : 'ml-72';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* Bouton d'ouverture du menu mobile */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 rounded-lg shadow-lg text-white hover:bg-gray-800 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      
      {/* Contenu principal */}
      <main 
        className={`${mainMargin} transition-all duration-300 flex-1`}
        style={{ paddingTop: '1rem' }}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
      
    </div>
  );
}