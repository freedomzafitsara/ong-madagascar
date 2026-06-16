// frontend/src/services/blog.service.ts

import api from '@/lib/api';

export interface BlogPost {
  id: string;
  title_fr: string;
  title_mg?: string;
  content_fr: string;
  content_mg?: string;
  summary_fr?: string;
  summary_mg?: string;
  slug?: string;
  image_url?: string;
  status: string;
  author_id?: string;
  category_id?: string;
  tags?: string[];
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const blogService = {
  async getPublishedPosts(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<BlogPost>> {
    const response = await api.get('/blog/public', { params });
    return response.data;
  },

  async getPostById(id: string): Promise<BlogPost> {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await api.get(`/blog/public/slug/${slug}`);
    return response.data;
  },

  async getPublicPostById(id: string): Promise<BlogPost> {
    const response = await api.get(`/blog/public/${id}`);
    return response.data;
  },

  async getAllPosts(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PaginatedResponse<BlogPost>> {
    const response = await api.get('/blog', { params });
    return response.data;
  },

  async createPost(data: Partial<BlogPost>): Promise<BlogPost> {
    const response = await api.post('/blog', data);
    return response.data;
  },

  async updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}`, data);
    return response.data;
  },

  async publishPost(id: string): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}/publish`);
    return response.data;
  },

  async unpublishPost(id: string): Promise<BlogPost> {
    const response = await api.patch(`/blog/${id}/unpublish`);
    return response.data;
  },

  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },

  async getBlogStats(): Promise<any> {
    const response = await api.get('/blog/stats');
    return response.data;
  },
};