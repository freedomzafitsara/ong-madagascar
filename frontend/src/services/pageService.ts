// frontend/src/services/pageService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

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
// VALEURS PAR DÉFAUT - EXPORTÉES
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
  { value: 'about', label: 'À propos', label_mg: 'Momba anay', icon: 'Info' },
  { value: 'projects', label: 'Projets', label_mg: 'Tetikasa', icon: 'FolderOpen' },
  { value: 'jobs', label: 'Offres d\'emploi', label_mg: 'Asa', icon: 'Briefcase' },
  { value: 'events', label: 'Événements', label_mg: 'Hetsika', icon: 'Calendar' },
  { value: 'blog', label: 'Blog', label_mg: 'Bitsika', icon: 'Newspaper' },
  { value: 'contact', label: 'Contact', label_mg: 'Fifandraisana', icon: 'Mail' },
  { value: 'donate', label: 'Faire un don', label_mg: 'Hanome', icon: 'Heart' },
  { value: 'join', label: 'Adhérer', label_mg: 'Hanara-maso', icon: 'UserPlus' },
  { value: 'volunteers', label: 'Bénévoles', label_mg: 'Mpanao asa soa', icon: 'Users' },
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

  /**
   * Récupère toutes les pages (admin uniquement)
   */
  async getAll(token: string): Promise<PageContent[]> {
    const response = await fetch(`${API_URL}/api/pages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement des pages');
    return response.json();
  },

  /**
   * Récupère le contenu public d'une page (sans authentification)
   */
  async getPublic(page: string): Promise<PageContent | null> {
    try {
      const response = await fetch(`${API_URL}/api/pages/public/${page}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error(`Erreur chargement page ${page}:`, error);
      return null;
    }
  },

  /**
   * Récupère une page pour l'administration (avec token)
   */
  async getForAdmin(page: string, token: string): Promise<PageContent> {
    const response = await fetch(`${API_URL}/api/pages/${page}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement de la page');
    return response.json();
  },

  /**
   * Met à jour le contenu d'une page
   */
  async update(page: string, token: string, data: Partial<PageContent>): Promise<PageContent> {
    const updateData = {
      ...data,
      hero: { ...defaultHero, ...data.hero },
      cta: { ...defaultCta, ...data.cta },
      sections: data.sections || [],
      stats: data.stats || [],
    };
    
    const response = await fetch(`${API_URL}/api/pages/${page}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Erreur mise à jour de la page');
    return response.json();
  },

  // ==========================================
  // FONDS D'ÉCRAN
  // ==========================================

  /**
   * Récupère tous les fonds d'écran (admin uniquement)
   */
  async getAllBackgrounds(token: string): Promise<PageBackground[]> {
    const response = await fetch(`${API_URL}/api/pages/backgrounds/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur chargement des fonds d\'écran');
    return response.json();
  },

  /**
   * Récupère le fond d'écran d'une page (public)
   */
  async getBackground(page: string): Promise<PageBackground | null> {
    try {
      const response = await fetch(`${API_URL}/api/pages/backgrounds/${page}`);
      if (!response.ok) return null;
      const data = await response.json();
      
      // S'assurer que les propriétés optionnelles existent
      return {
        ...data,
        mobile_url: data.mobile_url || '',
        thumbnail_url: data.thumbnail_url || '',
        alt_text: data.alt_text || '',
      };
    } catch (error) {
      console.error(`Erreur chargement fond d'écran ${page}:`, error);
      return null;
    }
  },

  /**
   * Met à jour le fond d'écran d'une page
   */
  async updateBackground(page: string, token: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const updateData = { 
      ...defaultBackground, 
      ...data, 
      page,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/api/pages/backgrounds/${page}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Erreur mise à jour du fond d\'écran');
    return response.json();
  },

  /**
   * Supprime un fond d'écran par son ID
   */
  async deleteBackground(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/pages/backgrounds/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur suppression du fond d\'écran');
  },

  /**
   * Crée un nouveau fond d'écran
   */
  async createBackground(token: string, data: Partial<PageBackground>): Promise<PageBackground> {
    const createData = { 
      ...defaultBackground, 
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/api/pages/backgrounds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(createData),
    });
    if (!response.ok) throw new Error('Erreur création du fond d\'écran');
    return response.json();
  },

  // ==========================================
  // INITIALISATION
  // ==========================================

  /**
   * Initialise les pages par défaut (admin uniquement)
   */
  async initializePages(token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/pages/initialize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur initialisation des pages');
  },
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default pageService;