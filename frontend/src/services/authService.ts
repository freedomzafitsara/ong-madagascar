import api from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  photo?: string;        // ← AJOUTER CETTE LIGNE
  avatarUrl?: string;
  region?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  region?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photo?: string;        // ← AJOUTER CETTE LIGNE
  avatarUrl?: string;
  bio?: string;
  region?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', data);
    const dataResponse = response.data;
    
    if (dataResponse.success && dataResponse.token) {
      localStorage.setItem('token', dataResponse.token);
      localStorage.setItem('user', JSON.stringify(dataResponse.user));
    }
    
    return dataResponse;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

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

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put('/auth/profile', data);
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
}

export const authService = new AuthService();