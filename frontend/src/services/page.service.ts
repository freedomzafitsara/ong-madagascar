// frontend/src/services/page.service.ts

import api from '@/lib/axios';

export interface PageContent {
  id: string;
  page_key: string;
  content_fr?: string;
  content_mg?: string;
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
  seo_title_fr?: string;
  seo_title_mg?: string;
  seo_description_fr?: string;
  seo_description_mg?: string;
  seo_keywords?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageBackground {
  id: string;
  page_key: string;
  image_url: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  alt_fr?: string;
  alt_mg?: string;
  created_at: string;
  updated_at: string;
}

export const pageService = {
  // ============================================================
  // CONTENU DES PAGES (PUBLIC)
  // ============================================================
  
  async getPageContent(page: string): Promise<PageContent | null> {
    try {
      const response = await api.get(`/pages/public/${page}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement contenu page:', error);
      return null;
    }
  },

  async getPageContentForAdmin(page: string): Promise<PageContent> {
    const response = await api.get(`/pages/${page}`);
    return response.data;
  },

  async updatePageContent(page: string, data: Partial<PageContent>): Promise<PageContent> {
    const response = await api.put(`/pages/${page}`, data);
    return response.data;
  },

  // ============================================================
  // FONDS D'ECRAN (PUBLIC)
  // ============================================================
  
  async getPageBackground(page: string): Promise<PageBackground | null> {
    try {
      const response = await api.get(`/pages/backgrounds/${page}`);
      
      const data = response.data;
      
      if (data && data.is_active !== false && data.image_url) {
        let imageUrl = data.image_url;
        
        // Si l'URL est relative, la rendre absolue
        if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
          imageUrl = `${baseUrl}${imageUrl}`;
        }
        
        return {
          ...data,
          image_url: imageUrl,
        };
      }
      
      return null;
    } catch (error: any) {
      // Gérer les erreurs axios
      if (error.response) {
        console.error(`Erreur ${error.response.status} chargement fond d'ecran:`, error.response.data);
      } else {
        console.error('Erreur chargement fond d ecran:', error.message);
      }
      return null;
    }
  },

  // ============================================================
  // FONDS D'ECRAN (ADMIN)
  // ============================================================
  
  async getAllBackgrounds(): Promise<PageBackground[]> {
    const response = await api.get("/pages/backgrounds/all");
    return response.data;
  },

  async getPageBackgroundForAdmin(page: string): Promise<PageBackground | null> {
    try {
      const response = await api.get(`/pages/backgrounds/admin/${page}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement fond d ecran admin:', error);
      return null;
    }
  },

  async updatePageBackground(page: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const response = await api.put(`/pages/backgrounds/${page}`, data);
    return response.data;
  },

  async updateBackgroundImage(page: string, imageUrl: string): Promise<PageBackground> {
    const response = await api.put(`/pages/backgrounds/${page}/image`, { image_url: imageUrl });
    return response.data;
  },

  async toggleBackground(page: string): Promise<PageBackground> {
    const response = await api.put(`/pages/backgrounds/${page}/toggle`);
    return response.data;
  },

  async deleteBackground(id: string): Promise<void> {
    await api.delete(`/pages/backgrounds/${id}`);
  },

  async initializePages(): Promise<void> {
    await api.post('/pages/initialize');
  },
};

export default pageService;