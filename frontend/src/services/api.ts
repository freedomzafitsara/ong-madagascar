// frontend/src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// Configuration de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// Création de l'instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000, // 30 secondes
  withCredentials: false,
});

// ============================================
// INTERCEPTEUR DE REQUÊTE - Ajout du token JWT
// ============================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Vérifier si on est dans le navigateur
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const accessToken = localStorage.getItem("access_token");
      const finalToken = token || accessToken;
      
      if (finalToken && config.headers) {
        config.headers.Authorization = `Bearer ${finalToken}`;
      }
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error("Erreur de requête:", error.message);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTEUR DE RÉPONSE - Gestion des erreurs
// ============================================
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as any;
    
    // Gestion des erreurs 401 (Non authentifié)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      // Tenter de rafraîchir le token
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem("token", access_token);
          
          // Réessayer la requête originale
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Rafraîchissement échoué, déconnexion
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        
        // Rediriger vers la page de connexion
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    
    // Gestion des autres erreurs
    if (error.response) {
      // Erreur avec réponse du serveur
      console.error("Erreur API:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Pas de réponse du serveur
      console.error("Erreur réseau: Pas de réponse du serveur");
    } else {
      // Erreur lors de la configuration de la requête
      console.error("Erreur de configuration:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// MÉTHODES UTILITAIRES
// ============================================

/**
 * Définir le token d'authentification
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
  }
};

/**
 * Obtenir le token actuel
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Déconnexion
 */
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  delete api.defaults.headers.common["Authorization"];
  
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export default api;