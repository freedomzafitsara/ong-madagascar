// frontend/src/lib/axios.ts
// VERSION FINALE CORRIGEE - PRETE POUR PRODUCTION

import axios from 'axios';

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// ============================================================
// INTERCEPTEUR REQUETE - AJOUT DU TOKEN
// ============================================================

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// INTERCEPTEUR REPONSE - GESTION DES ERREURS
// ============================================================

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response ${response.status}: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('[API] Network error:', error.message);
      return Promise.reject(new Error('Erreur de connexion au serveur'));
    }
    
    const status = error.response.status;
    const url = error.config?.url || 'unknown';
    
    if (status === 400) {
      console.warn(`[API] 400 Bad Request: ${url}`);
    } else if (status === 401) {
      console.warn(`[API] 401 Unauthorized: ${url}`);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (status === 403) {
      console.warn(`[API] 403 Forbidden: ${url}`);
    } else if (status === 404) {
      console.warn(`[API] 404 Not Found: ${url}`);
    } else if (status === 429) {
      console.warn(`[API] 429 Too Many Requests: ${url}`);
    } else if (status >= 500) {
      console.error(`[API] ${status} Server Error: ${url}`);
    } else {
      console.error(`[API] ${status} Error: ${url}`);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return false;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

export default api;