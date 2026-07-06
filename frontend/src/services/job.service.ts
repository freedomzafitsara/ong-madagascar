// frontend/src/services/job.service.ts

import api from '@/lib/api';
import { uploadService } from './upload.service';

// ============================================================
// TYPES
// ============================================================

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived'
}

export enum ContractType {
  CDI = 'cdi',
  CDD = 'cdd',
  STAGE = 'stage',
  FREELANCE = 'freelance',
  ALTERNANCE = 'alternance',
  TEMPORARY = 'temporary'
}

export interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company: string;
  location?: string;
  contract_type: ContractType;
  deadline?: string;
  status: JobStatus;
  is_published: boolean;
  image_url?: string;
  main_image_id?: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface JobOfferStats {
  total: number;
  published: number;
  draft: number;
  closed: number;
  expired: number;
  archived: number;
  total_applications: number;
  pending_applications: number;
}

export interface CreateJobApplicationDto {
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  current_position?: string;
  current_company?: string;
  cv_url?: string;
  cover_letter?: string;
  cover_letter_url?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface JobApplication {
  id: string;
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  current_position?: string;
  current_company?: string;
  cv_url?: string;
  cover_letter?: string;
  cover_letter_url?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ============================================================
// SERVICE
// ============================================================

export const jobService = {
  // ============================================================
  // OFFRES D'EMPLOI - PUBLIQUES
  // ============================================================

  /**
   * Récupère les offres publiées
   */
  async getPublishedOffers(params?: {
    page?: number;
    limit?: number;
    contract_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobOffer>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.contract_type) queryParams.append('contract_type', params.contract_type);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/jobs/offers/public?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Récupère une offre publique par son ID
   */
  async getPublicOfferById(id: string): Promise<JobOffer> {
    const response = await api.get(`/jobs/offers/public/${id}`);
    return response.data;
  },

  /**
   * Récupère les offres en vedette
   */
  async getFeaturedOffers(limit: number = 3): Promise<JobOffer[]> {
    const response = await api.get(`/jobs/offers/featured?limit=${limit}`);
    return response.data;
  },

  // ============================================================
  // OFFRES D'EMPLOI - ADMIN
  // ============================================================

  /**
   * Récupère toutes les offres (admin)
   */
  async getAllOffers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    contract_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobOffer>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.contract_type) queryParams.append('contract_type', params.contract_type);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/jobs/offers?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Récupère une offre par son ID (admin)
   */
  async getOfferById(id: string): Promise<JobOffer> {
    const response = await api.get(`/jobs/offers/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle offre
   */
  async createOffer(data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.post('/jobs/offers', data);
    return response.data;
  },

  /**
   * Met à jour une offre
   */
  async updateOffer(id: string, data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.put(`/jobs/offers/${id}`, data);
    return response.data;
  },

  /**
   * Met à jour le statut d'une offre
   */
  async updateOfferStatus(id: string, status: JobStatus): Promise<JobOffer> {
    const response = await api.patch(`/jobs/offers/${id}/status`, { status });
    return response.data;
  },

  /**
   * Supprime une offre
   */
  async deleteOffer(id: string): Promise<void> {
    await api.delete(`/jobs/offers/${id}`);
  },

  /**
   * Récupère les statistiques des offres
   */
  async getJobStats(): Promise<JobOfferStats> {
    const response = await api.get('/jobs/offers/stats');
    return response.data;
  },

  // ============================================================
  // CANDIDATURES
  // ============================================================

  /**
   * Postule à une offre
   */
  async apply(data: CreateJobApplicationDto): Promise<JobApplication> {
    const response = await api.post('/jobs/applications', data);
    return response.data;
  },

  /**
   * ✅ Vérifie si l'utilisateur a déjà postulé à une offre
   */
  async checkApplication(jobId: string): Promise<{ applied: boolean; application?: JobApplication }> {
    try {
      const response = await api.get(`/jobs/applications/check/${jobId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { applied: false };
      }
      throw error;
    }
  },

  /**
   * Récupère les candidatures de l'utilisateur
   */
  async getMyApplications(): Promise<JobApplication[]> {
    const response = await api.get('/jobs/applications/my');
    return response.data;
  },

  /**
   * Récupère les candidatures pour une offre (admin)
   */
  async getApplicationsForJob(jobId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/jobs/applications/job/${jobId}?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Met à jour le statut d'une candidature (admin)
   */
  async updateApplicationStatus(id: string, status: string): Promise<JobApplication> {
    const response = await api.patch(`/jobs/applications/${id}/status`, { status });
    return response.data;
  },

  /**
   * Exporte les candidatures en CSV
   */
  async exportApplications(jobId?: string): Promise<string> {
    const url = jobId ? `/jobs/applications/export?jobId=${jobId}` : '/jobs/applications/export';
    const response = await api.get(url, {
      responseType: 'text',
    });
    return response.data;
  },

  /**
   * Récupère une candidature par son ID
   */
  async getApplicationById(id: string): Promise<JobApplication> {
    const response = await api.get(`/jobs/applications/${id}`);
    return response.data;
  },
};

export default jobService;