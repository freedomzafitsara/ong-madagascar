// frontend/src/services/project.service.ts

import api from '@/lib/api';  // ✅ Utiliser le même import que blog.service

export interface Project {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  location?: string;
  start_date?: string;
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDto {
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  location?: string;
  start_date?: string;
  image_url?: string;
  status?: string;
}

export interface PaginatedProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  draft: number;
}

export const projectService = {
  /**
   * Récupère tous les projets (admin) avec pagination
   */
  async getAllProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedProjectsResponse> {
    const response = await api.get("/projects", { params });
    return response.data;
  },

  /**
   * Récupère les projets publiés (public)
   */
  async getPublishedProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedProjectsResponse> {
    const response = await api.get("/projects/public", { params });
    return response.data;
  },

  /**
   * Récupère les projets à la une (featured)
   */
  async getFeaturedProjects(): Promise<Project[]> {
    const response = await api.get("/projects/featured");
    return response.data;
  },

  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Crée un nouveau projet (admin)
   */
  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post("/projects", data);
    return response.data;
  },

  /**
   * Met à jour un projet (admin)
   */
  async updateProject(id: string, data: Partial<CreateProjectDto>): Promise<Project> {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Met à jour le statut d'un projet (admin)
   */
  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  },

  /**
   * Supprime un projet (admin)
   */
  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  /**
   * Récupère les statistiques des projets (admin)
   */
  async getStats(): Promise<ProjectStats> {
    const response = await api.get("/projects/stats");
    return response.data;
  },
};

export default projectService;