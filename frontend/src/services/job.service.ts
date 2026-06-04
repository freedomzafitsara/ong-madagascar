import api from "@/lib/axios";

// ============================================================
// TYPES ET ÉNUMÉRATIONS
// ============================================================

export enum JobStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
  EXPIRED = "expired",
  ARCHIVED = "archived"
}

export enum ContractType {
  CDI = "CDI",
  CDD = "CDD",
  STAGE = "STAGE",
  FREELANCE = "FREELANCE",
  ALTERNANCE = "ALTERNANCE",
  TEMPORARY = "TEMPORARY"
}

export enum ApplicationStatus {
  SUBMITTED = "submitted",
  REVIEWING = "reviewing",
  SHORTLISTED = "shortlisted",
  INTERVIEW = "interview",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn"
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================

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
}

export interface CreateJobOfferDto {
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: ContractType;
  deadline?: string;
  is_published?: boolean;
  image_url?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// ============================================================
// STATISTIQUES (VERSION COMPLÈTE)
// ============================================================

export interface JobOfferStats {
  total: number;
  published: number;
  draft: number;
  expired: number;
  closed: number;
  archived: number;
  total_applications: number;
  pending_applications: number;
  totalApplications: number;
  pendingApplications: number;
}

// ============================================================
// SERVICE
// ============================================================

export const jobService = {
  // ============================================================
  // OFFRES PUBLIQUES
  // ============================================================

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

  // ============================================================
  // ADMINISTRATION
  // ============================================================

  async getAllOffers(params?: { page?: number; limit?: number; status?: string; contract_type?: string; search?: string }): Promise<PaginatedResponse<JobOffer>> {
    const response = await api.get("/jobs/offers", { params });
    return response.data;
  },

  async createOffer(data: CreateJobOfferDto): Promise<JobOffer> {
    const response = await api.post("/jobs/offers", data);
    return response.data;
  },

  async updateOffer(id: string, data: Partial<CreateJobOfferDto>): Promise<JobOffer> {
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

  // ============================================================
  // STATISTIQUES (VERSION COMPLÈTE AVEC NORMALISATION)
  // ============================================================

  async getJobStats(): Promise<JobOfferStats> {
    const response = await api.get("/jobs/offers/stats");
    const data = response.data;
    
    // Normalisation des données pour gérer les deux formats
    return {
      total: data.total || 0,
      published: data.published || 0,
      draft: data.draft || 0,
      expired: data.expired || 0,
      closed: data.closed || 0,
      archived: data.archived || 0,
      total_applications: data.total_applications || data.totalApplications || 0,
      pending_applications: data.pending_applications || data.pendingApplications || 0,
      totalApplications: data.total_applications || data.totalApplications || 0,
      pendingApplications: data.pending_applications || data.pendingApplications || 0,
    };
  },

  // ============================================================
  // CANDIDATURES
  // ============================================================

  async apply(data: CreateJobApplicationDto): Promise<JobApplication> {
    const response = await api.post("/jobs/apply", data);
    return response.data;
  },

  async getAllApplications(params?: { page?: number; limit?: number; status?: ApplicationStatus; job_offer_id?: string }): Promise<PaginatedResponse<JobApplication>> {
    const response = await api.get("/jobs/applications", { params });
    return response.data;
  },

  async getApplicationsByJob(jobId: string, params?: { page?: number; limit?: number; status?: ApplicationStatus }): Promise<PaginatedResponse<JobApplication>> {
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

  async getApplicationStats(): Promise<ApplicationStats> {
    const response = await api.get("/jobs/applications/stats");
    return response.data;
  },

  // ============================================================
  // EXPORT
  // ============================================================

  async exportApplications(jobId?: string): Promise<string> {
    const response = await api.get("/jobs/applications/export", { params: { jobId } });
    return response.data;
  }
};

// ============================================================
// INTERFACES SUPPLÉMENTAIRES
// ============================================================

export interface JobApplication {
  id: string;
  job_offer_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience?: string;
  experience_years?: number;
  cover_letter?: string;
  cv_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
  status: ApplicationStatus;
  notes?: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
  jobOffer?: JobOffer;
}

export interface CreateJobApplicationDto {
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience?: string;
  experience_years?: number;
  cover_letter?: string;
  cv_url: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
  notes?: string;
  rejection_reason?: string;
  interview_date?: string;
  score?: number;
}

export interface ApplicationStats {
  total: number;
  submitted: number;
  reviewing: number;
  shortlisted: number;
  interview: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export default jobService;