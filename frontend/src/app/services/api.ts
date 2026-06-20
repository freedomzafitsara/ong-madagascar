// frontend/src/lib/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// Création de l'instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
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
  config: any;
}

// ============================================================
// VARIABLES DE CONTROLE
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
// INTERCEPTEUR DE REQUETE
// ============================================================

api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug - Afficher la requête en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Erreur requête:', error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// INTERCEPTEUR DE REPONSE
// ============================================================

api.interceptors.response.use(
  (response) => {
    // Debug - Afficher la réponse en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Si l'erreur n'a pas de réponse (problème réseau)
    if (!error.response) {
      console.error('[API] Erreur réseau:', error.message);
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
      return Promise.reject(error);
    }
    
    const status = error.response.status;
    const url = originalRequest?.url || 'inconnu';
    const message = (error.response?.data as any)?.message || error.message;
    
    // ============================================================
    // GESTION DES ERREURS PAR CODE HTTP
    // ============================================================
    
    // 400 - Mauvaise requête
    if (status === 400) {
      console.warn(`[API] 400 Requête invalide: ${url}`, message);
      toast.error(message || 'Requête invalide. Veuillez vérifier vos données.');
    }
    
    // 401 - Non authentifié
    else if (status === 401) {
      console.warn(`[API] 401 Non autorisé: ${url}`);
      
      // Éviter les boucles infinies
      if (originalRequest?._retry) {
        console.warn('[API] Tentative de refresh déjà en cours, abandon.');
        return Promise.reject(error);
      }
      
      // Si ce n'est pas une requête de refresh, tenter de rafraîchir le token
      if (!originalRequest?.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;
        
        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          }).then(() => {
            return api(originalRequest);
          });
        }
        
        isRefreshing = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (!refreshToken) {
            console.warn('[API] Aucun refresh token disponible');
            throw new Error('Aucun refresh token');
          }
          
          console.log('[API] Tentative de refresh du token...');
          
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          
          if (access_token) {
            localStorage.setItem('access_token', access_token);
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token);
            }
            
            console.log('[API] Token rafraîchi avec succès');
            
            // Mettre à jour le token dans la requête originale
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            
            // Traiter la file d'attente
            processQueue(null);
            
            // Réexécuter la requête originale
            return api(originalRequest);
          } else {
            throw new Error('Token non reçu');
          }
          
        } catch (refreshError) {
          console.error('[API] Échec du refresh token:', refreshError);
          
          // Nettoyer les tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          // Traiter la file d'attente avec erreur
          processQueue(refreshError);
          
          // Rediriger vers la page de connexion
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          
          // Redirection uniquement si pas déjà sur une page publique
          if (typeof window !== 'undefined') {
            const isPublicPage = 
              window.location.pathname.includes('/login') ||
              window.location.pathname === '/' ||
              window.location.pathname.includes('/jobs') ||
              window.location.pathname.includes('/offers') ||
              window.location.pathname.includes('/public');
            
            if (!isPublicPage) {
              window.location.href = '/login';
            }
          }
          
          return Promise.reject(refreshError);
          
        } finally {
          isRefreshing = false;
        }
      }
      
      // Si c'est une requête de refresh qui a échoué
      if (originalRequest?.url?.includes('/auth/refresh')) {
        console.warn('[API] Échec du refresh, déconnexion...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (typeof window !== 'undefined') {
          const isPublicPage = 
            window.location.pathname.includes('/login') ||
            window.location.pathname === '/' ||
            window.location.pathname.includes('/jobs') ||
            window.location.pathname.includes('/offers') ||
            window.location.pathname.includes('/public');
          
          if (!isPublicPage) {
            window.location.href = '/login';
          }
        }
      }
    }
    
    // 403 - Interdit
    else if (status === 403) {
      console.warn(`[API] 403 Accès interdit: ${url}`, message);
      
      // Message personnalisé selon l'URL
      if (url.includes('/jobs/offers/') && !url.includes('/public')) {
        // Pour les offres, rediriger vers la page publique
        const jobId = url.split('/').pop();
        if (jobId && typeof window !== 'undefined') {
          window.location.href = `/jobs/${jobId}`;
        }
      } else {
        toast.error(message || 'Vous n\'avez pas les droits nécessaires pour accéder à cette ressource.');
      }
    }
    
    // 404 - Non trouvé
    else if (status === 404) {
      console.warn(`[API] 404 Non trouvé: ${url}`);
      toast.error('Ressource non trouvée.');
    }
    
    // 429 - Trop de requêtes
    else if (status === 429) {
      console.warn(`[API] 429 Trop de requêtes: ${url}`);
      toast.error('Trop de requêtes. Veuillez patienter quelques instants.');
    }
    
    // 500+ - Erreur serveur
    else if (status >= 500) {
      console.error(`[API] ${status} Erreur serveur: ${url}`, error.response.data);
      toast.error('Erreur interne du serveur. Veuillez réessayer plus tard.');
    }
    
    // Autres erreurs
    else {
      console.error(`[API] ${status} Erreur inconnue: ${url}`, error.response.data);
      toast.error(message || 'Une erreur est survenue.');
    }
    
    return Promise.reject(error);
  }
);

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Vérifier la santé de l'API
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('[API] Health check échoué');
    return false;
  }
};

/**
 * Récupérer le token d'authentification
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Définir le token d'authentification
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

/**
 * Définir le refresh token
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refresh_token', token);
  }
};

/**
 * Supprimer tous les tokens
 */
export const removeAuthTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

/**
 * Configurer l'authentification avec les tokens
 */
export const setupAuth = (accessToken: string, refreshToken?: string): void => {
  setAuthToken(accessToken);
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
};

/**
 * Créer une instance axios sans interceptor (pour les appels publics)
 * ✅ CORRIGÉ: Retourne une AxiosInstance, pas AxiosStatic
 */
export const createPublicApi = (): AxiosInstance => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });
};

/**
 * Créer une instance avec des options personnalisées
 */
export const createCustomApi = (options?: {
  headers?: Record<string, string>;
  timeout?: number;
  baseURL?: string;
}): AxiosInstance => {
  return axios.create({
    baseURL: options?.baseURL || API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
    timeout: options?.timeout || 30000,
  });
};

export default api;