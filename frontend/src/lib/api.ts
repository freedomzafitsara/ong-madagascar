// frontend/src/lib/api.ts

import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
} from 'axios';
import toast from 'react-hot-toast';

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// ============================================================
// TYPES
// ============================================================

interface FailedQueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

// ============================================================
// VARIABLES DE CONTRÔLE POUR REFRESH TOKEN
// ============================================================

let isRefreshing: boolean = false;
let failedQueue: FailedQueueItem[] = [];

// ============================================================
// FILE D'ATTENTE POUR LE REFRESH TOKEN
// ============================================================

const processQueue = (error: any = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// ============================================================
// FONCTIONS UTILITAIRES POUR LES TOKENS - CORRIGÉES ✅
// ============================================================

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // ✅ Essayer plusieurs clés de token
    return localStorage.getItem('access_token') || 
           localStorage.getItem('token') || 
           null;
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    // ✅ Stocker sous les deux clés pour compatibilité
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
  }
};

const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refresh_token', token);
  }
};

const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
  }
};

// ✅ Fonction pour récupérer l'utilisateur
const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user') || localStorage.getItem('user_data');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// ✅ Vérification des pages publiques
const isPublicPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  const publicPaths = [
    '/login',
    '/',
    '/jobs',
    '/offers',
    '/public',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/blog',
    '/projects',
    '/contact',
    '/about',
    '/team',
    '/partners',
  ];
  return publicPaths.some(p => path.includes(p));
};

// ✅ Vérification des endpoints publics
const isPublicEndpoint = (url: string = ''): boolean => {
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/contact',
    '/jobs/offers/public',
    '/blog/public',
    '/projects/public',
    '/pages/public',
    '/upload/health',
  ];
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};

// ============================================================
// INTERCEPTEUR DE REQUETE - CORRIGÉ ✅
// ============================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    
    // ✅ Ajouter le token si présent
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
        hasToken: !!token,
        headers: config.headers,
        params: config.params,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Erreur requete:', error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// INTERCEPTEUR DE REPONSE - CORRIGÉ ✅
// ============================================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // ✅ Erreur réseau
    if (!error.response) {
      console.error('[API] ❌ Erreur reseau:', error.message);
      if (!isPublicPage()) {
        toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      }
      return Promise.reject(error);
    }
    
    const status = error.response.status;
    const url = originalRequest?.url || 'inconnu';
    const data = error.response?.data as any;
    const message = data?.message || data?.error || error.message;

    // ============================================================
    // 401 - Non authentifié - CORRIGÉ ✅
    // ============================================================
    if (status === 401) {
      console.warn(`[API] 🔒 401 Non autorise: ${url}`, { message });
      
      // ✅ Ne pas tenter de refresh sur les endpoints publics
      if (isPublicEndpoint(url)) {
        console.log('[API] Endpoint public, pas de refresh necessaire');
        return Promise.reject(error);
      }
      
      // ✅ Ne pas tenter de refresh si déjà en cours
      if (originalRequest?._retry) {
        console.warn('[API] Tentative de refresh deja en cours, abandon.');
        return Promise.reject(error);
      }
      
      // ✅ Si le refresh token n'existe pas, rediriger vers login
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.warn('[API] Aucun refresh token disponible');
        clearTokens();
        if (!isPublicPage()) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      // ✅ Gestion du refresh token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ 
            resolve, 
            reject, 
            config: originalRequest 
          });
        }).then(() => {
          return api(originalRequest);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('[API] 🔄 Tentative de refresh du token...');
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        const { access_token, refresh_token } = response.data;
        
        if (access_token) {
          setToken(access_token);
          if (refresh_token) {
            setRefreshToken(refresh_token);
          }
          
          console.log('[API] ✅ Token rafraichi avec succes');
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          processQueue(null);
          return api(originalRequest);
        } else {
          throw new Error('Token non recu lors du refresh');
        }
        
      } catch (refreshError) {
        console.error('[API] ❌ Echec du refresh token:', refreshError);
        clearTokens();
        processQueue(refreshError);
        
        if (!isPublicPage()) {
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }

    // ============================================================
    // 403 - Interdit
    // ============================================================
    if (status === 403) {
      console.warn(`[API] 🔒 403 Acces interdit: ${url}`, message);
      
      if (url?.includes('/jobs/offers/') && !url?.includes('/public')) {
        return Promise.reject(error);
      }
      
      if (!isPublicPage()) {
        toast.error(message || 'Vous n\'avez pas les droits nécessaires.');
      }
    }

    // ============================================================
    // 404 - Non trouvé
    // ============================================================
    else if (status === 404) {
      console.warn(`[API] 🔍 404 Non trouve: ${url}`);
      if (!isPublicPage() && !url?.includes('/public')) {
        toast.error('Ressource non trouvée.');
      }
    }

    // ============================================================
    // 429 - Trop de requêtes
    // ============================================================
    else if (status === 429) {
      console.warn(`[API] 🚦 429 Trop de requetes: ${url}`);
      toast.error('Trop de requêtes. Veuillez patienter quelques instants.');
    }

    // ============================================================
    // 422 - Erreur de validation
    // ============================================================
    else if (status === 422) {
      console.warn(`[API] 📝 422 Erreur de validation: ${url}`, data);
      
      if (data?.errors) {
        const errors = data.errors;
        if (typeof errors === 'object') {
          Object.values(errors).forEach((err: any) => {
            if (Array.isArray(err)) {
              err.forEach((e: string) => toast.error(e));
            } else if (typeof err === 'string') {
              toast.error(err);
            }
          });
        }
      } else {
        toast.error(message || 'Données invalides.');
      }
    }

    // ============================================================
    // 500+ - Erreur serveur
    // ============================================================
    else if (status >= 500) {
      console.error(`[API] 💥 ${status} Erreur serveur: ${url}`, data);
      if (!isPublicPage()) {
        toast.error('Erreur interne du serveur. Veuillez réessayer plus tard.');
      }
    }

    // ============================================================
    // Autres erreurs
    // ============================================================
    else if (status >= 400) {
      console.error(`[API] ⚠️ ${status} Erreur client: ${url}`, data);
      if (!isPublicPage() && !url?.includes('/public')) {
        toast.error(message || 'Une erreur est survenue.');
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API - CORRIGÉ ✅
// ============================================================

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token?: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    avatar_url?: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const data = response.data;
      
      // ✅ Stocker le token
      const token = data.access_token || data.token;
      if (token) {
        setToken(token);
        if (data.refresh_token) {
          setRefreshToken(data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }
        
        // ✅ Mettre à jour le header immédiatement
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('[API] ✅ Login reussi');
      } else {
        console.error('[API] ❌ Aucun token recu');
        throw new Error('Token non recu');
      }
      
      return data;
    } catch (error: any) {
      console.error('[API] ❌ Erreur login:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    clearTokens();
    // ✅ Supprimer le header
    delete api.defaults.headers.common['Authorization'];
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

  // ============================================================
  // GESTION DES UTILISATEURS - ADMIN
  // ============================================================

  getUsers: async (page: number = 1, limit: number = 10, role?: string, status?: string, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/auth/users?${params.toString()}`);
    return response.data;
  },

  getUsersStats: async () => {
    const response = await api.get('/auth/users/stats');
    return response.data;
  },

  exportUsers: async (role?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    const response = await api.get(`/auth/users/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/auth/users/${id}`, data);
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

  // ============================================================
  // PREFERENCES
  // ============================================================

  getPreferences: async () => {
    const response = await api.get('/auth/preferences');
    return response.data;
  },

  updatePreferences: async (data: any) => {
    const response = await api.put('/auth/preferences', data);
    return response.data;
  },

  // ============================================================
  // UPLOAD AVATAR
  // ============================================================

  uploadAvatar: async (file: File): Promise<{ avatar_url: string; success: boolean }> => {
    if (!file) {
      throw new Error('Aucun fichier sélectionné');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format d\'image non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('L\'image ne doit pas dépasser 5 Mo.');
    }

    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await api.post('/auth/upload-avatar', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = response.data;
      
      if (!data.avatar_url) {
        throw new Error('URL de l\'avatar non reçue du serveur');
      }
      
      return {
        success: true,
        avatar_url: data.avatar_url,
      };
    } catch (error: any) {
      console.error('Erreur upload avatar:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Erreur lors de l\'upload de l\'avatar');
    }
  },

  // ============================================================
  // UTILITAIRES
  // ============================================================

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!getToken();
    }
    return false;
  },

  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user') || localStorage.getItem('user_data');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getToken: (): string | null => {
    return getToken();
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
    try {
      const response = await api.get(`/jobs/offers/public/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        const response = await api.get(`/jobs/offers/${id}`);
        return response.data;
      }
      throw error;
    }
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
    const response = await api.post('/jobs/applications', data);
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

  checkApplication: async (jobId: string) => {
    const response = await api.get(`/jobs/applications/check/${jobId}`);
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

  getBySlug: async (slug: string) => {
    const response = await api.get(`/blog/public/slug/${slug}`);
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
  uploadImage: async (file: File, type: string = 'background', entityId?: string): Promise<{ id: string; url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', type);
    if (entityId) {
      formData.append('entityId', entityId);
    }
    
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

// ============================================================
// EXPORT PAR DEFAUT
// ============================================================

export default api;