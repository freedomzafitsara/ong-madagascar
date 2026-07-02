// frontend/src/components/layout/Layout.tsx

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // Vérifier si la route est une page admin
    const adminRoutes = ['/dashboard', '/admin', '/candidate'];
    const isAdmin = adminRoutes.some(route => pathname?.startsWith(route));
    setIsAdminRoute(isAdmin);
  }, [pathname]);

  // Pour les pages admin, ne pas afficher le header/footer public
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}