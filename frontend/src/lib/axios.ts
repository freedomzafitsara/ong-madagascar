// frontend/src/lib/axios.ts

import axios from 'axios';

// ============================================================
// 1. CONFIGURATION DE BASE
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

const getBaseUrl = (): string => {
  const url = API_BASE_URL;
  if (url.endsWith('/api')) {
    return url;
  }
  return `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// ============================================================
// 2. INTERCEPTEUR DE REQUETE - AJOUT DU TOKEN JWT
// ============================================================

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('[API] Erreur requete:', error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// 3. INTERCEPTEUR DE REPONSE - GESTION DES ERREURS
// ============================================================

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('[API] Erreur reseau:', error.message);
      return Promise.reject(new Error('Impossible de contacter le serveur. Verifiez votre connexion.'));
    }
    
    const status = error.response.status;
    const url = error.config?.url || 'inconnu';
    const message = error.response?.data?.message || error.message;
    
    if (status === 400) {
      console.warn(`[API] 400 Requete invalide: ${url}`, message);
    } 
    else if (status === 401) {
      console.warn(`[API] 401 Non autorise: ${url}`);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        const isPublicPage = window.location.pathname.includes('/login') || 
                            window.location.pathname === '/' ||
                            window.location.pathname.includes('/public') ||
                            window.location.pathname.includes('/jobs');
                            
        if (!isPublicPage) {
          window.location.href = '/login';
        }
      }
    } 
    else if (status === 403) {
      console.warn(`[API] 403 Interdit: ${url}`);
      error.message = error.response?.data?.message || 'Vous n\'avez pas les droits necessaires';
    } 
    else if (status === 404) {
      console.warn(`[API] 404 Non trouve: ${url}`);
      error.message = 'Ressource non trouvee';
    } 
    else if (status === 429) {
      console.warn(`[API] 429 Trop de requetes: ${url}`);
      error.message = 'Trop de requetes. Veuillez patienter.';
    } 
    else if (status >= 500) {
      console.error(`[API] ${status} Erreur serveur: ${url}`);
      error.message = 'Erreur interne du serveur';
    } 
    else {
      console.error(`[API] ${status} Erreur inconnue: ${url}`);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// 4. FONCTIONS UTILITAIRES
// ============================================================

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('[API] Health check echoue');
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