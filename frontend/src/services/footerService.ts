import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface FooterLink {
  id: string;
  title: string;
  title_mg?: string;
  url: string;
  order: number;
}

export interface FooterSection {
  id: string;
  title: string;
  title_mg?: string;
  order: number;
  links: FooterLink[];
}

export interface FooterContact {
  id: string;
  type: 'address' | 'phone' | 'email' | 'badge';
  value: string;
  icon: IconDefinition;  // ✅ Changé de 'string' à 'IconDefinition'
  order: number;
}

export interface FooterLegalLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

export interface FooterData {
  sections: FooterSection[];
  contactInfo: FooterContact[];
  legalLinks: FooterLegalLink[];
  copyright: string;
}

class FooterService {
  async getFooterData(): Promise<FooterData> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const response = await fetch(`${API_URL}/footer`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du footer');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur footerService:', error);
      // Retourner des données par défaut
      return {
        sections: [],
        contactInfo: [],
        legalLinks: [],
        copyright: `© ${new Date().getFullYear()} Y-Mad. Tous droits réservés.`,
      };
    }
  }
}

export const footerService = new FooterService();