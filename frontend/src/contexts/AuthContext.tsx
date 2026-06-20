// frontend/src/contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'visitor' | 'candidate' | 'admin' | 'super_admin';
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'visitor' | 'candidate';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCandidate: boolean;
  isVisitor: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // CHARGEMENT DE LA SESSION
  // ============================================================

  useEffect(() => {
    const loadSession = () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // ✅ S'assurer que l'utilisateur a toutes les propriétés requises
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Si les données sont invalides, nettoyer
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Erreur chargement session:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // ============================================================
  // VÉRIFICATIONS DES RÔLES
  // ============================================================

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isCandidate = user?.role === 'candidate';
  const isVisitor = !user || user?.role === 'visitor';
  const isAuthenticated = !!user && !!token;

  // ============================================================
  // CONNEXION
  // ============================================================

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de connexion');
      }

      const data = await response.json();

      // ✅ S'assurer que l'utilisateur a toutes les propriétés
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        phone: data.user.phone || '',
        role: data.user.role || 'visitor',
        avatar_url: data.user.avatar_url || '',
        is_active: data.user.is_active !== undefined ? data.user.is_active : true,
        last_login: data.user.last_login || new Date().toISOString(),
      };

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(data.access_token);
      setUser(userData);

      // Redirection selon le rôle
      if (userData.role === 'admin' || userData.role === 'super_admin') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }

    } catch (error) {
      throw error;
    }
  };

  // ============================================================
  // INSCRIPTION
  // ============================================================

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'inscription');
      }

      router.push('/login?registered=true');

    } catch (error) {
      throw error;
    }
  };

  // ============================================================
  // DÉCONNEXION
  // ============================================================

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // ============================================================
  // MISE À JOUR DU PROFIL
  // ============================================================

  const updateProfile = async (data: Partial<User>) => {
    if (!token) throw new Error('Non authentifié');

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de mise à jour');
      }

      const updatedUser = await response.json();
      
      // ✅ Mettre à jour l'utilisateur en conservant toutes les propriétés
      if (user) {
        const newUser: User = {
          ...user,
          first_name: updatedUser.first_name || user.first_name,
          last_name: updatedUser.last_name || user.last_name,
          phone: updatedUser.phone || user.phone,
          avatar_url: updatedUser.avatar_url || user.avatar_url,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

    } catch (error) {
      throw error;
    }
  };

  // ============================================================
  // CHANGEMENT DE MOT DE PASSE
  // ============================================================

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error('Non authentifié');

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de changement de mot de passe');
      }

    } catch (error) {
      throw error;
    }
  };

  // ============================================================
  // UPLOAD AVATAR
  // ============================================================

  const uploadAvatar = async (file: File) => {
    if (!token) throw new Error('Non authentifié');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${API_URL}/auth/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur d\'upload');
      }

      const data = await response.json();
      
      //  Mettre à jour l'avatar
      if (user) {
        const newUser: User = {
          ...user,
          avatar_url: data.avatar_url,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

    } catch (error) {
      throw error;
    }
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated,
      isAdmin,
      isCandidate,
      isVisitor,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      uploadAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};