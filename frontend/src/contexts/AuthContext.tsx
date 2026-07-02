// frontend/src/contexts/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  preferred_language?: string;
  timezone?: string;
  theme?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
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
  refreshUser: () => Promise<User | null>;
}

// ============================================================
// CONSTANTES
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const TOKEN_KEY = 'access_token';

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // CHARGEMENT DE LA SESSION - UNIQUEMENT LE TOKEN
  // ============================================================

  const loadSession = useCallback(async (): Promise<User | null> => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      
      if (!storedToken) {
        console.log('[Auth] Aucun token trouve');
        return null;
      }

      console.log('[Auth] Token trouve, chargement depuis PostgreSQL...');

      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) {
        console.log('[Auth] Token invalide, nettoyage...');
        localStorage.removeItem(TOKEN_KEY);
        document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        if (response.status === 401) {
          toast.error('Session expiree. Veuillez vous reconnecter.');
        }
        return null;
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.id,
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        role: data.role || 'visitor',
        avatar_url: data.avatar_url || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        preferred_language: data.preferred_language || 'fr',
        timezone: data.timezone || 'Indian/Antananarivo',
        theme: data.theme || 'light',
        last_login: data.last_login || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };

      console.log('[Auth] Utilisateur charge depuis PostgreSQL:', userData.email);
      return userData;
      
    } catch (error) {
      console.error('[Auth] Erreur chargement session:', error);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }, []);

  // ============================================================
  // INITIALISATION
  // ============================================================

  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);
      try {
        const userData = await loadSession();
        const storedToken = localStorage.getItem(TOKEN_KEY);
        
        if (userData && storedToken) {
          setToken(storedToken);
          setUser(userData);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] Erreur initialisation:', error);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [loadSession]);

  // ============================================================
  // VERIFICATIONS DES ROLES
  // ============================================================

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isCandidate = user?.role === 'candidate';
  const isVisitor = !user || user?.role === 'visitor';
  const isAuthenticated = !!user && !!token;

  // ============================================================
  // RAFRAICHIR L'UTILISATEUR - DEPUIS POSTGRESQL
  // ============================================================

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!token) return null;

    try {
      console.log('[Auth] Rafraichissement utilisateur depuis PostgreSQL...');
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          setToken(null);
          setUser(null);
          toast.error('Session expiree');
          router.push('/login');
        }
        return null;
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.id,
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        role: data.role || 'visitor',
        avatar_url: data.avatar_url || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        preferred_language: data.preferred_language || 'fr',
        timezone: data.timezone || 'Indian/Antananarivo',
        theme: data.theme || 'light',
        last_login: data.last_login || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };

      setUser(userData);
      console.log('[Auth] Utilisateur rafraichi:', userData.email);
      return userData;
      
    } catch (error) {
      console.error('[Auth] Erreur rafraichissement:', error);
      return null;
    }
  }, [token, router]);

  // ============================================================
  // CONNEXION
  // ============================================================

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[Auth] Tentative de connexion pour:', email);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur de connexion';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.access_token || !data.user) {
        throw new Error('Donnees de connexion incomplete');
      }

      // UNIQUEMENT LE TOKEN EST STOCKE DANS LOCALSTORAGE
      localStorage.setItem(TOKEN_KEY, data.access_token);
      
      // Cookie pour le middleware
      document.cookie = `${TOKEN_KEY}=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        phone: data.user.phone || '',
        role: data.user.role || 'visitor',
        avatar_url: data.user.avatar_url || '',
        is_active: data.user.is_active !== undefined ? data.user.is_active : true,
        preferred_language: data.user.preferred_language || 'fr',
        timezone: data.user.timezone || 'Indian/Antananarivo',
        theme: data.user.theme || 'light',
        last_login: data.user.last_login || new Date().toISOString(),
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: data.user.updated_at || new Date().toISOString(),
      };

      setToken(data.access_token);
      setUser(userData);

      console.log('[Auth] Connexion reussie pour:', userData.email);

      if (userData.role === 'admin' || userData.role === 'super_admin') {
        toast.success('Bienvenue Administrateur');
        router.push('/dashboard');
      } else if (userData.role === 'candidate') {
        toast.success('Connexion reussie');
        router.push('/candidate/profile');
      } else {
        router.push('/');
      }

    } catch (error) {
      console.error('[Auth] Erreur de connexion:', error);
      throw error;
    }
  }, [router]);

  // ============================================================
  // INSCRIPTION
  // ============================================================

  const register = useCallback(async (data: RegisterData) => {
    try {
      console.log('[Auth] Tentative d\'inscription pour:', data.email);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'inscription';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      console.log('[Auth] Inscription reussie pour:', data.email);
      toast.success('Inscription reussie ! Veuillez vous connecter.');
      router.push('/login?registered=true');

    } catch (error) {
      console.error('[Auth] Erreur d\'inscription:', error);
      throw error;
    }
  }, [router]);

  // ============================================================
  // DECONNEXION
  // ============================================================

  const logout = useCallback(() => {
    console.log('[Auth] Deconnexion');
    
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    setToken(null);
    setUser(null);
    
    toast.success('Deconnecte avec succes');
    router.push('/login');
  }, [router]);

  // ============================================================
  // MISE A JOUR DU PROFIL
  // ============================================================

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!token) throw new Error('Non authentifie');

    try {
      console.log('[Auth] Mise a jour du profil dans PostgreSQL...');

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur de mise a jour';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      const updatedData = await response.json();
      
      if (user) {
        const newUser: User = {
          ...user,
          first_name: updatedData.first_name || user.first_name,
          last_name: updatedData.last_name || user.last_name,
          phone: updatedData.phone || user.phone,
          avatar_url: updatedData.avatar_url || user.avatar_url,
          preferred_language: updatedData.preferred_language || user.preferred_language,
          timezone: updatedData.timezone || user.timezone,
          theme: updatedData.theme || user.theme,
          updated_at: new Date().toISOString(),
        };
        
        setUser(newUser);
        console.log('[Auth] Profil mis a jour dans PostgreSQL');
        toast.success('Profil mis a jour avec succes');
      }

    } catch (error) {
      console.error('[Auth] Erreur mise a jour profil:', error);
      throw error;
    }
  }, [token, user]);

  // ============================================================
  // CHANGEMENT DE MOT DE PASSE
  // ============================================================

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error('Non authentifie');

    try {
      console.log('[Auth] Changement de mot de passe dans PostgreSQL...');

      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur de changement de mot de passe';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      console.log('[Auth] Mot de passe change avec succes');
      toast.success('Mot de passe modifie avec succes');

    } catch (error) {
      console.error('[Auth] Erreur changement mot de passe:', error);
      throw error;
    }
  }, [token]);

  // ============================================================
  // UPLOAD AVATAR
  // ============================================================

  const uploadAvatar = useCallback(async (file: File) => {
    if (!token) throw new Error('Non authentifie');
    if (!file) throw new Error('Aucun fichier selectionne');

    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit etre une image');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('L\'image ne doit pas depasser 5MB');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', 'profile');
    if (user?.id) {
      formData.append('entityId', user.id);
    }

    try {
      console.log('[Auth] Upload avatar...');

      const response = await fetch(`${API_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (user) {
        const baseUrl = API_URL.replace('/api', '');
        const avatarUrl = data.url || `${baseUrl}${data.path}` || data.data?.url;
        
        const newUser: User = {
          ...user,
          avatar_url: avatarUrl,
        };
        setUser(newUser);
        toast.success('Avatar mis a jour avec succes');
      }

    } catch (error) {
      console.error('[Auth] Erreur upload avatar:', error);
      throw error;
    }
  }, [token, user]);

  // ============================================================
  // VALEUR DU CONTEXT
  // ============================================================

  const value: AuthContextType = {
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
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK PERSONNALISE
// ============================================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};