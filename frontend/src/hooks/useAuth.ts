// src/hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 * 
 * @throws {Error} Si utilisé en dehors de AuthProvider
 * @returns {AuthContextType} Le contexte d'authentification
 * 
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * if (user) {
 *   console.log('Bonjour', user.firstName);
 * }
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

// Re-export du type pour faciliter l'import
export type { AuthContextType } from '@/contexts/AuthContext';