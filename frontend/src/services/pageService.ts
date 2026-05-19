// frontend/src/services/pageService.ts
// VERSION CORRIGEE - SUPPRESSION DU DOUBLE /api

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ============================================
// INTERFACES
// ============================================

export interface HeroSection {
  title: string;
  title_mg: string;
  subtitle: string;
  subtitle_mg: string;
  badge: string;
  badge_mg: string;
  buttonText: string;
  buttonText_mg: string;
  buttonLink: string;
  imageUrl: string;
  videoUrl: string;
}

export interface PageSection {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  imageUrl: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface PageStat {
  value: string;
  label: string;
  label_mg: string;
  icon: string;
}

export interface CtaSection {
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  buttonText: string;
  buttonText_mg: string;
  buttonLink: string;
  imageUrl: string;
}

export interface PageContent {
  id: string;
  page: string;
  hero: HeroSection;
  sections: PageSection[];
  stats: PageStat[];
  cta: CtaSection;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  is_published: boolean;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PageBackground {
  id: string;
  page: string;
  image_url: string;
  mobile_url: string;
  thumbnail_url: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  alt_text: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// VALEURS PAR DEFAUT - EXPORTEES
// ============================================

export const defaultHero: HeroSection = {
  title: '',
  title_mg: '',
  subtitle: '',
  subtitle_mg: '',
  badge: '',
  badge_mg: '',
  buttonText: '',
  buttonText_mg: '',
  buttonLink: '',
  imageUrl: '',
  videoUrl: '',
};

export const defaultSection: PageSection = {
  id: '',
  title: '',
  title_mg: '',
  description: '',
  description_mg: '',
  imageUrl: '',
  icon: '',
  order: 0,
  isActive: true,
};

export const defaultCta: CtaSection = {
  title: '',
  title_mg: '',
  description: '',
  description_mg: '',
  buttonText: '',
  buttonText_mg: '',
  buttonLink: '',
  imageUrl: '',
};

export const defaultBackground: Omit<PageBackground, 'id' | 'created_at' | 'updated_at'> = {
  page: '',
  image_url: '',
  mobile_url: '',
  thumbnail_url: '',
  is_active: false,
  overlay_opacity: 30,
  position: 'center',
  size: 'cover',
  alt_text: '',
};

export const defaultPageContent: Omit<PageContent, 'id' | 'created_at' | 'updated_at'> = {
  page: '',
  hero: { ...defaultHero },
  sections: [],
  stats: [],
  cta: { ...defaultCta },
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  is_published: true,
  custom_fields: {},
};

// ============================================
// LISTE DES PAGES
// ============================================

export const pageIcons: Record<string, string> = {
  home: 'Home',
  about: 'Info',
  projects: 'FolderOpen',
  jobs: 'Briefcase',
  events: 'Calendar',
  blog: 'Newspaper',
  contact: 'Mail',
  donate: 'Heart',
  join: 'UserPlus',
  volunteers: 'Users',
  partners: 'Handshake',
};

export const pagesList = [
  { value: 'home', label: 'Accueil', label_mg: 'Fandraisana', icon: 'Home' },
  { value: 'about', label: 'A propos', label_mg: 'Momba anay', icon: 'Info' },
  { value: 'projects', label: 'Projets', label_mg: 'Tetikasa', icon: 'FolderOpen' },
  { value: 'jobs', label: 'Offres d\'emploi', label_mg: 'Asa', icon: 'Briefcase' },
  { value: 'events', label: 'Evenements', label_mg: 'Hetsika', icon: 'Calendar' },
  { value: 'blog', label: 'Blog', label_mg: 'Bitsika', icon: 'Newspaper' },
  { value: 'contact', label: 'Contact', label_mg: 'Fifandraisana', icon: 'Mail' },
  { value: 'donate', label: 'Faire un don', label_mg: 'Hanome', icon: 'Heart' },
  { value: 'join', label: 'Adherer', label_mg: 'Hanara-maso', icon: 'UserPlus' },
  { value: 'volunteers', label: 'Benevoles', label_mg: 'Mpanao asa soa', icon: 'Users' },
  { value: 'partners', label: 'Partenaires', label_mg: 'Mpiara-miasa', icon: 'Handshake' },
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

export function getPageIcon(pageValue: string): string {
  return pageIcons[pageValue] || 'FileText';
}

export function getPageLabel(pageValue: string, language: 'fr' | 'mg'): string {
  const found = pagesList.find(p => p.value === pageValue);
  if (!found) return pageValue;
  return language === 'fr' ? found.label : found.label_mg;
}

// ============================================
// SERVICE API
// ============================================

export const pageService = {
  // ==========================================
  // CONTENU DES PAGES
  // ==========================================

  async getAll(token: string): Promise<PageContent[]> {
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement des pages');
    return response.json();
  },

  async getPublic(page: string): Promise<PageContent | null> {
    try {
      // CORRECTION: API_URL contient deja /api
      const response = await fetch(`${API_URL}/pages/public/${page}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error(`Erreur chargement page ${page}:`, error);
      return null;
    }
  },

  async getForAdmin(page: string, token: string): Promise<PageContent> {
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages/${page}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement de la page');
    return response.json();
  },

  async update(page: string, token: string, data: Partial<PageContent>): Promise<PageContent> {
    const updateData = {
      ...data,
      hero: { ...defaultHero, ...data.hero },
      cta: { ...defaultCta, ...data.cta },
      sections: data.sections || [],
      stats: data.stats || [],
    };
    
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages/${page}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Erreur mise a jour de la page');
    return response.json();
  },

  // ==========================================
  // FONDS D'ECRAN
  // ==========================================

  async getAllBackgrounds(token: string): Promise<PageBackground[]> {
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages/backgrounds/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement des fonds d\'ecran');
    return response.json();
  },

  async getBackground(page: string): Promise<PageBackground | null> {
    try {
      // CORRECTION: API_URL contient deja /api (PLUS DE DOUBLE /api)
      const response = await fetch(`${API_URL}/pages/backgrounds/${page}`);
      if (!response.ok) return null;
      const data = await response.json();
      
      return {
        ...data,
        mobile_url: data.mobile_url || '',
        thumbnail_url: data.thumbnail_url || '',
        alt_text: data.alt_text || '',
      };
    } catch (error) {
      console.error(`Erreur chargement fond d'ecran ${page}:`, error);
      return null;
    }
  },

  async updateBackground(page: string, token: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const updateData = { 
      ...defaultBackground, 
      ...data, 
      page,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // CORRECTION: API_URL contient deja /api (PLUS DE DOUBLE /api)
    const response = await fetch(`${API_URL}/pages/backgrounds/${page}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Erreur mise a jour du fond d\'ecran');
    return response.json();
  },

  async deleteBackground(id: string, token: string): Promise<void> {
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages/backgrounds/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur suppression du fond d\'ecran');
  },

  async createBackground(token: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const createData = { 
      ...defaultBackground, 
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages/backgrounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(createData),
    });
    if (!response.ok) throw new Error('Erreur creation du fond d\'ecran');
    return response.json();
  },

  async initializePages(token: string): Promise<void> {
    // CORRECTION: API_URL contient deja /api
    const response = await fetch(`${API_URL}/pages/initialize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur initialisation des pages');
  },
};

// ============================================
// EXPORT PAR DEFAUT
// ============================================

export default pageService;