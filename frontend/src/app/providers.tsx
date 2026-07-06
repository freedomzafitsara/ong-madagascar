// frontend/src/app/providers.tsx

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* ✅ ORDRE CORRECT : AuthProvider d'abord */}
      <AuthProvider>
        {/* ✅ ThemeProvider utilise useAuth(), donc à l'intérieur d'AuthProvider */}
        <ThemeProvider>
          {/* ✅ LanguageProvider indépendant */}
          <LanguageProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { 
                  background: '#1e3a8a', 
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: { 
                  duration: 3000,
                  iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
                },
                error: { 
                  duration: 4000,
                  iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
                },
                loading: {
                  style: { background: '#6b7280', color: '#ffffff' },
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}