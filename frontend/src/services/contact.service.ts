// src/services/contact.service.ts
import api from "./api";

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

export const contactService = {
  // Envoyer un message (public)
  async sendMessage(data: CreateContactDto): Promise<ContactMessage> {
    const response = await api.post("/contact", data);
    return response.data;
  },

  // Récupérer tous les messages (admin)
  async getAllMessages(params?: {
    page?: number;
    limit?: number;
    is_read?: boolean;
  }): Promise<{ data: ContactMessage[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/contact", { params });
    return response.data;
  },

  // Marquer un message comme lu (admin)
  async markAsRead(id: string): Promise<ContactMessage> {
    const response = await api.patch(`/contact/${id}/read`);
    return response.data;
  },

  // Supprimer un message (admin)
  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/contact/${id}`);
  },

  // Compter les messages non lus (admin)
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get("/contact/unread/count");
    return response.data;
  },
};

export default contactService;
