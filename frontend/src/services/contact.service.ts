// src/services/contact.service.ts
import api from '@/lib/axios';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateContactDto {
  name: string;
  email: string;
  message: string;
}

export interface PaginatedMessagesResponse {
  data: ContactMessage[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const contactService = {
  /**
   * Envoie un message de contact (public)
   */
  async sendMessage(data: CreateContactDto): Promise<ContactMessage> {
    const response = await api.post("/contact", data);
    return response.data;
  },

  /**
   * Récupère tous les messages (admin) avec pagination
   */
  async getAllMessages(params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
  }): Promise<PaginatedMessagesResponse> {
    const response = await api.get("/contact", { params });
    return response.data;
  },

  /**
   * Marque un message comme lu (admin)
   */
  async markAsRead(id: string): Promise<ContactMessage> {
    const response = await api.patch(`/contact/${id}/read`);
    return response.data;
  },

  /**
   * Supprime un message (admin)
   */
  async deleteMessage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },

  /**
   * Compte les messages non lus (admin)
   */
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get("/contact/unread/count");
    return response.data;
  },
};

export default contactService;