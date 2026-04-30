// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, RegisterData, UpdateProfileData } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rafraîchir les données utilisateur
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getProfile();
      setUser(currentUser);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  }, []);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        
        // Vérifier si le token est encore valide
        if (currentUser && authService.getToken()) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Erreur chargement utilisateur:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { user: loggedUser } = await authService.login(email, password);
    setUser(loggedUser);
  };

  const register = async (data: RegisterData) => {
    const { user: registeredUser } = await authService.register(data);
    setUser(registeredUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  
  // Vérifier si l'utilisateur est partenaire
  const isPartner = user?.role === 'partner';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        isPartner,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé avec vérification
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook pour les composants qui nécessitent l'authentification
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);
  
  return auth;
}

// Hook pour les composants admin
export function useRequireAdmin() {
  const auth = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAdmin) {
      router.push('/dashboard');
    }
  }, [auth.isLoading, auth.isAdmin, router]);
  
  return auth;
}