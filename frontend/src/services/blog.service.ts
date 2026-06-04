// src/services/blog.service.ts
import api from '@/lib/axios';

export interface BlogPost {
  id: string;
  title_fr: string;
  title_mg?: string;
  content_fr: string;
  content_mg?: string;
  summary_fr?: string;
  summary_mg?: string;
  type?: string;
  image_url?: string;
  is_published: boolean;
  author_id: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateBlogPostDto {
  title_fr: string;
  title_mg?: string;
  content_fr: string;
  content_mg?: string;
  summary_fr?: string;
  summary_mg?: string;
  type?: string;
  image_url?: string;
  is_published?: boolean;
}

export interface PaginatedBlogResponse {
  data: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
}

export const blogService = {
  /**
   * Récupère tous les articles (admin) avec pagination
   */
  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    is_published?: boolean;
    search?: string;
  }): Promise<PaginatedBlogResponse> {
    const response = await api.get("/blog", { params });
    return response.data;
  },

  /**
   * Récupère les articles publiés (public)
   */
  async getPublishedPosts(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedBlogResponse> {
    const response = await api.get("/blog/public", { params });
    return response.data;
  },

  /**
   * Récupère un article par son ID (public)
   */
  async getPostById(id: string): Promise<BlogPost> {
    const response = await api.get(`/blog/public/${id}`);
    return response.data;
  },

  /**
   * Récupère un article par son ID (admin)
   */
  async getPostForAdmin(id: string): Promise<BlogPost> {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  /**
   * Crée un nouvel article (admin)
   */
  async createPost(data: CreateBlogPostDto): Promise<BlogPost> {
    const response = await api.post("/blog", data);
    return response.data;
  },

  /**
   * Met à jour un article (admin)
   */
  async updatePost(id: string, data: Partial<CreateBlogPostDto>): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}`, data);
    return response.data;
  },

  /**
   * Publie un article (admin)
   */
  async publishPost(id: string): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}/publish`);
    return response.data;
  },

  /**
   * Dépublie un article (admin)
   */
  async unpublishPost(id: string): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}/unpublish`);
    return response.data;
  },

  /**
   * Supprime un article (admin)
   */
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },

  /**
   * Récupère les statistiques des articles (admin)
   */
  async getStats(): Promise<BlogStats> {
    const response = await api.get("/blog/stats");
    return response.data;
  },
};

export default blogService;