// src/services/project.service.ts
import api from "./api";

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

export const projectService = {
  // Récupérer tous les projets (admin)
  async getAllProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ data: Project[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/projects", { params });
    return response.data;
  },

  // Récupérer les projets publiés (public)
  async getPublishedProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Project[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/projects/public", { params });
    return response.data;
  },

  // Récupérer les projets à la une
  async getFeaturedProjects(): Promise<Project[]> {
    const response = await api.get("/projects/featured");
    return response.data;
  },

  // Récupérer un projet par ID
  async getProjectById(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Créer un projet (admin)
  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await api.post("/projects", data);
    return response.data;
  },

  // Mettre à jour un projet (admin)
  async updateProject(id: string, data: Partial<CreateProjectDto>): Promise<Project> {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  // Mettre à jour le statut (admin)
  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  },

  // Supprimer un projet (admin)
  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  // Statistiques (admin)
  async getStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    planning: number;
    draft: number;
  }> {
    const response = await api.get("/projects/stats");
    return response.data;
  },
};

export default projectService;
