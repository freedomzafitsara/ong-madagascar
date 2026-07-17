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

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
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
  status: ApplicationStatus | string;
  notes?: string;
  created_at: string;
  updated_at: string;
  applied_at?: string;
  jobOffer?: JobOffer;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
}

// ============================================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE
// ============================================================

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
};

const buildImageUrl = (imageUrl?: string | null): string | undefined => {
  if (!imageUrl) return undefined;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  const baseUrl = getBaseUrl();
  const cleanUrl = imageUrl.replace(/^\/+/, '');
  
  if (cleanUrl.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUrl)) {
    return `${baseUrl}/uploads/${cleanUrl}`;
  }
  
  if (cleanUrl.startsWith('api/uploads/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  if (cleanUrl.startsWith('uploads/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  if (cleanUrl.startsWith('api/upload/file/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  if (cleanUrl.startsWith('api/upload/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  return `${baseUrl}/${cleanUrl}`;
};

// ============================================================
// SERVICE - CORRIGÉ AVEC GESTION D'ERREUR
// ============================================================

export const jobService = {
  // ============================================================
  // OFFRES D'EMPLOI - PUBLIQUES
  // ============================================================

  async getPublishedOffers(params?: {
    page?: number;
    limit?: number;
    contract_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobOffer>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.contract_type) queryParams.append('contract_type', params.contract_type);
      if (params?.search) queryParams.append('search', params.search);

      const response = await api.get(`/jobs/offers/public?${queryParams.toString()}`);
      
      const enrichedData = (response.data?.data || []).map((job: JobOffer) => ({
        ...job,
        image_url: buildImageUrl(job.image_url),
      }));
      
      return {
        data: enrichedData,
        total: response.data?.total || 0,
        page: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        limit: response.data?.limit || 10,
      };
    } catch (error) {
      console.warn('Erreur getPublishedOffers:', error);
      return { data: [], total: 0, page: 1, totalPages: 1, limit: 10 };
    }
  },

  async getPublicOfferById(id: string): Promise<JobOffer> {
    try {
      const response = await api.get(`/jobs/offers/public/${id}`);
      return {
        ...response.data,
        image_url: buildImageUrl(response.data.image_url),
      };
    } catch (error) {
      console.warn('Erreur getPublicOfferById:', error);
      throw error;
    }
  },

  async getFeaturedOffers(limit: number = 3): Promise<JobOffer[]> {
    try {
      const response = await api.get(`/jobs/offers/featured?limit=${limit}`);
      return (response.data || []).map((job: JobOffer) => ({
        ...job,
        image_url: buildImageUrl(job.image_url),
      }));
    } catch (error) {
      console.warn('Erreur getFeaturedOffers:', error);
      return [];
    }
  },

  // ============================================================
  // OFFRES D'EMPLOI - ADMIN - CORRIGÉ AVEC GESTION 404
  // ============================================================

  async getAllOffers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    contract_type?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobOffer>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.status) queryParams.append('status', params.status);
      if (params?.contract_type) queryParams.append('contract_type', params.contract_type);
      if (params?.search) queryParams.append('search', params.search);

      const response = await api.get(`/jobs/offers?${queryParams.toString()}`);
      
      const enrichedData = (response.data?.data || []).map((job: JobOffer) => ({
        ...job,
        image_url: buildImageUrl(job.image_url),
      }));
      
      return {
        data: enrichedData,
        total: response.data?.total || 0,
        page: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        limit: response.data?.limit || 10,
      };
    } catch (error: any) {
      console.warn('Erreur getAllOffers:', error);
      return { data: [], total: 0, page: 1, totalPages: 1, limit: 10 };
    }
  },

  async getOfferById(id: string): Promise<JobOffer> {
    try {
      const response = await api.get(`/jobs/offers/${id}`);
      return {
        ...response.data,
        image_url: buildImageUrl(response.data.image_url),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Offre avec l'ID ${id} non trouvée`);
      }
      throw error;
    }
  },

  async createOffer(data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.post('/jobs/offers', data);
    return {
      ...response.data,
      image_url: buildImageUrl(response.data.image_url),
    };
  },

  async updateOffer(id: string, data: Partial<JobOffer>): Promise<JobOffer> {
    try {
      const response = await api.patch(`/jobs/offers/${id}`, data);
      return {
        ...response.data,
        image_url: buildImageUrl(response.data.image_url),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Offre avec l'ID ${id} non trouvée pour la mise à jour`);
      }
      throw error;
    }
  },

  async updateOfferStatus(id: string, status: JobStatus | string): Promise<JobOffer> {
    try {
      const response = await api.patch(`/jobs/offers/${id}/status`, { status });
      return {
        ...response.data,
        image_url: buildImageUrl(response.data.image_url),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Offre avec l'ID ${id} non trouvée pour le changement de statut`);
      }
      throw error;
    }
  },

  async deleteOffer(id: string): Promise<void> {
    try {
      await api.delete(`/jobs/offers/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Offre avec l'ID ${id} non trouvée pour la suppression`);
      }
      throw error;
    }
  },

  // ✅ CORRIGÉ: getJobStats avec fallback complet
  async getJobStats(): Promise<JobOfferStats> {
    try {
      const response = await api.get('/jobs/offers/stats');
      const data = response.data?.data || response.data || {};
      return {
        total: data.total || 0,
        published: data.published || 0,
        draft: data.draft || 0,
        closed: data.closed || 0,
        expired: data.expired || 0,
        archived: data.archived || 0,
        total_applications: data.total_applications || 0,
        pending_applications: data.pending_applications || 0,
      };
    } catch (error) {
      console.warn('Erreur getJobStats (fallback à 0):', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        closed: 0,
        expired: 0,
        archived: 0,
        total_applications: 0,
        pending_applications: 0,
      };
    }
  },

  // ============================================================
  // STATISTIQUES DES CANDIDATURES
  // ============================================================

  async getApplicationStats(jobId?: string): Promise<ApplicationStats> {
    try {
      const url = jobId ? `/jobs/applications/stats?jobId=${jobId}` : '/jobs/applications/stats';
      const response = await api.get(url);
      const data = response.data?.data || response.data || {};
      return {
        total: data.total || 0,
        pending: data.pending || data.submitted || 0,
        reviewing: data.reviewing || 0,
        shortlisted: data.shortlisted || 0,
        accepted: data.accepted || 0,
        rejected: data.rejected || 0,
      };
    } catch (error) {
      console.warn('Erreur getApplicationStats (fallback à 0):', error);
      return {
        total: 0,
        pending: 0,
        reviewing: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0,
      };
    }
  },

  // ============================================================
  // CANDIDATURES
  // ============================================================

  async apply(data: CreateJobApplicationDto): Promise<JobApplication> {
    try {
      const response = await api.post('/jobs/applications', data);
      return response.data;
    } catch (error) {
      console.error('Erreur apply:', error);
      throw error;
    }
  },

  async checkApplication(jobId: string): Promise<{ applied: boolean; application?: JobApplication }> {
    try {
      const response = await api.get(`/jobs/applications/check/${jobId}`);
      return response.data || { applied: false };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { applied: false };
      }
      console.warn('Erreur checkApplication:', error);
      return { applied: false };
    }
  },

  async getMyApplications(): Promise<JobApplication[]> {
    try {
      const response = await api.get('/jobs/applications/my');
      return response.data || [];
    } catch (error) {
      console.warn('Erreur getMyApplications:', error);
      return [];
    }
  },

  async getAllApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    job_offer_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.status) queryParams.append('status', params.status);
      if (params?.job_offer_id) queryParams.append('job_offer_id', params.job_offer_id);
      if (params?.search) queryParams.append('search', params.search);

      const response = await api.get(`/jobs/applications?${queryParams.toString()}`);
      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        limit: response.data?.limit || 10,
      };
    } catch (error) {
      console.warn('Erreur getAllApplications:', error);
      return { data: [], total: 0, page: 1, totalPages: 1, limit: 10 };
    }
  },

  async getApplicationsForJob(jobId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/jobs/offers/${jobId}/applications?${queryParams.toString()}`);
      return {
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        limit: response.data?.limit || 10,
      };
    } catch (error: any) {
      console.warn('Erreur getApplicationsForJob:', error);
      return { data: [], total: 0, page: 1, totalPages: 1, limit: params?.limit || 10 };
    }
  },

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication> {
    try {
      const response = await api.patch(`/jobs/applications/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Erreur updateApplicationStatus:', error);
      throw error;
    }
  },

  async deleteApplication(id: string): Promise<void> {
    try {
      await api.delete(`/jobs/applications/${id}`);
    } catch (error) {
      console.error('Erreur deleteApplication:', error);
      throw error;
    }
  },

  async getApplicationById(id: string): Promise<JobApplication> {
    try {
      const response = await api.get(`/jobs/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getApplicationById:', error);
      throw error;
    }
  },

  async exportApplications(jobId?: string): Promise<string> {
    try {
      const url = jobId ? `/jobs/applications/export?jobId=${jobId}` : '/jobs/applications/export';
      const response = await api.get(url, {
        responseType: 'text',
      });
      return response.data || '';
    } catch (error) {
      console.error('Erreur exportApplications:', error);
      return '';
    }
  },
};

export default jobService;