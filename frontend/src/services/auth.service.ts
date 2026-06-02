// src/services/auth.service.ts
import api from "./api";

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

export const authService = {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    const data = response.data;
    
    // Stocker le token et l'utilisateur
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return data;
  },

  // Inscription (admin uniquement)
  async register(userData: RegisterData): Promise<User> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Récupérer le profil
  async getProfile(): Promise<User> {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Mettre à jour le profil
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put("/auth/profile", data);
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put("/auth/change-password", { oldPassword, newPassword });
  },

  // Déconnexion
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Vérifier si l'utilisateur a le rôle admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin" || user?.role === "super_admin";
  },
};

export default authService;
