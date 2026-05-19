// frontend/src/services/backgroundService.ts
// VERSION COMPLETE CORRIGEE

import axios from 'axios';

// ============================================================
// TYPES
// ============================================================

export interface BackgroundSettings {
  id?: string;
  page: string;
  image_url: string;
  mobile_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  overlay_opacity: number;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size: 'cover' | 'contain' | 'auto';
  alt_text: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// CONFIGURATION - CORRECTION DU DOUBLE /api
// ============================================================

// IMPORTANT: NE PAS ajouter /api ici car NEXT_PUBLIC_API_URL le contient deja
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// SERVICES
// ============================================================

export const backgroundService = {
  // Recuperer un fond d'ecran par page
  async getBackground(page: string): Promise<BackgroundSettings | null> {
    try {
      // CORRECTION: URL sans double /api
      const response = await apiClient.get(`/pages/backgrounds/${page}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`Erreur getBackground pour ${page}:`, error);
      return null;
    }
  },

  // Mettre a jour un fond d'ecran
  async updateBackground(page: string, data: Partial<BackgroundSettings>): Promise<BackgroundSettings> {
    // CORRECTION: Nettoyer les donnees avant envoi
    const cleanData: any = {
      page: page,
      image_url: data.image_url || '',
      is_active: data.is_active === true,
      overlay_opacity: data.overlay_opacity || 30,
      position: data.position || 'center',
      size: data.size || 'cover',
      alt_text: data.alt_text || '',
    };
    
    // Supprimer les champs undefined
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    const response = await apiClient.put(`/pages/backgrounds/${page}`, cleanData);
    return response.data;
  },

  // Recuperer tous les fonds d'ecran
  async getAllBackgrounds(): Promise<BackgroundSettings[]> {
    try {
      const response = await apiClient.get('/pages/backgrounds/all');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Erreur getAllBackgrounds:', error);
      return [];
    }
  },

  // Supprimer un fond d'ecran
  async deleteBackground(id: string): Promise<void> {
    await apiClient.delete(`/pages/backgrounds/${id}`);
  },

  // Upload d'image
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    // CORRECTION: URL correcte sans double /api
    const response = await apiClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const imageUrl = response.data.url || response.data.fileUrl || response.data.file_url;
    
    if (!imageUrl) {
      throw new Error('URL de l\'image non recue');
    }
    
    return imageUrl;
  },

  // Activer/desactiver un fond d'ecran
  async toggleBackground(page: string, isActive: boolean): Promise<BackgroundSettings> {
    return this.updateBackground(page, { is_active: isActive });
  },

  // Mettre a jour l'opacite
  async updateOpacity(page: string, overlay_opacity: number): Promise<BackgroundSettings> {
    return this.updateBackground(page, { overlay_opacity });
  }
};

export default backgroundService;