// src/services/uploadService.ts
'use client';

import api from '@/lib/axios';

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  type: string;
  entityId: string;
  size: number;
  createdAt: string;
}

export type UploadType = 'banner' | 'project' | 'blog' | 'profile' | 'logo' | 'background';

class UploadService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      // ✅ Support des deux formats de token
      return localStorage.getItem('access_token') || localStorage.getItem('admin_token');
    }
    return null;
  }

  async uploadImage(file: File, type: UploadType, entityId?: string): Promise<UploadedImage> {
    // ✅ Validation
    if (!file.type.startsWith('image/')) {
      throw new Error('Format non supporté. Veuillez sélectionner une image (JPG, PNG, GIF, WEBP).');
    }

    // ✅ Augmentation de la limite à 10MB pour les images
    const maxSize = type === 'background' ? 10 : 5;
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`Fichier trop grand. Maximum ${maxSize} Mo.`);
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifié. Veuillez vous reconnecter.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (entityId) formData.append('entityId', entityId);

    // ✅ Utilisation de l'API backend (port 4001)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    
    const response = await fetch(`${API_URL}/upload/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erreur lors de l\'upload');
    }

    return {
      id: `${type}_${Date.now()}`,
      url: data.url,
      filename: data.filename,
      originalName: file.name,
      type: type,
      entityId: entityId || '',
      size: file.size,
      createdAt: new Date().toISOString(),
    };
  }

  async getImages(type?: UploadType, entityId?: string): Promise<UploadedImage[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (entityId) params.append('entityId', entityId);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    const response = await fetch(`${API_URL}/upload?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erreur lors de la récupération');
    }

    return data.files || data.images || [];
  }

  async deleteImage(url: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
    const response = await fetch(`${API_URL}/upload?url=${encodeURIComponent(url)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Erreur lors de la suppression');
    }
  }

  // ========================================
  // MÉTHODES SPÉCIFIQUES POUR LA BANNIÈRE
  // ========================================
  async uploadBanner(file: File): Promise<UploadedImage> {
    return this.uploadImage(file, 'banner');
  }

  async getBanner(): Promise<UploadedImage | null> {
    const images = await this.getImages('banner');
    return images.length > 0 ? images[0] : null;
  }

  async deleteBanner(): Promise<void> {
    const banner = await this.getBanner();
    if (banner) {
      await this.deleteImage(banner.url);
    }
  }

  // ========================================
  // MÉTHODES SPÉCIFIQUES POUR LE LOGO
  // ========================================
  async uploadLogo(file: File): Promise<UploadedImage> {
    return this.uploadImage(file, 'logo');
  }

  async getLogo(): Promise<UploadedImage | null> {
    const images = await this.getImages('logo');
    return images.length > 0 ? images[0] : null;
  }

  async deleteLogo(): Promise<void> {
    const logo = await this.getLogo();
    if (logo) {
      await this.deleteImage(logo.url);
    }
  }

  // ========================================
  // MÉTHODES SPÉCIFIQUES POUR LES PROJETS
  // ========================================
  async uploadProjectImage(projectId: string, file: File): Promise<UploadedImage> {
    return this.uploadImage(file, 'project', projectId);
  }

  async getProjectImages(projectId: string): Promise<UploadedImage[]> {
    return this.getImages('project', projectId);
  }

  // ========================================
  // MÉTHODES SPÉCIFIQUES POUR LES FONDS D'ÉCRAN
  // ========================================
  async uploadBackground(pageKey: string, file: File): Promise<UploadedImage> {
    return this.uploadImage(file, 'background', pageKey);
  }

  async getBackground(pageKey: string): Promise<UploadedImage | null> {
    const images = await this.getImages('background', pageKey);
    return images.length > 0 ? images[0] : null;
  }

  // ========================================
  // MÉTHODES SPÉCIFIQUES POUR LE PROFIL
  // ========================================
  async uploadProfileImage(file: File): Promise<UploadedImage> {
    return this.uploadImage(file, 'profile');
  }

  async getProfileImage(): Promise<UploadedImage | null> {
    const images = await this.getImages('profile');
    return images.length > 0 ? images[0] : null;
  }
}

export const uploadService = new UploadService();