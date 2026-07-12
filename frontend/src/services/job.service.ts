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
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE',
  ALTERNANCE = 'ALTERNANCE',
  TEMPORARY = 'TEMPORARY'
}

export interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company: string;
  location?: string;
  contract_type: ContractType | string;
  deadline?: string;
  status: JobStatus | string;
  is_published: boolean;
  image_url?: string | null;
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
  diploma_url?: string;
  attestation_url?: string;
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
  diploma_url?: string;
  attestation_url?: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
  applied_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ============================================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE
// ============================================================

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
};

const buildImageUrl = (imageUrl?: string | null): string | undefined => {
  if (!imageUrl) return undefined;
  
  // Si l'URL est déjà complète
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  const baseUrl = getBaseUrl();
  
  // Nettoyer l'URL
  const cleanUrl = imageUrl.replace(/^\/+/, '');
  
  // Si l'URL commence par api/uploads
  if (cleanUrl.startsWith('api/uploads/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // Si l'URL commence par uploads
  if (cleanUrl.startsWith('uploads/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // Si l'URL commence par api/upload/file
  if (cleanUrl.startsWith('api/upload/file/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // Si l'URL commence par api/upload
  if (cleanUrl.startsWith('api/upload/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // Autre cas
  return `${baseUrl}/${cleanUrl}`;
};

// ============================================================
// SERVICE
// ============================================================

export const jobService = {
  // ============================================================
  // OFFRES D'EMPLOI - PUBLIQUES
  // ============================================================

  /**
   * Recupere les offres publiees
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
    
    // ✅ Enrichir les images avec l'URL complète
    const enrichedData = response.data.data.map((job: JobOffer) => ({
      ...job,
      image_url: buildImageUrl(job.image_url),
    }));
    
    return {
      ...response.data,
      data: enrichedData,
    };
  },

  /**
   * Recupere une offre publique par son ID
   */
  async getPublicOfferById(id: string): Promise<JobOffer> {
    const response = await api.get(`/jobs/offers/public/${id}`);
    return {
      ...response.data,
      image_url: buildImageUrl(response.data.image_url),
    };
  },

  /**
   * Recupere les offres en vedette
   */
  async getFeaturedOffers(limit: number = 3): Promise<JobOffer[]> {
    const response = await api.get(`/jobs/offers/featured?limit=${limit}`);
    return response.data.map((job: JobOffer) => ({
      ...job,
      image_url: buildImageUrl(job.image_url),
    }));
  },

  // ============================================================
  // OFFRES D'EMPLOI - ADMIN
  // ============================================================

  /**
   * Recupere toutes les offres (admin)
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
    
    // ✅ Enrichir les images avec l'URL complète
    const enrichedData = response.data.data.map((job: JobOffer) => ({
      ...job,
      image_url: buildImageUrl(job.image_url),
    }));
    
    return {
      ...response.data,
      data: enrichedData,
    };
  },

  /**
   * Recupere une offre par son ID (admin)
   */
  async getOfferById(id: string): Promise<JobOffer> {
    const response = await api.get(`/jobs/offers/${id}`);
    return {
      ...response.data,
      image_url: buildImageUrl(response.data.image_url),
    };
  },

  /**
   * Cree une nouvelle offre
   */
  async createOffer(data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.post('/jobs/offers', data);
    return {
      ...response.data,
      image_url: buildImageUrl(response.data.image_url),
    };
  },

  /**
   * Met a jour une offre
   */
  async updateOffer(id: string, data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.put(`/jobs/offers/${id}`, data);
    return {
      ...response.data,
      image_url: buildImageUrl(response.data.image_url),
    };
  },

  /**
   * Met a jour le statut d'une offre
   */
  async updateOfferStatus(id: string, status: JobStatus | string): Promise<JobOffer> {
    const response = await api.patch(`/jobs/offers/${id}/status`, { status });
    return {
      ...response.data,
      image_url: buildImageUrl(response.data.image_url),
    };
  },

  /**
   * Supprime une offre
   */
  async deleteOffer(id: string): Promise<void> {
    await api.delete(`/jobs/offers/${id}`);
  },

  /**
   * Recupere les statistiques des offres
   */
  async getJobStats(): Promise<JobOfferStats> {
    const response = await api.get('/jobs/offers/stats');
    return response.data;
  },

  // ============================================================
  // CANDIDATURES
  // ============================================================

  /**
   * Postule a une offre
   */
  async apply(data: CreateJobApplicationDto): Promise<JobApplication> {
    const response = await api.post('/jobs/applications', data);
    return response.data;
  },

  /**
   * Verifie si l'utilisateur a deja postule a une offre
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
   * Recupere les candidatures de l'utilisateur
   */
  async getMyApplications(): Promise<JobApplication[]> {
    const response = await api.get('/jobs/applications/my');
    return response.data;
  },

  /**
   * Recupere toutes les candidatures (admin)
   */
  async getAllApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    job_offer_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.job_offer_id) queryParams.append('job_offer_id', params.job_offer_id);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/jobs/applications?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Recupere les candidatures pour une offre specifique (admin)
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

    const response = await api.get(`/jobs/offers/${jobId}/applications?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Met a jour le statut d'une candidature (admin)
   */
  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication> {
    const response = await api.patch(`/jobs/applications/${id}/status`, { status, notes });
    return response.data;
  },

  /**
   * Supprime une candidature (admin)
   */
  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/jobs/applications/${id}`);
  },

  /**
   * Recupere une candidature par son ID
   */
  async getApplicationById(id: string): Promise<JobApplication> {
    const response = await api.get(`/jobs/applications/${id}`);
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
};

export default jobService;