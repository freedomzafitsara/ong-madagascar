// frontend/src/services/job.service.ts

import api from '@/lib/api';

// ============================================================
// ENUMS
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
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

// ============================================================
// INTERFACES
// ============================================================

export interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company: string;
  company_logo?: string;
  location: string;
  contract_type: ContractType;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  deadline: string;
  is_published: boolean;
  image_url?: string;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  main_image_id?: string;
  experience_level: string;
  education_level: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
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
  status: ApplicationStatus | string;
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

// ============================================================
// SERVICE COMPLET
// ============================================================

export const jobService = {
  
  // ============================================================
  // ROUTES PUBLIQUES - Accessibles sans authentification
  // ============================================================
  
  async getPublishedOffers(params?: { 
    page?: number; 
    limit?: number; 
    contract_type?: ContractType; 
    search?: string;
    location?: string;
    experience_level?: string;
  }): Promise<PaginatedResponse<JobOffer>> {
    try {
      const response = await api.get('/jobs/offers/public', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur chargement offres publiees:', error);
      throw error;
    }
  },

  async getFeaturedOffers(limit: number = 6): Promise<JobOffer[]> {
    try {
      const response = await api.get('/jobs/offers/featured', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Erreur chargement offres en vedette:', error);
      throw error;
    }
  },

  async getOfferById(id: string): Promise<JobOffer> {
    try {
      const response = await api.get(`/jobs/offers/public/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur chargement offre:', error);
      
      if (error.response?.status === 403 || error.response?.status === 404) {
        try {
          const offers = await this.getPublishedOffers({ limit: 100 });
          const found = offers.data.find((item: JobOffer) => item.id === id);
          if (found) {
            return found;
          }
        } catch (listError) {
          console.error('Erreur recherche dans la liste:', listError);
        }
      }
      
      throw error;
    }
  },

  async getOfferFromPublicList(id: string): Promise<JobOffer | null> {
    try {
      const response = await api.get('/jobs/offers/public', { 
        params: { limit: 100 } 
      });
      const offer = response.data.data.find((item: JobOffer) => item.id === id);
      return offer || null;
    } catch (error) {
      console.error('Erreur recherche offre dans liste publique:', error);
      return null;
    }
  },

  // ============================================================
  // ROUTES PROTEGEES - Authentification requise
  // ============================================================
  
  async getAllOffers(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    contract_type?: string; 
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<JobOffer>> {
    const response = await api.get('/jobs/offers', { params });
    return response.data;
  },

  async createOffer(data: Partial<JobOffer>): Promise<JobOffer> {
    const response = await api.post('/jobs/offers', data);
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

  // ============================================================
  // STATISTIQUES
  // ============================================================
  
  async getJobStats(): Promise<JobOfferStats> {
    const response = await api.get('/jobs/offers/stats');
    const data = response.data;
    return {
      total: data.total || 0,
      published: data.published || 0,
      draft: data.draft || 0,
      expired: data.expired || 0,
      closed: data.closed || 0,
      archived: data.archived || 0,
      total_applications: data.totalApplications || data.total_applications || 0,
      pending_applications: data.pendingApplications || data.pending_applications || 0,
    };
  },

  // ============================================================
  // CANDIDATURES - AVEC SECURITE
  // ============================================================
  
  async apply(data: CreateJobApplicationDto): Promise<JobApplication> {
    // ✅ Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour postuler à une offre.');
    }
    
    const response = await api.post('/jobs/applications', data);
    return response.data;
  },

  async getAllApplications(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    job_offer_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    const response = await api.get('/jobs/applications', { params });
    return response.data;
  },

  async getApplicationsByJob(jobId: string, params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    const response = await api.get(`/jobs/offers/${jobId}/applications`, { params });
    return response.data;
  },

  async getMyApplications(params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
  }): Promise<PaginatedResponse<JobApplication>> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour voir vos candidatures.');
    }
    
    const response = await api.get('/jobs/applications/my', { params });
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
    const response = await api.get('/jobs/applications/stats');
    return response.data;
  },

  // ✅ METHODE AJOUTEE - Vérifier si l'utilisateur a déjà postulé
  async hasApplied(jobId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      const response = await api.get(`/jobs/applications/check/${jobId}`);
      return response.data?.applied || false;
    } catch (error) {
      console.error('Erreur vérification candidature:', error);
      return false;
    }
  },

  // ============================================================
  // FAVORIS - AVEC SECURITE
  // ============================================================
  
  async saveJob(jobId: string): Promise<any> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour sauvegarder une offre.');
    }
    
    const response = await api.post(`/jobs/saved/${jobId}`);
    return response.data;
  },

  async unsaveJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour cette action.');
    }
    
    const response = await api.delete(`/jobs/saved/${jobId}`);
    return response.data;
  },

  async getSavedJobs(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<any>> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour voir vos favoris.');
    }
    
    const response = await api.get('/jobs/saved', { params });
    return response.data;
  },

  async checkIfSaved(jobId: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        return false;
      }
      
      const response = await api.get(`/jobs/saved/${jobId}`);
      return response.data.saved || false;
    } catch (error) {
      return false;
    }
  },

  // ============================================================
  // EXPORT - AVEC SECURITE
  // ============================================================
  
  async exportApplications(jobId?: string): Promise<string> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour exporter.');
    }
    
    const response = await api.get('/jobs/applications/export', { 
      params: { jobId },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportOffers(params?: { status?: string; contract_type?: string }): Promise<string> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour exporter.');
    }
    
    const response = await api.get('/jobs/offers/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // ============================================================
  // UPLOAD DE FICHIERS - AVEC SECURITE
  // ============================================================
  
  async uploadFile(file: File, type: 'cv' | 'cover_letter' | 'photo' | 'diploma' | 'attestation'): Promise<{ url: string; filename: string }> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour uploader un fichier.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/jobs/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ============================================================
  // FONCTIONS UTILITAIRES DE SECURITE
  // ============================================================
  
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!(localStorage.getItem('access_token') || localStorage.getItem('token'));
    }
    return false;
  },

  getCurrentUser(): any {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    return null;
  },
};

export default jobService;