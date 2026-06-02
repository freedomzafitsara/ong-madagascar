// src/services/page.service.ts

import api from "./api";

export interface PageContent {
  id: string;
  page: string;
  hero?: {
    title_fr: string;
    title_mg: string;
    subtitle_fr: string;
    subtitle_mg: string;
    button_text_fr: string;
    button_text_mg: string;
    button_link: string;
    image_url: string;
  };
  sections?: any[];
  stats?: any[];
  cta?: any;
  is_published: boolean;
}

export interface PageBackground {
  id: string;
  page: string;
  image_url: string;
  mobile_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  alt_text?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export const pageService = {
  // ============================================================
  // CONTENU DES PAGES
  // ============================================================
  
  // Récupérer le contenu d'une page (public) - utilise fetch sans token
  async getPageContent(page: string): Promise<PageContent | null> {
    try {
      const response = await fetch(`${API_URL}/pages/public/${page}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erreur chargement contenu page:', error);
      return null;
    }
  },

  // Récupérer le contenu d'une page pour admin (avec token)
  async getPageContentForAdmin(page: string): Promise<PageContent> {
    const response = await api.get(`/pages/${page}`);
    return response.data;
  },

  // Mettre à jour le contenu d'une page (admin)
  async updatePageContent(page: string, data: Partial<PageContent>): Promise<PageContent> {
    const response = await api.put(`/pages/${page}`, data);
    return response.data;
  },

  // ============================================================
  // FONDS D'ECRAN
  // ============================================================
  
  // Récupérer le fond d'écran d'une page (public) - utilise fetch sans token
  async getPageBackground(page: string): Promise<PageBackground | null> {
    try {
      const response = await fetch(`${API_URL}/pages/backgrounds/${page}`);
      
      if (!response.ok) {
        // Si 401 (non autorisé) ou 404, retourner null silencieusement
        if (response.status === 401 || response.status === 404) {
          return null;
        }
        return null;
      }
      
      const data = await response.json();
      
      // Vérifier si le fond est actif
      if (data && data.is_active && data.image_url) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur chargement fond d écran:', error);
      return null;
    }
  },

  // Récupérer tous les fonds d'écran (admin)
  async getAllBackgrounds(): Promise<PageBackground[]> {
    const response = await api.get("/pages/backgrounds/all");
    return response.data;
  },

  // Mettre à jour le fond d'écran d'une page (admin)
  async updatePageBackground(page: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const response = await api.put(`/pages/backgrounds/${page}`, data);
    return response.data;
  },

  // Supprimer un fond d'écran (admin)
  async deleteBackground(id: string): Promise<void> {
    await api.delete(`/pages/backgrounds/${id}`);
  },
};

export default pageService;