// frontend/src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from './(public)/home/page';

export default function AppHomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  //  Si l'utilisateur est admin, rediriger vers le dashboard
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return <HomePage />;
}