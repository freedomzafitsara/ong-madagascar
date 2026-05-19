'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// 1. ENUM DES RÔLES
// ============================================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  MEMBER = 'member',
  VOLUNTEER = 'volunteer',
  PARTNER = 'partner',
  VISITOR = 'visitor',
}

// ============================================================
// 2. INTERFACES ET TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  avatar_url?: string;
  phone?: string;
  region?: string;
  bio?: string;
  position?: string;
  department?: string;
  skills?: string;
  socialLinkedin?: string;
  socialTwitter?: string;
  socialGithub?: string;
  createdAt?: string;
  lastLogin?: string;
  updatedAt?: string;
  email_verified?: boolean;
  language?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  isAuthenticated: boolean;
  updateUser: (data: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface LoginResponse {
  access_token?: string;
  token?: string;
  user: User;
  message?: string;
  statusCode?: number;
}

// ============================================================
// 3. CONTEXTE
// ============================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ============================================================
// 4. PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Charger la session au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Chargement session - Token present:', !!storedToken);
    console.log('Chargement session - User present:', !!storedUser);
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
        console.log('Session chargee avec succes');
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('Aucune session trouvee');
    }
    setLoading(false);
  }, []);

  // Mettre à jour l'utilisateur
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Utilisateur mis a jour');
    }
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Rafraîchir le token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) return false;
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token || data.token;
        if (newToken) {
          localStorage.setItem('access_token', newToken);
          localStorage.setItem('token', newToken);
          setToken(newToken);
          console.log('Token rafraichi avec succes');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraichissement du token:', error);
      return false;
    }
  };

  // Connexion
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Tentative de connexion pour:', email);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Email ou mot de passe incorrect';
        console.error('Echec de connexion:', errorMsg);
        throw new Error(errorMsg);
      }

      const authToken = data.access_token || data.token;
      
      if (!authToken || !data.user) {
        throw new Error('Impossible de recuperer les informations de connexion');
      }

      console.log('Connexion reussie, token obtenu');

      const enrichedUserData: User = {
        ...data.user,
        role: data.user.role as UserRole,
        createdAt: data.user.createdAt || new Date().toISOString(),
        lastLogin: data.user.lastLogin || new Date().toISOString(),
        phone: data.user.phone || '',
        region: data.user.region || 'Analamanga',
        bio: data.user.bio || '',
        position: data.user.position || 'Membre',
        department: data.user.department || 'Programmes',
        skills: data.user.skills || '',
        socialLinkedin: data.user.socialLinkedin || '',
        socialTwitter: data.user.socialTwitter || '',
        socialGithub: data.user.socialGithub || '',
      };

      localStorage.setItem('access_token', authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(enrichedUserData));
      
      setToken(authToken);
      setUser(enrichedUserData);
      
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Déconnexion
  const logout = (): void => {
    console.log('Deconnexion');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  // Inscription
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      console.log('Tentative d\'inscription pour:', userData.email);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      console.log('Inscription reussie');
      router.push('/login?registered=true');
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    hasRole,
    isAuthenticated: !!token && !!user && user.isActive === true,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// 5. HOOK PERSONNALISÉ
// ============================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};