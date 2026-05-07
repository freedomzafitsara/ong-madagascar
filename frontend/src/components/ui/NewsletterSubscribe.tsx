// src/services/newsletterService.ts
import axios from 'axios';

// Configuration de base axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token d'authentification si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  isActive: boolean;
  preferences: {
    categories: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
  };
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  sentAt?: Date;
  status: 'draft' | 'sent' | 'scheduled';
  scheduledFor?: Date;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
  };
}

export const newsletterService = {
  // Abonnement
  async subscribe(email: string, name?: string, preferences?: any): Promise<void> {
    try {
      const response = await api.post('/newsletter/subscribe', { email, name, preferences });
      return response.data;
    } catch (error) {
      console.error('Erreur subscription:', error);
      throw error;
    }
  },
  
  // Désabonnement
  async unsubscribe(email: string): Promise<void> {
    try {
      const response = await api.post('/newsletter/unsubscribe', { email });
      return response.data;
    } catch (error) {
      console.error('Erreur unsubscription:', error);
      throw error;
    }
  },
  
  // Récupérer tous les abonnés
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const response = await api.get('/newsletter/subscribers');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement abonnés:', error);
      return [];
    }
  },
  
  // Créer une campagne
  async createCampaign(data: Partial<NewsletterCampaign>): Promise<NewsletterCampaign> {
    try {
      const response = await api.post('/newsletter/campaigns', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création campagne:', error);
      throw error;
    }
  },
  
  // Envoyer une campagne
  async sendCampaign(campaignId: string): Promise<void> {
    try {
      const response = await api.post(`/newsletter/campaigns/${campaignId}/send`);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi campagne:', error);
      throw error;
    }
  },
  
  // Récupérer toutes les campagnes
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const response = await api.get('/newsletter/campaigns');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
      return [];
    }
  },
  
  // Récupérer les templates
  async getTemplates(): Promise<any[]> {
    try {
      const response = await api.get('/newsletter/templates');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      return [];
    }
  }
};

export default newsletterService;