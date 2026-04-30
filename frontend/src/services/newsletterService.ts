// src/services/newsletterService.ts
import api from '@/lib/axios';

// ========================================
// TYPES COMPLETS
// ========================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: Date;
  isActive: boolean;
  preferences?: {
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

export interface SubscribeData {
  email: string;
  name?: string;
}

export interface UnsubscribeData {
  email: string;
}

export interface CampaignData {
  subject: string;
  content: string;
  scheduledFor?: Date;
}

// ========================================
// SERVICE NEWSLETTER
// ========================================

class NewsletterService {
  /**
   * S'abonner à la newsletter
   * @param email - Email de l'utilisateur
   * @param name - Nom optionnel
   */
  async subscribe(email: string, name?: string): Promise<{ message: string }> {
    try {
      const response = await api.post('/newsletter/subscribe', { email, name });
      return response.data;
    } catch (error: any) {
      console.error('Erreur abonnement:', error.response?.data?.message || error.message);
      throw error;
    }
  }
  
  /**
   * Se désabonner de la newsletter
   * @param email - Email à désabonner
   */
  async unsubscribe(email: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/newsletter/unsubscribe?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur désabonnement:', error.response?.data?.message || error.message);
      throw error;
    }
  }
  
  /**
   * Récupérer tous les abonnés (admin uniquement)
   */
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const response = await api.get('/newsletter/subscribers');
      return response.data;
    } catch (error: any) {
      console.error('Erreur chargement abonnés:', error.response?.data?.message || error.message);
      return [];
    }
  }
  
  /**
   * Compter le nombre d'abonnés
   */
  async countSubscribers(): Promise<number> {
    try {
      const response = await api.get('/newsletter/count');
      return response.data.count;
    } catch (error: any) {
      console.error('Erreur comptage abonnés:', error);
      return 0;
    }
  }
  
  /**
   * Vérifier si un email est abonné
   * @param email - Email à vérifier
   */
  async isSubscribed(email: string): Promise<boolean> {
    try {
      const response = await api.get(`/newsletter/check?email=${encodeURIComponent(email)}`);
      return response.data.isSubscribed;
    } catch (error) {
      return false;
    }
  }
  
  // ========================================
  // CAMPAGNES (Admin)
  // ========================================
  
  /**
   * Créer une nouvelle campagne
   * @param data - Données de la campagne
   */
  async createCampaign(data: CampaignData): Promise<NewsletterCampaign> {
    try {
      const response = await api.post('/newsletter/campaigns', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur création campagne:', error.response?.data?.message || error.message);
      throw error;
    }
  }
  
  /**
   * Envoyer une campagne immédiatement
   * @param campaignId - ID de la campagne
   */
  async sendCampaign(campaignId: string): Promise<{ message: string }> {
    try {
      const response = await api.post(`/newsletter/campaigns/${campaignId}/send`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur envoi campagne:', error);
      throw error;
    }
  }
  
  /**
   * Planifier l'envoi d'une campagne
   * @param campaignId - ID de la campagne
   * @param scheduledDate - Date d'envoi planifiée
   */
  async scheduleCampaign(campaignId: string, scheduledDate: Date): Promise<{ message: string }> {
    try {
      const response = await api.post(`/newsletter/campaigns/${campaignId}/schedule`, { scheduledDate });
      return response.data;
    } catch (error: any) {
      console.error('Erreur planification campagne:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer toutes les campagnes
   */
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const response = await api.get('/newsletter/campaigns');
      return response.data;
    } catch (error: any) {
      console.error('Erreur chargement campagnes:', error);
      return [];
    }
  }
  
  /**
   * Récupérer une campagne par ID
   * @param campaignId - ID de la campagne
   */
  async getCampaignById(campaignId: string): Promise<NewsletterCampaign | null> {
    try {
      const response = await api.get(`/newsletter/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Supprimer une campagne
   * @param campaignId - ID de la campagne
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      await api.delete(`/newsletter/campaigns/${campaignId}`);
    } catch (error: any) {
      console.error('Erreur suppression campagne:', error);
      throw error;
    }
  }
  
  // ========================================
  // TEMPLATES (Admin)
  // ========================================
  
  /**
   * Récupérer tous les templates de newsletter
   */
  async getTemplates(): Promise<any[]> {
    try {
      const response = await api.get('/newsletter/templates');
      return response.data;
    } catch (error: any) {
      console.error('Erreur chargement templates:', error);
      return [];
    }
  }
  
  /**
   * Créer un template
   * @param data - Données du template
   */
  async createTemplate(data: { name: string; subject: string; content: string }): Promise<any> {
    try {
      const response = await api.post('/newsletter/templates', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur création template:', error);
      throw error;
    }
  }
  
  /**
   * Récupérer un template par ID
   * @param templateId - ID du template
   */
  async getTemplateById(templateId: string): Promise<any | null> {
    try {
      const response = await api.get(`/newsletter/templates/${templateId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Supprimer un template
   * @param templateId - ID du template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await api.delete(`/newsletter/templates/${templateId}`);
    } catch (error: any) {
      console.error('Erreur suppression template:', error);
      throw error;
    }
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;