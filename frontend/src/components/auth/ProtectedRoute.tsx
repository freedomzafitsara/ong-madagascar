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
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && allowedRoles && !allowedRoles.includes(user?.role || '')) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router, allowedRoles, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="w-12 h-12 border-4 border-marine-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Chargement...</p></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && !allowedRoles.includes(user?.role || '')) return null;

  return <>{children}</>;
};
