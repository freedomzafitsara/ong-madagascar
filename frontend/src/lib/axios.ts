// frontend/src/lib/axios.ts
// VERSION FINALE CORRIGEE

import axios from 'axios';

// ============================================================
// CONFIGURATION
// ============================================================

// NE PAS ajouter /api ici car il sera ajoute dans baseURL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

const api = axios.create({
  baseURL: `${API_URL}/api`,  // ✅ CORRECT: baseURL contient deja /api
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,  // Pas besoin de credentials pour JWT
});

// ============================================================
// INTERCEPTEUR REQUETE - AJOUT DU TOKEN
// ============================================================

api.interceptors.request.use(
  (config) => {
    // Verifier que nous sommes cote client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Debug (optionnel - retirer en production)
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
    // Debug (optionnel)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Response ${response.status}: ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Gestion des erreurs reseau
    if (!error.response) {
      console.error('[API] Network error:', error.message);
      return Promise.reject(new Error('Erreur de connexion au serveur'));
    }
    
    // Gestion du 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized - Redirection vers login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Eviter les redirections multiples
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Gestion du 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('[API] 403 Forbidden - Acces refuse');
    }
    
    // Gestion du 404 Not Found
    if (error.response?.status === 404) {
      console.warn('[API] 404 Not Found:', error.config?.url);
    }
    
    // Gestion du 500 Server Error
    if (error.response?.status >= 500) {
      console.error('[API] Server error:', error.response.status);
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Verifie si l'API est accessible
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return false;
  }
};

/**
 * Recupere le token actuel
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  }
  return null;
};

/**
 * Definit le token d'authentification
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
  }
};

/**
 * Supprime le token d'authentification
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

export default api;