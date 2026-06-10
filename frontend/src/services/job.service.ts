// frontend/src/services/job.service.ts

import api from '@/lib/api';

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
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type: ContractType;
  deadline?: string;
  is_published: boolean;
  image_url?: string;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  main_image_id?: string;
}

export interface JobApplication {
  id: string;
  job_offer_id: string;
  user_id?: string;
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
  status: string;
  notes?: string;
  created_at: string;
  jobOffer?: JobOffer;
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
  experience?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface JobOfferStats {
  total: number;
  published: number;
  draft: number;
  expired: number;
  closed: number;
  archived: number;
  total_applications: number;
  pending_applications: number;
}

export const jobService = {
  // Routes publiques
  async getPublishedOffers(params?: { page?: number; limit?: number; contract_type?: ContractType; search?: string }): Promise<PaginatedResponse<JobOffer>> {
    const response = await api.get("/jobs/offers/public", { params });
    return response.data;
  },

  async getFeaturedOffers(): Promise<JobOffer[]> {
    const response = await api.get("/jobs/offers/featured");
    return response.data;
  },

  async getOfferById(id: string): Promise<JobOffer> {
    const response = await api.get(`/jobs/offers/${id}`);
    return response.data;
  },

  // Routes Admin
  async getAllOffers(params?: { page?: number; limit?: number; status?: string; contract_type?: string; search?: string }): Promise<PaginatedResponse<JobOffer>> {
    const response = await api.get("/jobs/offers", { params });
    return response.data;
  },

  async createOffer(data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.post("/jobs/offers", data);
    return response.data;
  },

  async updateOffer(id: string, data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.patch(`/jobs/offers/${id}`, data);
    return response.data;
  },

  async updateOfferStatus(id: string, status: JobStatus): Promise<JobOffer> {
    const response = await api.patch(`/jobs/offers/${id}/status`, { status });
    return response.data;
  },

  async deleteOffer(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/jobs/offers/${id}`);
    return response.data;
  },

  // Statistiques
  async getJobStats(): Promise<JobOfferStats> {
    const response = await api.get("/jobs/offers/stats");
    const data = response.data;
    return {
      total: data.total || 0,
      published: data.published || 0,
      draft: data.draft || 0,
      expired: data.expired || 0,
      closed: data.closed || 0,
      archived: data.archived || 0,
      total_applications: data.total_applications || data.totalApplications || 0,
      pending_applications: data.pending_applications || data.pendingApplications || 0,
    };
  },

  // Candidatures
  async apply(data: CreateJobApplicationDto): Promise<JobApplication> {
    const response = await api.post("/jobs/apply", data);
    return response.data;
  },

  async getAllApplications(params?: { page?: number; limit?: number; status?: string; job_offer_id?: string }): Promise<PaginatedResponse<JobApplication>> {
    const response = await api.get("/jobs/applications", { params });
    return response.data;
  },

  async getApplicationsByJob(jobId: string, params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<JobApplication>> {
    const response = await api.get(`/jobs/offers/${jobId}/applications`, { params });
    return response.data;
  },

  async updateApplicationStatus(id: string, data: UpdateApplicationStatusDto): Promise<JobApplication> {
    const response = await api.patch(`/jobs/applications/${id}/status`, data);
    return response.data;
  },

  async deleteApplication(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/jobs/applications/${id}`);
    return response.data;
  },

  async getApplicationStats(): Promise<any> {
    const response = await api.get("/jobs/applications/stats");
    return response.data;
  },

  // Export
  async exportApplications(jobId?: string): Promise<string> {
    const response = await api.get("/jobs/applications/export", { params: { jobId } });
    return response.data;
  }
};

export default jobService;