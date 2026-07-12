// frontend/src/services/email.service.ts

import api from '@/lib/api';

export interface ApplicationEmailData {
  to: string;
  firstName: string;
  jobTitle: string;
  status: 'accepted' | 'rejected' | 'shortlisted' | 'reviewing';
  message?: string;
  companyName?: string;
  location?: string;
  contractType?: string;
}

export const emailService = {
  async sendApplicationStatus(data: ApplicationEmailData): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await api.post('/email/application-status', data);
      return response.data;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  },
};

export default emailService;