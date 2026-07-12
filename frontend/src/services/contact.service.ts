// frontend/src/services/contact.service.ts
import api from '@/lib/axios';
import {
  ContactMessage,
  ContactStats,
  CreateContactDto,
  UpdateContactStatusDto,
  ReplyContactDto,
  PaginatedMessagesResponse,
  ApiResponse,
} from '@/types/contact';

export type ContactStatus = 'unread' | 'read' | 'replied' | 'archived';

/**
 * Service de gestion des messages de contact
 * Plateforme Y-MaD - Young for Madagascar Development
 */
export const contactService = {
  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  /**
   * Envoie un message de contact (public)
   * POST /api/contact
   */
  async sendMessage(data: CreateContactDto): Promise<ApiResponse<ContactMessage>> {
    const response = await api.post('/contact', data);
    return response.data;
  },

  // ============================================================
  // ROUTES ADMIN - RÉCUPÉRATION
  // ============================================================

  /**
   * Récupère tous les messages (admin) avec pagination et filtres
   * GET /api/contact
   */
  async getAllMessages(params?: {
    page?: number;
    limit?: number;
    status?: ContactStatus | string;
    search?: string;
  }): Promise<PaginatedMessagesResponse> {
    const response = await api.get('/contact', { params });
    return response.data;
  },

  /**
   * Récupère un message par son ID (admin)
   * GET /api/contact/:id
   */
  async getMessageById(id: string): Promise<ContactMessage> {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  },

  /**
   * Récupère les statistiques des messages (admin)
   * GET /api/contact/stats
   */
  async getStats(): Promise<ContactStats> {
    const response = await api.get('/contact/stats');
    return response.data;
  },

  /**
   * Récupère les statistiques de performance (admin)
   * GET /api/contact/performance/stats
   */
  async getPerformanceStats(): Promise<{
    averageResponseTime: number;
    responseRate: number;
    messagesPerDay: number;
  }> {
    const response = await api.get('/contact/performance/stats');
    return response.data;
  },

  // ============================================================
  // ROUTES ADMIN - MISE À JOUR
  // ============================================================

  /**
   * Met à jour le statut d'un message (admin)
   * PATCH /api/contact/:id/status
   */
  async updateStatus(
    id: string,
    data: UpdateContactStatusDto
  ): Promise<ContactMessage> {
    const response = await api.patch(`/contact/${id}/status`, data);
    return response.data;
  },

  /**
   * Marque un message comme lu (admin)
   */
  async markAsRead(id: string): Promise<ContactMessage> {
    return this.updateStatus(id, { status: 'read' });
  },

  /**
   * Marque un message comme répondu (admin)
   */
  async markAsReplied(id: string): Promise<ContactMessage> {
    return this.updateStatus(id, { status: 'replied' });
  },

  /**
   * Archive un message (admin)
   */
  async archiveMessage(id: string): Promise<ContactMessage> {
    return this.updateStatus(id, { status: 'archived' });
  },

  /**
   * Restaure un message archivé (admin)
   */
  async restoreMessage(id: string): Promise<ContactMessage> {
    return this.updateStatus(id, { status: 'unread' });
  },

  /**
   * Répond à un message par email (admin)
   * POST /api/contact/:id/reply
   */
  async replyToMessage(
    id: string,
    data: ReplyContactDto
  ): Promise<ApiResponse<ContactMessage>> {
    const response = await api.post(`/contact/${id}/reply`, data);
    return response.data;
  },

  // ============================================================
  // ROUTES ADMIN - SUPPRESSION
  // ============================================================

  /**
   * Supprime un message (admin)
   * DELETE /api/contact/:id
   */
  async deleteMessage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },

  /**
   * Supprime plusieurs messages (admin)
   * POST /api/contact/delete-multiple
   */
  async deleteMultiple(ids: string[]): Promise<{ deleted: number }> {
    const response = await api.post('/contact/delete-multiple', { ids });
    return response.data;
  },

  /**
   * Archive plusieurs messages (admin)
   * POST /api/contact/archive-multiple
   */
  async archiveMultiple(ids: string[]): Promise<{ archived: number }> {
    const response = await api.post('/contact/archive-multiple', { ids });
    return response.data;
  },

  // ============================================================
  // ROUTES ADMIN - EXPORT & RECHERCHE
  // ============================================================

  /**
   * Exporte les messages en CSV (admin)
   * GET /api/contact/export
   */
  async exportMessages(status?: ContactStatus | string): Promise<Blob> {
    const params: any = {};
    if (status && status !== 'all') {
      params.status = status;
    }
    const response = await api.get('/contact/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Recherche des messages (admin)
   * GET /api/contact/search
   */
  async searchMessages(query: string): Promise<ContactMessage[]> {
    const response = await api.get('/contact/search', { params: { query } });
    return response.data;
  },

  // ============================================================
  // MÉTHODES UTILITAIRES (SYNCHRONES - TOUJOURS UN RETURN)
  // ============================================================

  /**
   * Obtient le libellé du statut
   */
  getStatusLabel(status: ContactStatus | string, language: 'fr' | 'mg' = 'fr'): string {
    const labels = {
      fr: {
        unread: 'Non lu',
        read: 'Lu',
        replied: 'Répondu',
        archived: 'Archivé',
      },
      mg: {
        unread: 'Tsy mbola vakina',
        read: 'Vakina',
        replied: 'Valiny',
        archived: 'Voatahiry',
      },
    };
    const validStatus = status as ContactStatus;
    return labels[language]?.[validStatus] || String(status);
  },

  /**
   * Obtient la couleur du statut pour l'affichage
   */
  getStatusColor(status: ContactStatus | string): string {
    const colors = {
      unread: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      read: 'bg-blue-100 text-blue-800 border-blue-200',
      replied: 'bg-green-100 text-green-800 border-green-200',
      archived: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    const validStatus = status as ContactStatus;
    return colors[validStatus] || 'bg-gray-100 text-gray-600';
  },

  /**
   * Extrait un résumé du message
   */
  getMessageSummary(message: string, maxLength: number = 100): string {
    if (!message) {
      return '';
    }
    const clean = message.replace(/<[^>]*>/g, '');
    if (clean.length <= maxLength) {
      return clean;
    }
    return clean.substring(0, maxLength) + '...';
  },

  /**
   * Formate la date
   */
  formatDate(date: string | Date, locale: string = 'fr-FR'): string {
    if (!date) {
      return '';
    }
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) {
        return String(date);
      }
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(date);
    }
  },

  /**
   * Vérifie si un message est non lu
   */
  isUnread(message: ContactMessage): boolean {
    return message.status === 'unread';
  },

  /**
   * Vérifie si un message est lu
   */
  isRead(message: ContactMessage): boolean {
    return message.status === 'read' || message.status === 'replied';
  },

  /**
   * Vérifie si un message est répondu
   */
  isReplied(message: ContactMessage): boolean {
    return message.status === 'replied';
  },

  /**
   * Vérifie si un message est archivé
   */
  isArchived(message: ContactMessage): boolean {
    return message.status === 'archived';
  },

  /**
   * Vérifie si un statut est valide
   */
  isValidStatus(status: string): status is ContactStatus {
    return ['unread', 'read', 'replied', 'archived'].includes(status);
  },

  /**
   * Convertit une chaîne en statut valide
   */
  toValidStatus(status: string): ContactStatus {
    if (this.isValidStatus(status)) {
      return status;
    }
    return 'unread';
  },
};

export default contactService;