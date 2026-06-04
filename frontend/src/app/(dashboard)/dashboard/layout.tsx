// frontend/src/app/(dashboard)/dashboard/layout.tsx

'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Footer from '@/components/layout/Footer';  // ✅ Chemin correct
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  const mainMargin = isCollapsed ? 'ml-20' : 'ml-72';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 rounded-lg shadow-lg text-white hover:bg-gray-800 transition"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      
      <main className={`${mainMargin} transition-all duration-300 flex-1`}>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}