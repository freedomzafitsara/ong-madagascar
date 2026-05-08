'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';

export type UserRole = 'super_admin' | 'admin' | 'staff' | 'member' | 'volunteer' | 'partner' | 'visitor';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
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
          console.log('✅ Auth init - Rôle:', userData.role);
        } catch (error) {
          console.error('Erreur:', error);
          authService.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const userRole = user.role as UserRole;
    const roleHierarchy: Record<UserRole, number> = {
      super_admin: 100,
      admin: 80,
      staff: 60,
      member: 40,
      volunteer: 30,
      partner: 20,
      visitor: 10,
    };
    
    if (Array.isArray(roles)) {
      return roles.some(role => roleHierarchy[userRole] >= roleHierarchy[role]);
    }
    return roleHierarchy[userRole] >= roleHierarchy[roles];
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.token);
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
    setToken(response.token);
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
        hasRole,
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