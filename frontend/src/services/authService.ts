// frontend/src/services/authService.ts
import api from "./api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
  region?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  region?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  region?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

class AuthService {
  // ==================== AUTHENTIFICATION ====================

  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data;
      
      // Stocker dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { user, token, refreshToken };
    } catch (error: any) {
      console.error('Erreur de connexion:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/register', data);
      const { user, token, refreshToken } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { user, token, refreshToken };
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;
      
      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
      const { token } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      
      return token;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  // ==================== GESTION UTILISATEUR ====================

  /**
   * Récupérer l'utilisateur connecté depuis localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('access_token');
  }

  /**
   * Récupérer le refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!this.getToken();
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'super_admin' || user?.role === 'admin';
  }

  /**
   * Vérifier si l'utilisateur est partenaire
   */
  isPartner(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'partner';
  }

  // ==================== API APPELS ====================

  /**
   * Récupérer le profil utilisateur depuis l'API
   */
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    const user = response.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.patch('/auth/profile', data);
    const updatedUser = response.data;
    if (typeof window !== 'undefined') {
      const currentUser = this.getCurrentUser();
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
    }
    return updatedUser;
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  }

  /**
   * Demander réinitialisation du mot de passe
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  /**
   * Vérifier l'email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  /**
   * Supprimer le compte utilisateur
   */
  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/auth/account');
    this.logout();
    return response.data;
  }
}

// Export d'une instance unique
export const authService = new AuthService();

// Export des fonctions utilitaires pour utilisation directe
export const login = (email: string, password: string) => authService.login(email, password);
export const register = (data: RegisterData) => authService.register(data);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin = () => authService.isAdmin();