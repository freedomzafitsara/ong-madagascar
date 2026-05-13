// frontend/src/hooks/useAuth.ts

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextType } from '@/contexts/AuthContext';

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
 * 
 * if (isAuthenticated) {
 *   // Afficher le contenu protégé
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth doit être utilisé à l\'intérieur d\'un AuthProvider. ' +
      'Assurez-vous que votre composant est enveloppé par <AuthProvider>.'
    );
  }
  
  return context;
};

// Re-export du type pour faciliter l'import
export type { AuthContextType } from '@/contexts/AuthContext';