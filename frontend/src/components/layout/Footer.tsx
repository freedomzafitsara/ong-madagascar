// frontend/src/services/footerService.ts
import api from './api';

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  order: number;
  isActive: boolean;
  category: 'quick_links' | 'social_links' | 'contact';
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface ContactInfo {
  id: string;
  type: 'email' | 'phone' | 'address';
  value: string;
  label: string;
  isActive: boolean;
}

export const footerService = {
  // Récupérer tous les liens
  getQuickLinks: async (): Promise<FooterLink[]> => {
    const response = await api.get('/footer/quick-links');
    return response.data;
  },

  getSocialLinks: async (): Promise<SocialLink[]> => {
    const response = await api.get('/footer/social-links');
    return response.data;
  },

  getContactInfo: async (): Promise<ContactInfo[]> => {
    const response = await api.get('/footer/contact-info');
    return response.data;
  },

  // Admin: Gérer les liens
  createLink: async (data: Partial<FooterLink>): Promise<FooterLink> => {
    const response = await api.post('/footer/links', data);
    return response.data;
  },

  updateLink: async (id: string, data: Partial<FooterLink>): Promise<FooterLink> => {
    const response = await api.put(`/footer/links/${id}`, data);
    return response.data;
  },

  deleteLink: async (id: string): Promise<void> => {
    await api.delete(`/footer/links/${id}`);
  },

  updateOrder: async (links: { id: string; order: number }[]): Promise<void> => {
    await api.put('/footer/links/order', { links });
  },
};