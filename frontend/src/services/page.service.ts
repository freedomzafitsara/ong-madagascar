// src/services/page.service.ts
import api from '@/lib/axios';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export const pageService = {
  // ============================================================
  // CONTENU DES PAGES (PUBLIC)
  // ============================================================
  
  /**
   * Récupère le contenu d'une page (public - sans authentification)
   */
  async getPageContent(page: string): Promise<PageContent | null> {
    try {
      const response = await fetch(`${API_URL}/api/pages/public/${page}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erreur chargement contenu page:', error);
      return null;
    }
  },

  /**
   * Récupère le contenu d'une page pour admin (avec token)
   */
  async getPageContentForAdmin(page: string): Promise<PageContent> {
    const response = await api.get(`/pages/${page}`);
    return response.data;
  },

  /**
   * Met à jour le contenu d'une page (admin)
   */
  async updatePageContent(page: string, data: Partial<PageContent>): Promise<PageContent> {
    const response = await api.put(`/pages/${page}`, data);
    return response.data;
  },

  // ============================================================
  // FONDS D'ECRAN (PUBLIC)
  // ============================================================
  
  /**
   * Récupère le fond d'écran d'une page (public - sans authentification)
   */
  async getPageBackground(page: string): Promise<PageBackground | null> {
    try {
      const response = await fetch(`${API_URL}/api/pages/backgrounds/${page}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data && data.is_active && data.image_url) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur chargement fond d écran:', error);
      return null;
    }
  },

  // ============================================================
  // FONDS D'ECRAN (ADMIN)
  // ============================================================
  
  /**
   * Récupère tous les fonds d'écran (admin)
   */
  async getAllBackgrounds(): Promise<PageBackground[]> {
    const response = await api.get("/pages/backgrounds/all");
    return response.data;
  },

  /**
   * Récupère le fond d'écran d'une page pour admin (avec token)
   */
  async getPageBackgroundForAdmin(page: string): Promise<PageBackground | null> {
    try {
      const response = await api.get(`/pages/backgrounds/${page}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement fond d écran admin:', error);
      return null;
    }
  },

  /**
   * Met à jour le fond d'écran d'une page (admin)
   */
  async updatePageBackground(page: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const response = await api.put(`/pages/backgrounds/${page}`, data);
    return response.data;
  },

  /**
   * Supprime un fond d'écran (admin)
   */
  async deleteBackground(id: string): Promise<void> {
    await api.delete(`/pages/backgrounds/${id}`);
  },
};

export default pageService;