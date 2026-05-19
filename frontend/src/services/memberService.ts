// frontend/src/services/memberService.ts
// VERSION CORRIGEE - COMPLETE ET FONCTIONNELLE

import api from '@/lib/axios';

// ============================================================
// TYPES
// ============================================================

export interface MemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
}

export interface Member {
  id: string;
  userId: string;
  memberNumber: string;
  membershipType: string;
  status: string;
  amountPaid: number;
  startDate: string;
  expiryDate: string;
  endDate?: string;
  paymentMethod: string;
  cardUrl: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  user?: MemberUser;
}

export interface MemberStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  totalRevenue: number;
}

export interface CreateMemberData {
  membershipType: 'standard' | 'premium' | 'student' | 'honorary';
  paymentMethod?: 'mvola' | 'orange_money' | 'airtel' | 'bank';
  phoneNumber?: string;
  userId?: string;
}

export interface UpdateMemberStatusData {
  status: 'pending' | 'active' | 'expired' | 'suspended';
}

export interface PaginatedMembersResponse {
  data: Member[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ============================================================
// SERVICE
// ============================================================

export const memberService = {
  /**
   * Recuperer tous les membres (pagine)
   */
  async getAll(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedMembersResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await api.get('/members', { params });
    return response.data;
  },

  /**
   * Recuperer tous les membres sans pagination (pour export)
   */
  async getAllMembers(): Promise<Member[]> {
    const response = await api.get('/members');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  /**
   * Recuperer l'adhesion de l'utilisateur connecte
   */
  async getMyMembership(): Promise<Member | null> {
    try {
      const response = await api.get('/members/me');
      return response.data;
    } catch (error) {
      console.error('Erreur getMyMembership:', error);
      return null;
    }
  },

  /**
   * Recuperer un membre par son ID (admin seulement)
   */
  async getById(id: string): Promise<Member> {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  /**
   * Recuperer les membres par utilisateur (admin seulement)
   */
  async getByUserId(userId: string): Promise<Member[]> {
    const response = await api.get(`/members/user/${userId}`);
    return response.data;
  },

  /**
   * Creer une nouvelle adhesion
   */
  async create(data: CreateMemberData): Promise<Member> {
    const response = await api.post('/members', data);
    return response.data;
  },

  /**
   * Mettre a jour le statut d'un membre
   */
  async updateStatus(id: string, status: string): Promise<Member> {
    const response = await api.put(`/members/${id}/status`, { status });
    return response.data;
  },

  /**
   * Recuperer les statistiques des membres
   */
  async getStats(): Promise<MemberStats> {
    const response = await api.get('/members/stats/all');
    return response.data;
  },

  /**
   * Generer la carte membre (PDF avec QR code)
   */
  async generateCard(memberNumber: string): Promise<{ cardUrl: string; memberNumber: string }> {
    const response = await api.get(`/members/card/${memberNumber}`);
    return response.data;
  },

  /**
   * Supprimer une adhesion (admin seulement)
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  /**
   * Renouveler une adhesion
   */
  async renew(id: string, data?: Partial<CreateMemberData>): Promise<Member> {
    const response = await api.post(`/members/renew/${id}`, data || {});
    return response.data;
  },

  /**
   * Exporter les membres en CSV
   */
  async exportToCSV(): Promise<Blob> {
    const response = await api.get('/members/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default memberService;