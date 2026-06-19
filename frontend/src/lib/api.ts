// frontend/src/lib/api.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Intercepteur de requete
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
    console.error('Erreur de requete:', error.message);
    return Promise.reject(error);
  }
);

// Intercepteur de reponse
api.interceptors.response.use(
  (response: AxiosResponse) => response,
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
      
      const errorMessage = data?.message || data?.error || `Erreur ${status}`;
      return Promise.reject(new Error(errorMessage));
    }
    
    if (error.request) {
      return Promise.reject(new Error('Impossible de contacter le serveur. Verifiez votre connexion.'));
    }
    
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
  };
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const data = response.data;
    
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token', data.access_token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  toggleUserStatus: async (userId: string) => {
    const response = await api.patch(`/auth/users/${userId}/toggle-status`, {});
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await api.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token') || !!localStorage.getItem('token');
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
};

// ============================================================
// PAGES API
// ============================================================

export const pagesApi = {
  getAll: async () => {
    const response = await api.get('/pages');
    return response.data;
  },

  getPublicPage: async (pageKey: string) => {
    const response = await api.get(`/pages/public/${pageKey}`);
    return response.data;
  },

  getPageForAdmin: async (pageKey: string) => {
    const response = await api.get(`/pages/${pageKey}`);
    return response.data;
  },

  updatePage: async (pageKey: string, data: any) => {
    const response = await api.put(`/pages/${pageKey}`, data);
    return response.data;
  },

  getAllBackgrounds: async () => {
    const response = await api.get('/pages/backgrounds/all');
    return response.data;
  },

  getBackground: async (pageKey: string) => {
    const response = await api.get(`/pages/backgrounds/${pageKey}`);
    return response.data;
  },

  getBackgroundForAdmin: async (pageKey: string) => {
    const response = await api.get(`/pages/backgrounds/admin/${pageKey}`);
    return response.data;
  },

  updateBackground: async (pageKey: string, data: any) => {
    const response = await api.put(`/pages/backgrounds/${pageKey}`, data);
    return response.data;
  },

  updateBackgroundImage: async (pageKey: string, imageUrl: string) => {
    const response = await api.put(`/pages/backgrounds/${pageKey}/image`, { imageUrl });
    return response.data;
  },

  toggleBackground: async (pageKey: string) => {
    const response = await api.patch(`/pages/backgrounds/${pageKey}/toggle`, {});
    return response.data;
  },

  deleteBackground: async (id: string) => {
    const response = await api.delete(`/pages/backgrounds/${id}`);
    return response.data;
  },

  initializePages: async () => {
    const response = await api.post('/pages/initialize', {});
    return response.data;
  },
};

// ============================================================
// JOBS API
// ============================================================

export const jobsApi = {
  getAll: async (page: number = 1, limit: number = 10, status?: string, contract_type?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (contract_type) params.append('contract_type', contract_type);
    const response = await api.get(`/jobs/offers?${params.toString()}`);
    return response.data;
  },

  getPublic: async (page: number = 1, limit: number = 9, contract_type?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (contract_type) params.append('contract_type', contract_type);
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

  apply: async (data: any) => {
    const response = await api.post('/jobs/apply', data);
    return response.data;
  },

  getApplications: async (jobId?: string, page: number = 1, limit: number = 10, status?: string) => {
    let url = '/jobs/applications';
    if (jobId) {
      url = `/jobs/offers/${jobId}/applications`;
    }
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    const response = await api.get(`${url}?${params.toString()}`);
    return response.data;
  },

  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.patch(`/jobs/applications/${id}/status`, { status, notes });
    return response.data;
  },

  deleteApplication: async (id: string) => {
    const response = await api.delete(`/jobs/applications/${id}`);
    return response.data;
  },

  getApplicationStats: async () => {
    const response = await api.get('/jobs/applications/stats');
    return response.data;
  },
};

// ============================================================
// BLOG API
// ============================================================

export const blogApi = {
  getAll: async (page: number = 1, limit: number = 10, status?: string, category_id?: string, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (category_id) params.append('category_id', category_id);
    if (search) params.append('search', search);
    const response = await api.get(`/blog?${params.toString()}`);
    return response.data;
  },

  getPublic: async (page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get(`/blog/public?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/blog', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/blog/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.patch(`/blog/${id}/publish`, {});
    return response.data;
  },

  unpublish: async (id: string) => {
    const response = await api.patch(`/blog/${id}/unpublish`, {});
    return response.data;
  },
};

// ============================================================
// PROJECTS API
// ============================================================

export const projectsApi = {
  getAll: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },

  getPublic: async (page: number = 1, limit: number = 9) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get(`/projects/public?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
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

  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// ============================================================
// CONTACT API
// ============================================================

export const contactApi = {
  send: async (data: any) => {
    const response = await api.post('/contact', data);
    return response.data;
  },

  getAll: async (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    const response = await api.get(`/contact?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/contact/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
};

// ============================================================
// UPLOAD API
// ============================================================

export const uploadApi = {
  uploadImage: async (file: File, type: string = 'background'): Promise<{ id: string; url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const data = response.data;
    return {
      id: data.id || data.fileId,
      url: data.url || data.fileUrl || data.data?.url,
      filename: data.filename || data.fileName || data.data?.filename,
    };
  },

  getImage: async (id: string) => {
    const response = await api.get(`/upload/file/${id}`);
    return response.data;
  },

  deleteImage: async (id: string) => {
    const response = await api.delete(`/upload/${id}`);
    return response.data;
  },
};

// ============================================================
// LANGUAGE API
// ============================================================

export const languageApi = {
  getAll: async () => {
    const response = await api.get('/language');
    return response.data;
  },

  getByKey: async (key: string) => {
    const response = await api.get(`/language/${key}`);
    return response.data;
  },

  createOrUpdate: async (key: string, value_fr: string, value_mg: string) => {
    const response = await api.post('/language', { key, value_fr, value_mg });
    return response.data;
  },

  delete: async (key: string) => {
    const response = await api.delete(`/language/${key}`);
    return response.data;
  },
};

export default api;