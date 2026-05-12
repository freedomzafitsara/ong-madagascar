// frontend/src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger la session au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      console.log('Réponse API:', data);

      // Extraire le token et l'utilisateur (adaptez selon votre API)
      let authToken: string | null = null;
      let userData: User | null = null;

      // Cas 1: token dans data.token
      if (data.token) {
        authToken = data.token;
        userData = data.user;
      }
      // Cas 2: token dans data.access_token
      else if (data.access_token) {
        authToken = data.access_token;
        userData = data.user;
      }
      // Cas 3: success avec token dans data
      else if (data.success && data.user) {
        // Votre API retourne token? Regardons la réponse complète
        console.log('Structure de la réponse:', data);
        
        // Si votre API retourne le token dans une autre propriété
        // Ajoutez ici la logique adaptée
      }

      if (!authToken && data.user) {
        // Si votre API ne retourne pas de token, vous devez en générer un
        console.warn('Token non trouvé dans la réponse');
        authToken = 'temp_token_' + Date.now();
        userData = data.user;
      }

      if (!authToken || !userData) {
        console.error('Structure de la réponse:', data);
        throw new Error('Token ou utilisateur manquant dans la réponse');
      }

      // Stocker dans localStorage
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Mettre à jour l'état
      setToken(authToken);
      setUser(userData);
      
      console.log('✅ Connexion réussie, token stocké');
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // Vérifier les rôles
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'inscription');
      }

      router.push('/login');
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      register,
      hasRole,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};