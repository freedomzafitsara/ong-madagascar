// backgroundService.ts - Service simplifié pour la gestion des fonds d'écran
import { api } from './api';

// Interface simplifiée pour la gestion des fonds d'écran (sans les champs optionnels)
export interface BackgroundSettings {
  page: string;
  image_url: string;
  is_active: boolean;
  overlay_opacity: number;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size: 'cover' | 'contain' | 'auto';
  alt_text: string;
}

// Interface complète retournée par l'API
export interface PageBackgroundFull {
  id: string;
  page: string;
  image_url: string;
  mobile_url: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
}

export const backgroundService = {
  // Recuperer le fond d'ecran d'une page
  async getBackground(page: string): Promise<BackgroundSettings | null> {
    try {
      const response = await api.get(`/pages/backgrounds/${page}`);
      const fullData: PageBackgroundFull = response.data;
      
      if (fullData && fullData.id) {
        return {
          page: fullData.page,
          image_url: fullData.image_url,
          is_active: fullData.is_active,
          overlay_opacity: fullData.overlay_opacity,
          position: fullData.position as any,
          size: fullData.size as any,
          alt_text: fullData.alt_text || ''
        };
      }
      return null;
    } catch (error) {
      console.warn(`Aucun fond d'ecran pour la page ${page}`);
      return null;
    }
  },

  // Mettre a jour le fond d'ecran d'une page
  async updateBackground(page: string, token: string, data: Partial<BackgroundSettings>): Promise<void> {
    await api.put(`/pages/backgrounds/${page}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Recuperer tous les fonds d'ecran (admin)
  async getAllBackgrounds(token: string): Promise<BackgroundSettings[]> {
    const response = await api.get('/pages/backgrounds/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fullData: PageBackgroundFull[] = response.data;
    
    return fullData.map(item => ({
      page: item.page,
      image_url: item.image_url,
      is_active: item.is_active,
      overlay_opacity: item.overlay_opacity,
      position: item.position as any,
      size: item.size as any,
      alt_text: item.alt_text || ''
    }));
  },

  // Supprimer un fond d'ecran
  async deleteBackground(id: string, token: string): Promise<void> {
    await api.delete(`/pages/backgrounds/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export default backgroundService;