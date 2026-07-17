// frontend/src/app/candidat/layout.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, LogOut, Home, Menu, X, Shield,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      toast.error('Les administrateurs doivent accéder à leur espace dédié.');
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role === 'admin' || user.role === 'super_admin') {
    return null;
  }

  const getText = (fr: string, mg: string): string => {
    const language = typeof window !== 'undefined' 
      ? localStorage.getItem('y-mad-language') || 'fr' 
      : 'fr';
    return language === 'fr' ? fr : mg;
  };

  const navItems = [
    { 
      href: '/candidat/profil-candidat',
      label: getText('Mon profil', 'Ny momba ahy'), 
      icon: User,
      active: pathname === '/candidat/profil-candidat'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

    
      {/* ============================================================
      CONTENU PRINCIPAL
      ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          
         

          {/* Contenu de la page */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}