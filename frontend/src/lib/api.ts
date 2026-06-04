// frontend/src/lib/api.ts
// Configuration API pour Y-MaD - Compatible avec le backend NestJS

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
        console.error('Acces interdit:', data?.message || 'Vous n\'avez pas les droits necessaires');
      }
      
      if (status === 404) {
        console.error('Ressource non trouvee:', data?.message || 'La ressource demandee n\'existe pas');
      }
      
      const errorMessage = data?.message || data?.error || `Erreur ${status}`;
      return Promise.reject(new Error(errorMessage));
    }
    
    if (error.request) {
      console.error('Pas de reponse du serveur:', error.message);
      return Promise.reject(new Error('Impossible de contacter le serveur. Verifiez votre connexion.'));
    }
    
    console.error('Erreur de configuration:', error.message);
    return Promise.reject(error);
  }
);

export const extractData = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

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
    role?: string;
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

  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  toggleUserStatus: async (userId: string) => {
    const response = await api.put(`/auth/users/${userId}/toggle-status`);
    return response.data;
  },

  updateUserRole: async (userId: string, role: string) => {
    const response = await api.put(`/auth/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
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
};

// ============================================================
// OFFRES D'EMPLOI API
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

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/jobs/offers/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/jobs/offers/${id}`);
    return response.data;
  },

  apply: async (data: {
    job_offer_id: string;
    full_name: string;
    email: string;
    phone?: string;
    cv_url?: string;
    cover_letter?: string;
  }) => {
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

  exportApplications: async (jobId?: string): Promise<Blob> => {
    const url = jobId ? `/jobs/applications/export?jobId=${jobId}` : '/jobs/applications/export';
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  },
};

// ============================================================
// PROJETS API
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

  getFeatured: async () => {
    const response = await api.get('/projects/featured');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/projects/stats');
    return response.data;
  },

  create: async (data: {
    title_fr: string;
    title_mg?: string;
    description_fr: string;
    description_mg?: string;
    location?: string;
    start_date?: string;
    image_url?: string;
    status?: string;
  }) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
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

  getPublicById: async (id: string) => {
    const response = await api.get(`/blog/public/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/blog/public/slug/${slug}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/blog/stats');
    return response.data;
  },

  create: async (data: {
    title_fr: string;
    title_mg?: string;
    content_fr: string;
    content_mg?: string;
    cover_image?: string;
    slug?: string;
    status?: string;
    category_id?: string;
  }) => {
    const response = await api.post('/blog', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/blog/${id}`, data);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.patch(`/blog/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: string) => {
    const response = await api.patch(`/blog/${id}/unpublish`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
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
    const response = await api.put(`/pages/backgrounds/${pageKey}/image`, { image_url: imageUrl });
    return response.data;
  },

  toggleBackground: async (pageKey: string) => {
    const response = await api.put(`/pages/backgrounds/${pageKey}/toggle`);
    return response.data;
  },

  deleteBackground: async (id: string) => {
    const response = await api.delete(`/pages/backgrounds/${id}`);
    return response.data;
  },

  initializePages: async () => {
    const response = await api.post('/pages/initialize');
    return response.data;
  },
};

// ============================================================
// CONTACT API
// ============================================================

export const contactApi = {
  sendMessage: async (data: {
    full_name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const response = await api.post('/contact', data);
    return response.data;
  },

  getAll: async (page: number = 1, limit: number = 10, status?: string, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/contact?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/contact/stats');
    return response.data;
  },

  updateStatus: async (id: string, status: string, admin_notes?: string) => {
    const response = await api.patch(`/contact/${id}/status`, { status, admin_notes });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/contact/${id}/read`);
    return response.data;
  },

  markAsReplied: async (id: string) => {
    const response = await api.patch(`/contact/${id}/replied`);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await api.patch(`/contact/${id}/archive`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
};

// ============================================================
// LANGUAGE API (Traductions)
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

  getByLocale: async (locale: string) => {
    const response = await api.get(`/language/locale/${locale}`);
    return response.data;
  },

  exportJson: async () => {
    const response = await api.get('/language/export/json');
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

  getStats: async () => {
    const response = await api.get('/language/stats/count');
    return response.data;
  },
};

// ============================================================
// UPLOAD API
// ============================================================

export const uploadApi = {
  uploadImage: async (file: File, type: string = 'job'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const data = response.data;
    return data.url || data.data?.url || data.fileUrl;
  },

  getImages: async () => {
    const response = await api.get('/upload');
    return response.data;
  },

  deleteImage: async (filename: string) => {
    const response = await api.delete(`/upload?filename=${filename}`);
    return response.data;
  },
};

export default api;