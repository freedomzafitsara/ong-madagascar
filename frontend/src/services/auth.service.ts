// src/services/auth.service.ts
import api from '@/lib/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export const authService = {
  /**
   * Connexion de l'utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    const data = response.data;
    
    // Stocker le token et l'utilisateur
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return data;
  },

  /**
   * Inscription d'un nouvel utilisateur (admin uniquement)
   */
  async register(userData: RegisterData): Promise<User> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<User> {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  /**
   * Met à jour le profil de l'utilisateur
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put("/auth/profile", data);
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Change le mot de passe de l'utilisateur
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/auth/change-password", { oldPassword, newPassword });
    return response.data;
  },

  /**
   * Déconnexion - Supprime le token et redirige
   */
  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    return !!token;
  },

  /**
   * Récupère l'utilisateur connecté depuis le localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Vérifie si l'utilisateur a un rôle administrateur
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin" || user?.role === "super_admin";
  },

  /**
   * Vérifie si l'utilisateur est super administrateur
   */
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "super_admin";
  },

  /**
   * Rafraîchit le token d'accès
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post("/auth/refresh");
      const newToken = response.data.access_token;
      if (newToken) {
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("token", newToken);
      }
      return newToken;
    } catch (error) {
      this.logout();
      return null;
    }
  },
};

export default authService;