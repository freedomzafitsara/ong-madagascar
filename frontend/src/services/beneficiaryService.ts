// src/services/beneficiaryService.ts
import api from '@/lib/axios';

// ========================================
// TYPES COMPLETS
// ========================================

export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: 'M' | 'F' | 'other';
  region: string;
  district?: string;
  fokontany?: string;
  educationLevel?: 'primary' | 'secondary' | 'high_school' | 'university' | 'vocational';
  employmentStatus?: 'employed' | 'unemployed' | 'student' | 'self_employed' | 'looking';
  
  // Mesure d'impact BEFORE Y-Mad
  beforeYmad?: string;
  beforeIncome?: number;
  beforeSkills?: string[];
  beforeConfidence?: number;
  
  // Mesure d'impact AFTER Y-Mad
  afterYmad?: string;
  afterIncome?: number;
  afterSkills?: string[];
  afterConfidence?: number;
  
  // Emploi trouvé
  employmentFound?: {
    company: string;
    position: string;
    startDate: string;
    salary: number;
  };
  
  // Entreprise créée
  businessCreated?: {
    name: string;
    type: string;
    employees: number;
    monthlyRevenue: number;
  };
  
  vulnerability?: string;
  projectIds: string[];
  status: 'active' | 'inactive' | 'graduated';
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiaryStats {
  totalBeneficiaries: number;
  employedCount: number;
  employmentRate: number;
  averageIncomeIncrease: number;
  businessesCreated: number;
  averageConfidenceIncrease: number;
  byRegion: Record<string, number>;
  byAgeGroup: Record<string, number>;
}

export interface BeneficiaryFilters {
  region?: string;
  status?: string;
  employmentStatus?: string;
  ageMin?: number;
  ageMax?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ========================================
// SERVICE BÉNÉFICIAIRES
// ========================================

export const beneficiaryService = {
  /**
   * Récupérer tous les bénéficiaires (avec pagination et filtres)
   */
  async getAll(params?: BeneficiaryFilters): Promise<PaginatedResponse<Beneficiary>> {
    try {
      const response = await api.get('/beneficiaries', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur chargement bénéficiaires:', error);
      throw error;
    }
  },

  /**
   * Récupérer un bénéficiaire par ID
   */
  async getById(id: string): Promise<Beneficiary> {
    try {
      const response = await api.get(`/beneficiaries/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur chargement bénéficiaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer un bénéficiaire
   */
  async create(data: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      const response = await api.post('/beneficiaries', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création bénéficiaire:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un bénéficiaire
   */
  async update(id: string, data: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      const response = await api.patch(`/beneficiaries/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour bénéficiaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un bénéficiaire
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/beneficiaries/${id}`);
    } catch (error) {
      console.error(`Erreur suppression bénéficiaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Enregistrer l'impact APRÈS Y-Mad
   */
  async recordImpact(id: string, afterData: {
    afterYmad: string;
    afterIncome?: number;
    afterSkills?: string[];
    afterConfidence?: number;
    employmentFound?: {
      company: string;
      position: string;
      startDate: string;
      salary: number;
    };
    businessCreated?: {
      name: string;
      type: string;
      employees: number;
      monthlyRevenue: number;
    };
  }): Promise<Beneficiary> {
    try {
      const response = await api.post(`/beneficiaries/${id}/impact`, afterData);
      return response.data;
    } catch (error) {
      console.error(`Erreur enregistrement impact bénéficiaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtenir les statistiques d'impact globales
   */
  async getStats(): Promise<BeneficiaryStats> {
    try {
      const response = await api.get('/beneficiaries/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      throw error;
    }
  },

  /**
   * Obtenir les statistiques par région
   */
  async getStatsByRegion(): Promise<Record<string, number>> {
    try {
      const response = await api.get('/beneficiaries/stats/region');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement statistiques par région:', error);
      throw error;
    }
  },

  /**
   * Exporter les bénéficiaires en CSV
   */
  async exportCSV(filters?: BeneficiaryFilters): Promise<Blob> {
    try {
      const response = await api.get('/beneficiaries/export', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erreur export CSV:', error);
      throw error;
    }
  },

  /**
   * Rattacher un bénéficiaire à un projet
   */
  async attachToProject(beneficiaryId: string, projectId: string): Promise<void> {
    try {
      await api.post(`/beneficiaries/${beneficiaryId}/projects/${projectId}`);
    } catch (error) {
      console.error(`Erreur rattachement bénéficiaire ${beneficiaryId} au projet ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Détacher un bénéficiaire d'un projet
   */
  async detachFromProject(beneficiaryId: string, projectId: string): Promise<void> {
    try {
      await api.delete(`/beneficiaries/${beneficiaryId}/projects/${projectId}`);
    } catch (error) {
      console.error(`Erreur détachement bénéficiaire ${beneficiaryId} du projet ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les bénéficiaires d'un projet
   */
  async getByProject(projectId: string): Promise<Beneficiary[]> {
    try {
      const response = await api.get(`/projects/${projectId}/beneficiaries`);
      return response.data;
    } catch (error) {
      console.error(`Erreur chargement bénéficiaires du projet ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les témoignages des bénéficiaires
   */
  async getTestimonials(limit: number = 5): Promise<Beneficiary[]> {
    try {
      const response = await api.get('/beneficiaries/testimonials', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Erreur chargement témoignages:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour le statut d'un bénéficiaire
   */
  async updateStatus(id: string, status: 'active' | 'inactive' | 'graduated'): Promise<Beneficiary> {
    try {
      const response = await api.patch(`/beneficiaries/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour statut bénéficiaire ${id}:`, error);
      throw error;
    }
  },
};

export default beneficiaryService;