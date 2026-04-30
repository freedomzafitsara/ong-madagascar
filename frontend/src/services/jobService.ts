// frontend/src/services/jobService.ts
import api from "./api";

// ============================================
// TYPES ET INTERFACES
// ============================================

export interface JobOffer {
  id: string;
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  location?: string;
  region?: string;
  jobType: "cdi" | "cdd" | "stage" | "freelance" | "benevolat";
  sector?: string;
  salaryRange?: string;
  requirements?: string;
  benefits?: string;
  deadline?: string;
  status: "draft" | "published" | "closed" | "expired";
  applicationsCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  experienceYears?: number;
  coverLetter?: string;
  photoUrl?: string;
  cvUrl: string;
  diplomaUrl?: string;
  attestationUrl?: string;
  status: "submitted" | "reviewing" | "shortlisted" | "interview" | "accepted" | "rejected";
  notes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobStats {
  total: number;
  published: number;
  draft: number;
  closed: number;
  expired: number;
  totalApplications: number;
}

// ============================================
// SERVICE JOBS
// ============================================

export const jobService = {
  // ==================== OFFRES D'EMPLOI ====================
  
  /**
   * Récupérer toutes les offres d'emploi avec pagination et filtres
   */
  getAllOffers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    jobType?: string;
    region?: string;
    sector?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobOffer>> => {
    const response = await api.get("/jobs/offers", { params });
    return response.data;
  },
  
  /**
   * Récupérer une offre d'emploi par son ID
   */
  getOfferById: async (id: string): Promise<JobOffer> => {
    const response = await api.get(`/jobs/offers/${id}`);
    return response.data;
  },
  
  /**
   * Créer une nouvelle offre d'emploi (Admin/Partenaire)
   */
  createOffer: async (data: Partial<JobOffer>): Promise<JobOffer> => {
    const response = await api.post("/jobs/offers", data);
    return response.data;
  },
  
  /**
   * Modifier une offre d'emploi (Admin)
   */
  updateOffer: async (id: string, data: Partial<JobOffer>): Promise<JobOffer> => {
    const response = await api.put(`/jobs/offers/${id}`, data);
    return response.data;
  },
  
  /**
   * Supprimer une offre d'emploi (Admin)
   */
  deleteOffer: async (id: string): Promise<void> => {
    await api.delete(`/jobs/offers/${id}`);
  },
  
  /**
   * Modifier le statut d'une offre (Admin)
   */
  updateOfferStatus: async (id: string, status: JobOffer["status"]): Promise<JobOffer> => {
    const response = await api.put(`/jobs/offers/${id}/status`, { status });
    return response.data;
  },
  
  /**
   * Obtenir les statistiques des offres (Admin)
   */
  getStats: async (): Promise<JobStats> => {
    const response = await api.get("/jobs/offers/stats");
    return response.data;
  },
  
  // ==================== CANDIDATURES ====================
  
  /**
   * Postuler à une offre d'emploi
   */
  applyToOffer: async (offerId: string, formData: FormData): Promise<JobApplication> => {
    const response = await api.post(`/jobs/offers/${offerId}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },
  
  /**
   * Récupérer toutes les candidatures pour une offre (Admin)
   */
  getOfferApplications: async (
    offerId: string, 
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<PaginatedResponse<JobApplication>> => {
    const response = await api.get(`/jobs/offers/${offerId}/applications`, { params });
    return response.data;
  },
  
  /**
   * Modifier le statut d'une candidature (Admin)
   */
  updateApplicationStatus: async (
    applicationId: string, 
    status: JobApplication["status"], 
    notes?: string
  ): Promise<JobApplication> => {
    const response = await api.put(`/jobs/applications/${applicationId}/status`, { status, notes });
    return response.data;
  },
  
  /**
   * Vérifier si un email a déjà postulé à une offre
   */
  hasApplied: async (offerId: string, email: string): Promise<boolean> => {
    try {
      const response = await api.get(`/jobs/offers/${offerId}/has-applied`, { params: { email } });
      return response.data.hasApplied;
    } catch {
      return false;
    }
  },
};

// ============================================
// EXPORT DES TYPES POUR FACILITER L'IMPORT
// ============================================
export type { JobOffer as JobOfferType, JobApplication as JobApplicationType };