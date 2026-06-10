// frontend/src/services/page.service.ts

import api from '@/lib/api';

export interface PageBackground {
  id: string;
  page_key: string;
  image_url: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  alt_fr?: string;
  alt_mg?: string;
}

class PageService {
  private readonly baseUrl = '/pages';

  async getPageBackground(pageKey: string): Promise<PageBackground | null> {
    try {
      // CORRECTION: Utiliser la bonne URL sans double /api
      const response = await api.get(`${this.baseUrl}/backgrounds/${pageKey}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement fond d\'écran:', error);
      return null;
    }
  }

  async getAllBackgrounds(): Promise<PageBackground[]> {
    const response = await api.get(`${this.baseUrl}/backgrounds/all`);
    return response.data;
  }
}

export const pageService = new PageService();