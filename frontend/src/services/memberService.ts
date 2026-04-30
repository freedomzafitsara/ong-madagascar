// src/services/memberService.ts
import api from '@/lib/axios';

export interface Member {
  id: string;
  userId: string;
  memberNumber: string;
  membershipType: string;
  status: string;
  endDate: string;
  createdAt: string;
}

export const memberService = {
  async getAll(): Promise<Member[]> {
    const response = await api.get('/members');
    return response.data;
  },

  async getByUser(userId: string): Promise<Member[]> {
    const response = await api.get(`/members/user/${userId}`);
    return response.data;
  },

  async generateCard(userId: string): Promise<Member> {
    const response = await api.post(`/members/generate/${userId}`);
    return response.data;
  },

  async renew(id: string): Promise<Member> {
    const response = await api.post(`/members/renew/${id}`);
    return response.data;
  },
};