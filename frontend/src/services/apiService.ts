// frontend/src/services/apiService.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ========================================
// CONFIGURATION
// ========================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Création de l'instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 secondes
});

// ========================================
// INTERCEPTEUR REQUÊTE - Ajout du token
// ========================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Récupérer le token (plusieurs sources possibles)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') || localStorage.getItem('token')
      : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Erreur de requête:', error.message);
    return Promise.reject(error);
  }
);

// ========================================
// INTERCEPTEUR RÉPONSE - Gestion des erreurs
// ========================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as any;
    
    // Gestion des erreurs 401 (token expiré)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Rafraîchissement échoué, déconnexion
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    // Log des erreurs
    if (error.response) {
      console.error(`Erreur API ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('Erreur réseau: Pas de réponse du serveur');
    } else {
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// MÉTHODES UTILITAIRES
// ========================================

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('access_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
  
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// ========================================
// SERVICES API PAR MODULE
// ========================================

// Auth
export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
};

// Jobs
export const jobsService = {
  getAll: (params?: any) => api.get('/jobs/offers', { params }),
  getById: (id: string) => api.get(`/jobs/offers/${id}`),
  create: (data: any) => api.post('/jobs/offers', data),
  update: (id: string, data: any) => api.put(`/jobs/offers/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/offers/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/jobs/offers/${id}/status`, { status }),
  apply: (id: string, formData: FormData) => api.post(`/jobs/offers/${id}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getApplications: (id: string, params?: any) => api.get(`/jobs/offers/${id}/applications`, { params }),
  updateApplicationStatus: (id: string, status: string, notes?: string) => 
    api.put(`/jobs/applications/${id}/status`, { status, notes }),
};

// Projects
export const projectsService = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Events
export const eventsService = {
  getAll: (params?: any) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  register: (id: string, data: any) => api.post(`/events/${id}/register`, data),
};

// Blog
export const blogService = {
  getAll: (params?: any) => api.get('/blog/posts', { params }),
  getBySlug: (slug: string) => api.get(`/blog/posts/${slug}`),
  getCategories: () => api.get('/blog/categories'),
};

// Donations
export const donationsService = {
  create: (data: any) => api.post('/donations', data),
  getStats: () => api.get('/donations/stats'),
};

// Newsletter
export const newsletterService = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
  unsubscribe: (email: string) => api.delete('/newsletter/unsubscribe', { data: { email } }),
};

// Footer
export const footerService = {
  getData: () => api.get('/footer'),
};

// Upload
export const uploadService = {
  uploadFile: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultiple: (files: File[], type: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', type);
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ========================================
// EXPORT PAR DÉFAUT
// ========================================

export default api;