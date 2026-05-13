// frontend/src/services/api.ts
// Configuration de l'API client pour Y-Mad
// Version finale - Soutenance DTS 2025

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// ============================================================
// 1. CONFIGURATION DE BASE
// ============================================================

// URL de base de l'API (backend NestJS)
// La variable NEXT_PUBLIC_API_URL doit contenir l'URL sans /api à la fin
// Exemple: http://localhost:4001 (et /api est ajouté automatiquement)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// Instance Axios configurée
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 secondes maximum par requête
});

// ============================================================
// 2. INTERCEPTEUR DE REQUÊTE (AJOUT DU TOKEN)
// ============================================================

/**
 * Intercepteur de requête : ajoute le token JWT dans le header Authorization
 * pour toutes les requêtes nécessitant une authentification.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    // Ajouter le token dans le header Authorization si disponible
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Erreur dans l\'intercepteur de requête:', error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// 3. INTERCEPTEUR DE RÉPONSE (GESTION DES ERREURS)
// ============================================================

/**
 * Intercepteur de réponse : gère les erreurs globalement.
 * En cas d'erreur 401 (non authentifié), redirige vers la page de connexion.
 */
api.interceptors.response.use(
  // Succès : retourner la réponse inchangée
  (response) => response,
  
  // Erreur : traiter l'erreur
  (error: AxiosError) => {
    // Vérifier si l'erreur est une 401 (Authentification requise ou token invalide)
    if (error.response?.status === 401) {
      // Vérifier qu'on n'est pas déjà sur la page de login
      const isLoginPage = typeof window !== 'undefined' && 
                          window.location.pathname.includes('/login');
      
      if (!isLoginPage) {
        // Nettoyer les données d'authentification
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    }
    
    // Retourner l'erreur pour que le code appelant puisse la gérer
    return Promise.reject(error);
  }
);

// ============================================================
// 4. FONCTIONS UTILITAIRES
// ============================================================

/**
 * Vérifie si l'API est accessible
 * @returns boolean - true si l'API répond, false sinon
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    // Appeler une route publique (par exemple, /api/health si elle existe)
    const response = await api.get('/');
    return response.status === 200;
  } catch (error) {
    console.error('API inaccessible:', error);
    return false;
  }
};

/**
 * Récupère le token actuel
 * @returns string | null - Le token JWT ou null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

/**
 * Définit le token dans localStorage
 * @param token - Token JWT à stocker
 */
export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('token', token);
};

/**
 * Supprime le token (déconnexion)
 */
export const removeToken = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ============================================================
// 5. EXPORT PAR DÉFAUT
// ============================================================

export default api;