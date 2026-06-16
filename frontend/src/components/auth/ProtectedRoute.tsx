// frontend/src/components/auth/ProtectedRoute.tsx

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'visitor' | 'candidate' | 'admin' | 'super_admin';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isAdmin, isCandidate } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // ✅ Vérifier l'authentification
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // ✅ Vérifier le rôle requis
      if (requiredRole) {
        let hasRequiredRole = false;
        
        switch (requiredRole) {
          case 'admin':
          case 'super_admin':
            hasRequiredRole = isAdmin;
            break;
          case 'candidate':
            hasRequiredRole = isCandidate || isAdmin;
            break;
          case 'visitor':
            hasRequiredRole = true;
            break;
        }

        if (!hasRequiredRole) {
          router.push('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router, redirectTo, isAdmin, isCandidate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-800 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    let hasRequiredRole = false;
    
    switch (requiredRole) {
      case 'admin':
      case 'super_admin':
        hasRequiredRole = isAdmin;
        break;
      case 'candidate':
        hasRequiredRole = isCandidate || isAdmin;
        break;
      case 'visitor':
        hasRequiredRole = true;
        break;
    }

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}