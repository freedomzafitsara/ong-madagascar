// src/services/projectService.ts
import api from '@/lib/axios';

// ========================================
// TYPES COMPLETS
// ========================================

export interface ProjectImage {
  id: string;
  url: string;
  isMain: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  location: string;
  category: string;
  status: 'active' | 'completed' | 'draft';
  budget?: number;
  budgetSpent?: number;
  targetCount?: number;
  currentCount?: number;
  progressPercent?: number;
  beneficiaries?: number;
  region: string;
  images?: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  titleMg?: string;
  description: string;
  descriptionMg?: string;
  location: string;
  category: string;
  region: string;
  budget?: number;
  targetCount?: number;
}

export interface UpdateProjectDto {
  title?: string;
  titleMg?: string;
  description?: string;
  descriptionMg?: string;
  location?: string;
  category?: string;
  status?: 'active' | 'completed' | 'draft';
  budget?: number;
  budgetSpent?: number;
  currentCount?: number;
  progressPercent?: number;
}

export interface ProjectFilters {
  status?: 'active' | 'completed' | 'draft';
  category?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProjects {
  data: Project[];
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
// SERVICE PROJETS
// ========================================

class ProjectService {
  // ========================================
  // CRUD PROJETS
  // ========================================
  
  /**
   * Récupérer tous les projets
   */
  async getAll(): Promise<Project[]> {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      throw error;
    }
  }

  /**
   * Récupérer les projets avec pagination et filtres
   */
  async getPaginated(filters: ProjectFilters = {}): Promise<PaginatedProjects> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.region) params.append('region', filters.region);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const response = await api.get(`/projects?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement projets paginés:', error);
      throw error;
    }
  }

  /**
   * Récupérer les projets actifs uniquement (pour le site public)
   */
  async getActiveProjects(): Promise<Project[]> {
    try {
      const response = await api.get('/projects?status=active');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement projets actifs:', error);
      throw error;
    }
  }

  /**
   * Récupérer les projets récents
   */
  async getRecentProjects(limit: number = 3): Promise<Project[]> {
    try {
      const response = await api.get(`/projects/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur chargement projets récents:', error);
      throw error;
    }
  }

  /**
   * Récupérer un projet par son ID
   */
  async getById(id: string): Promise<Project> {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur chargement projet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Créer un nouveau projet
   */
  async create(data: CreateProjectDto): Promise<Project> {
    try {
      const response = await api.post('/projects', data);
      return response.data;
    } catch (error) {
      console.error('Erreur création projet:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un projet
   */
  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    try {
      const response = await api.patch(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur mise à jour projet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un projet
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error(`Erreur suppression projet ${id}:`, error);
      throw error;
    }
  }

  // ========================================
  // GESTION DES IMAGES
  // ========================================

  /**
   * Upload d'une image pour un projet
   */
  async uploadImage(projectId: string, file: File, isMain: boolean = false): Promise<ProjectImage> {
    const formData = new FormData();
    formData.append('image', file);
    if (isMain) formData.append('isMain', 'true');

    try {
      const response = await api.post(`/projects/${projectId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur upload image:', error);
      throw error;
    }
  }

  /**
   * Upload de plusieurs images
   */
  async uploadMultipleImages(projectId: string, files: File[]): Promise<ProjectImage[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.post(`/projects/${projectId}/images/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur upload multiple images:', error);
      throw error;
    }
  }

  /**
   * Définir une image comme image principale
   */
  async setMainImage(projectId: string, imageId: string): Promise<void> {
    try {
      await api.patch(`/projects/${projectId}/images/${imageId}/main`);
    } catch (error) {
      console.error('Erreur définition image principale:', error);
      throw error;
    }
  }

  /**
   * Supprimer une image d'un projet
   */
  async deleteImage(projectId: string, imageId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/images/${imageId}`);
    } catch (error) {
      console.error('Erreur suppression image:', error);
      throw error;
    }
  }

  // ========================================
  // STATISTIQUES ET IMPACT
  // ========================================

  /**
   * Récupérer les statistiques d'impact des projets
   */
  async getImpactStats(): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalBeneficiaries: number;
    totalBudget: number;
    averageProgress: number;
  }> {
    try {
      const response = await api.get('/projects/stats/impact');
      return response.data;
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour la progression d'un projet
   */
  async updateProgress(id: string, currentCount: number, progressPercent: number): Promise<Project> {
    try {
      const response = await api.patch(`/projects/${id}/progress`, {
        currentCount,
        progressPercent,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour progression:', error);
      throw error;
    }
  }

  /**
   * Récupérer les projets par catégorie
   */
  async getByCategory(category: string): Promise<Project[]> {
    try {
      const response = await api.get(`/projects/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur chargement projets catégorie ${category}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les projets par région
   */
  async getByRegion(region: string): Promise<Project[]> {
    try {
      const response = await api.get(`/projects/region/${region}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur chargement projets région ${region}:`, error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
export default projectService;