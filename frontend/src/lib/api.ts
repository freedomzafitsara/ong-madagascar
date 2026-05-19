// frontend/src/lib/api.ts
// Configuration API pour Y-Mad - Compatible avec le backend NestJS

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// Création de l'instance Axios
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// ============================================================
// INTERCEPTEURS
// ============================================================

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Erreur de requête:', error.message);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      if (status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      if (status === 403) {
        console.error('Accès interdit:', data?.message || 'Vous n\'avez pas les droits nécessaires');
      }
      
      if (status === 404) {
        console.error('Ressource non trouvée:', data?.message || 'La ressource demandée n\'existe pas');
      }
      
      const errorMessage = data?.message || data?.error || `Erreur ${status}`;
      return Promise.reject(new Error(errorMessage));
    }
    
    if (error.request) {
      console.error('Pas de réponse du serveur:', error.message);
      return Promise.reject(new Error('Impossible de contacter le serveur. Vérifiez votre connexion.'));
    }
    
    console.error('Erreur de configuration:', error.message);
    return Promise.reject(error);
  }
);

// Helper pour extraire les données d'une réponse
export const extractData = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// ============================================================
// TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface LoginResponse {
  access_token: string;
  token?: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
  };
  message?: string;
}

// ============================================================
// AUTHENTIFICATION API
// ============================================================

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const data = response.data;
    
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    region?: string;
  }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/auth/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePhoto: async () => {
    const response = await api.delete('/auth/photo');
    return response.data;
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getUsers: async (page: number = 1, limit: number = 10, role?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (role) params.append('role', role);
    const response = await api.get(`/auth/users?${params.toString()}`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/auth/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId: string) => {
    const response = await api.put(`/auth/users/${userId}/toggle-status`);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },
};

// ============================================================
// UPLOAD API (NOUVEAU)
// ============================================================

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const data = response.data;
    return data.url || data.data?.url || data.fileUrl;
  },

  uploadMultiple: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const data = response.data;
    return data.urls || data.data?.urls || [];
  },

  deleteFile: async (filename: string): Promise<void> => {
    await api.delete(`/upload?filename=${filename}`);
  },
};

// ============================================================
// ÉVÉNEMENTS API
// ============================================================

export const eventsApi = {
  getAll: async (page: number = 1, limit: number = 10, type?: string, status?: string, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type && type !== 'all') params.append('type', type);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  getPublic: async (page: number = 1, limit: number = 9, type?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type && type !== 'all') params.append('type', type);
    const response = await api.get(`/events/public?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/events/stats');
    return response.data;
  },

  getUpcoming: async (limit: number = 5) => {
    const response = await api.get(`/events/upcoming?limit=${limit}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    title_mg?: string;
    description: string;
    description_mg?: string;
    type: string;
    location: string;
    region?: string;
    startDate: Date;
    endDate?: Date;
    maxCapacity?: number;
    isFree?: boolean;
    price?: number;
    imageUrl?: string;
    status?: string;
  }) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  register: async (eventId: string) => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  cancelRegistration: async (eventId: string) => {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await api.get('/events/my/registrations');
    return response.data;
  },

  getEventRegistrations: async (eventId: string) => {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  changeStatus: async (id: string, status: string) => {
    const response = await api.patch(`/events/${id}/status`, { status });
    return response.data;
  },
};

// ============================================================
// PROJETS API
// ============================================================

export const projectsApi = {
  getAll: async (page: number = 1, limit: number = 10, region?: string, category?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (region) params.append('region', region);
    if (category) params.append('category', category);
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get('/projects/featured');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/projects/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  updateProgress: async (id: string, progress: number) => {
    const response = await api.patch(`/projects/${id}/progress`, { progress });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// ============================================================
// OFFRES D'EMPLOI API
// ============================================================

export const jobsApi = {
  getAll: async (page: number = 1, limit: number = 10, status?: string, jobType?: string, search?: string, region?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status && status !== 'all') params.append('status', status);
    if (jobType && jobType !== 'all') params.append('jobType', jobType);
    if (search) params.append('search', search);
    if (region && region !== 'all') params.append('region', region);
    const response = await api.get(`/jobs/offers?${params.toString()}`);
    return response.data;
  },

  getPublic: async (page: number = 1, limit: number = 9, jobType?: string, region?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (jobType && jobType !== 'all') params.append('jobType', jobType);
    if (region && region !== 'all') params.append('region', region);
    const response = await api.get(`/jobs/offers/public?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/jobs/offers/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get('/jobs/offers/featured');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/jobs/offers/stats');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/jobs/offers', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/jobs/offers/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/jobs/offers/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/jobs/offers/${id}/status`, { status });
    return response.data;
  },

  apply: async (formData: FormData) => {
    const response = await api.post('/jobs/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  applyAuth: async (formData: FormData) => {
    const response = await api.post('/jobs/apply/auth', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getApplications: async (offerId: string, page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status && status !== 'all') params.append('status', status);
    const response = await api.get(`/jobs/offers/${offerId}/applications?${params.toString()}`);
    return response.data;
  },

  getApplication: async (id: string) => {
    const response = await api.get(`/jobs/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.patch(`/jobs/applications/${id}/status`, { status, notes });
    return response.data;
  },

  getMyApplications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/jobs/applications/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAllApplications: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status && status !== 'all') params.append('status', status);
    const response = await api.get(`/jobs/applications/all?${params.toString()}`);
    return response.data;
  },
};

// ============================================================
// MEMBRES API
// ============================================================

export const membersApi = {
  getAll: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    const response = await api.get(`/members?${params.toString()}`);
    return response.data;
  },

  getMyMember: async () => {
    const response = await api.get('/members/me');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  create: async (data: {
    membershipType: string;
    paymentMethod: string;
    amount: number;
  }) => {
    const response = await api.post('/members', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/members/${id}/status`, { status });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/members/stats/all');
    return response.data;
  },

  getCard: async (memberNumber: string) => {
    const response = await api.get(`/members/card/${memberNumber}`);
    return response.data;
  },
};

// ============================================================
// DONS API
// ============================================================

export const donationsApi = {
  getAll: async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get(`/donations?${params.toString()}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/donations/stats/all');
    return response.data;
  },

  create: async (data: {
    amount: number;
    currency?: string;
    paymentProvider: string;
    phoneNumber?: string;
    donorName?: string;
    donorEmail?: string;
    message?: string;
    isAnonymous?: boolean;
    projectId?: string;
  }) => {
    const response = await api.post('/donations', data);
    return response.data;
  },

  createAuth: async (data: any) => {
    const response = await api.post('/donations/auth', data);
    return response.data;
  },

  confirm: async (transactionId: string, provider: string) => {
    const response = await api.post('/donations/confirm', { transactionId, provider });
    return response.data;
  },

  getMyDonations: async () => {
    const response = await api.get('/donations/my-donations');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },
};

// ============================================================
// BLOG API
// ============================================================

export const blogApi = {
  getAll: async (page: number = 1, limit: number = 9, type?: string, tag?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    if (tag) params.append('tag', tag);
    const response = await api.get(`/blog?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/blog/stats/all');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/blog', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/blog/${id}`, data);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.put(`/blog/${id}/publish`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },
};

// ============================================================
// UPLOAD AVANCE (Pour offres d'emploi)
// ============================================================

export const jobUploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const data = response.data;
    return data.url || data.data?.url || data.fileUrl;
  },
};

// Export de l'instance axios par défaut
export default api;