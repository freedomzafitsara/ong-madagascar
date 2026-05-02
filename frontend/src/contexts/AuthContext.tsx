'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Erreur chargement profil:', error);
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    if (response.success) {
      setUser(response.user);
      setToken(response.token);
    } else {
      throw new Error(response.message);
    }
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    if (response.success) {
      setUser(response.user);
      setToken(response.token);
    } else {
      throw new Error(response.message);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: any): Promise<User> => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}