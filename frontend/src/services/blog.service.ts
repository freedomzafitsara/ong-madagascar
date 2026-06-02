// src/services/blog.service.ts
import api from "./api";

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

export const blogService = {
  // Récupérer tous les articles (admin)
  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    is_published?: boolean;
    search?: string;
  }): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/blog", { params });
    return response.data;
  },

  // Récupérer les articles publiés (public)
  async getPublishedPosts(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: BlogPost[]; total: number; page: number; totalPages: number }> {
    const response = await api.get("/blog/public", { params });
    return response.data;
  },

  // Récupérer un article par ID (public)
  async getPostById(id: string): Promise<BlogPost> {
    const response = await api.get(`/blog/public/${id}`);
    return response.data;
  },

  // Récupérer un article par ID (admin)
  async getPostForAdmin(id: string): Promise<BlogPost> {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  // Créer un article (admin)
  async createPost(data: CreateBlogPostDto): Promise<BlogPost> {
    const response = await api.post("/blog", data);
    return response.data;
  },

  // Mettre à jour un article (admin)
  async updatePost(id: string, data: Partial<CreateBlogPostDto>): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}`, data);
    return response.data;
  },

  // Publier un article (admin)
  async publishPost(id: string): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}/publish`);
    return response.data;
  },

  // Dépublier un article (admin)
  async unpublishPost(id: string): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}/unpublish`);
    return response.data;
  },

  // Supprimer un article (admin)
  async deletePost(id: string): Promise<void> {
    await api.delete(`/blog/${id}`);
  },

  // Statistiques (admin)
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
  }> {
    const response = await api.get("/blog/stats");
    return response.data;
  },
};

export default blogService;
