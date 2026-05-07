import api from './api';

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
  jobType: 'cdi' | 'cdd' | 'stage' | 'freelance' | 'benevolat';
  sector?: string;
  salaryRange?: string;
  requirements?: string;
  benefits?: string;
  deadline?: string;
  status: 'draft' | 'published' | 'closed' | 'expired';
  applicationsCount: number;
  isFeatured: boolean;
  createdAt: string;
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
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export const jobService = {
  // ==================== OFFRES D'EMPLOI ====================
  
  /**
   * Récupérer toutes les offres d'emploi avec filtres et pagination
   */
  getAllOffers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    jobType?: string;
    region?: string;
    sector?: string;
    search?: string;
  }): Promise<{ data: JobOffer[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get('/jobs/offers', { params });
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
   * Créer une nouvelle offre d'emploi (Admin)
   */
  createOffer: async (data: Partial<JobOffer>): Promise<JobOffer> => {
    const response = await api.post('/jobs/offers', data);
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
  updateOfferStatus: async (id: string, status: string): Promise<JobOffer> => {
    const response = await api.put(`/jobs/offers/${id}/status`, { status });
    return response.data;
  },
  
  // ==================== CANDIDATURES ====================
  
  /**
   * Postuler à une offre d'emploi
   */
  applyToOffer: async (offerId: string, formData: FormData): Promise<JobApplication> => {
    const response = await api.post(`/jobs/offers/${offerId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  /**
   * Récupérer toutes les candidatures pour une offre (Admin)
   */
  getOfferApplications: async (
    offerId: string, 
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<{ data: JobApplication[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get(`/jobs/offers/${offerId}/applications`, { params });
    return response.data;
  },
  
  /**
   * Modifier le statut d'une candidature (Admin)
   */
  updateApplicationStatus: async (
    applicationId: string, 
    status: string, 
    notes?: string
  ): Promise<JobApplication> => {
    const response = await api.put(`/jobs/applications/${applicationId}/status`, { status, notes });
    return response.data;
  },
  
  // ==================== MÉTHODES UTILITAIRES ====================
  
  /**
   * Récupérer les statistiques des offres (Admin)
   */
  getStats: async (): Promise<{
    total: number;
    published: number;
    draft: number;
    closed: number;
    expired: number;
    totalApplications: number;
  }> => {
    const response = await api.get('/jobs/stats');
    return response.data;
  },
};