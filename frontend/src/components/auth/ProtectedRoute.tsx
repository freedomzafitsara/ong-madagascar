// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    if (!loading && isAuthenticated && allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user?.role || '')) {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, router, allowedRoles, user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ymad-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ymad-blue-200 border-t-ymad-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role || '')) return null;
  }

  return <>{children}</>;
};