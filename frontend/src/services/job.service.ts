// src/services/job.service.ts
import api from "./api";

export interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: string;
  deadline?: string;
  is_published: boolean;
  image_url?: string;
  status: string;
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
  contract_type?: string;
  deadline?: string;
  is_published?: boolean;
  image_url?: string;
}

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
  status: string;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
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
  cv_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
}

export const jobService = {
  // ============================================================
  // OFFRES D'EMPLOI
  // ============================================================
  
  // Récupérer toutes les offres (admin)
  async getAllOffers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    is_published?: boolean;
    search?: string;
  }): Promise<{ data: JobOffer[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/jobs/offers", { params });
    return response.data;
  },

  // Récupérer les offres publiées (public)
  async getPublishedOffers(params?: {
    page?: number;
    limit?: number;
    contract_type?: string;
    search?: string;
  }): Promise<{ data: JobOffer[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/jobs/offers/public", { params });
    return response.data;
  },

  // Récupérer les offres à la une
  async getFeaturedOffers(): Promise<JobOffer[]> {
    const response = await api.get("/jobs/offers/featured");
    return response.data;
  },

  // Récupérer une offre par ID
  async getOfferById(id: string): Promise<JobOffer> {
    const response = await api.get(`/jobs/offers/${id}`);
    return response.data;
  },

  // Créer une offre (admin)
  async createOffer(data: CreateJobOfferDto): Promise<JobOffer> {
    const response = await api.post("/jobs/offers", data);
    return response.data;
  },

  // Mettre à jour une offre (admin)
  async updateOffer(id: string, data: Partial<CreateJobOfferDto>): Promise<JobOffer> {
    const response = await api.patch(`/jobs/offers/${id}`, data);
    return response.data;
  },

  // Publier/Dépublier une offre (admin)
  async updateOfferStatus(id: string, is_published: boolean): Promise<JobOffer> {
    const response = await api.patch(`/jobs/offers/${id}/status`, { is_published });
    return response.data;
  },

  // Supprimer une offre (admin)
  async deleteOffer(id: string): Promise<void> {
    await api.delete(`/jobs/offers/${id}`);
  },

  // Statistiques des offres (admin)
  async getStats(): Promise<{ total: number; published: number; draft: number; expired: number }> {
    const response = await api.get("/jobs/offers/stats");
    return response.data;
  },

  // ============================================================
  // CANDIDATURES
  // ============================================================
  
  // Postuler à une offre (public)
  async apply(data: CreateJobApplicationDto, files?: FormData): Promise<JobApplication> {
    if (files) {
      const response = await api.post("/jobs/apply", files, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    const response = await api.post("/jobs/apply", data);
    return response.data;
  },

  // Récupérer toutes les candidatures (admin)
  async getAllApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    job_offer_id?: string;
  }): Promise<{ data: JobApplication[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/jobs/applications", { params });
    return response.data;
  },

  // Récupérer les candidatures d'une offre (admin)
  async getApplicationsByJob(jobId: string, params?: { page?: number; limit?: number; status?: string }): Promise<{
    data: JobApplication[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get(`/jobs/offers/${jobId}/applications`, { params });
    return response.data;
  },

  // Récupérer mes candidatures (candidat)
  async getMyApplications(): Promise<JobApplication[]> {
    const response = await api.get("/jobs/applications/my");
    return response.data;
  },

  // Mettre à jour le statut d'une candidature (admin)
  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication> {
    const response = await api.patch(`/jobs/applications/${id}/status`, { status, notes });
    return response.data;
  },

  // Supprimer une candidature (admin)
  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/jobs/applications/${id}`);
  },

  // Exporter les candidatures en CSV (admin)
  async exportApplications(jobId?: string): Promise<string> {
    const response = await api.get("/jobs/applications/export", { params: { jobId } });
    return response.data.csv;
  },
};

export default jobService;
