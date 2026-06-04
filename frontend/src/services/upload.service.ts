/**
 * Service d'upload vers Cloudinary via le backend
 * @module UploadService
 * @description Gère l'upload, la récupération et la suppression d'images sur Cloudinary
 */

'use client';

// ============================================================
// TYPES ET INTERFACES
// ============================================================

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  type: string;
  entityId: string;
  size: number;
  createdAt: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
}

export type UploadType = 'banner' | 'project' | 'blog' | 'profile' | 'logo' | 'background' | 'job';

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// ============================================================
// SERVICE D'UPLOAD
// ============================================================

class UploadService {
  /**
   * Récupère le token d'authentification
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Upload une image vers le backend (Cloudinary)
   * @param file - Fichier image à uploader
   * @param type - Type d'upload (banner, project, blog, profile, logo, background, job)
   * @param entityId - ID de l'entité associée (optionnel)
   * @returns URL de l'image uploadée
   */
  async uploadImage(file: File, type: UploadType = 'job', entityId?: string): Promise<string> {
    // Validation du type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format non supporte. Veuillez selectionner une image (JPG, PNG, WEBP, GIF).');
    }

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Fichier trop grand. Maximum 5 Mo.');
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie. Veuillez vous reconnecter.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    //  URL correcte: /api/upload/single 
    const response = await fetch(`${API_URL}/api/upload/single`, {

  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Ignorer l'erreur de parsing JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.url || data.fileUrl || data.secure_url;
  }

  /**
   * Version de développement (sans backend)
   * Convertit l'image en base64 (utilisable sans serveur)
   */
  async uploadImageLocal(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur de lecture du fichier'));
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Récupère les images uploadées
   */
  async getImages(type?: UploadType, entityId?: string): Promise<UploadedImage[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (entityId) params.append('entityId', entityId);

    const response = await fetch(`${API_URL}/api/upload?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Erreur lors de la recuperation');
    }

    const data = await response.json();
    return data.files || data.images || data.data || [];
  }

  /**
   * Supprime une image
   */
  async deleteImage(url: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie');
    }

    const response = await fetch(`${API_URL}/api/upload?url=${encodeURIComponent(url)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Erreur lors de la suppression');
    }
  }

  // ========================================
  // METHODES SPECIFIQUES POUR LES OFFRES D'EMPLOI
  // ========================================

  async uploadJobImage(jobId: string, file: File): Promise<string> {
    return this.uploadImage(file, 'job', jobId);
  }

  async getJobImage(jobId: string): Promise<UploadedImage | null> {
    const images = await this.getImages('job', jobId);
    return images.length > 0 ? images[0] : null;
  }

  async deleteJobImage(jobId: string, imageUrl: string): Promise<void> {
    await this.deleteImage(imageUrl);
  }

  // ========================================
  // METHODES SPECIFIQUES POUR LE BLOG
  // ========================================

  async uploadBlogImage(blogId: string, file: File): Promise<string> {
    return this.uploadImage(file, 'blog', blogId);
  }

  async getBlogImages(blogId: string): Promise<UploadedImage[]> {
    return this.getImages('blog', blogId);
  }

  async deleteBlogImage(blogId: string, imageUrl: string): Promise<void> {
    await this.deleteImage(imageUrl);
  }

  // ========================================
  // METHODES SPECIFIQUES POUR LES PROJETS
  // ========================================

  async uploadProjectImage(projectId: string, file: File): Promise<string> {
    return this.uploadImage(file, 'project', projectId);
  }

  async getProjectImages(projectId: string): Promise<UploadedImage[]> {
    return this.getImages('project', projectId);
  }

  async deleteProjectImage(projectId: string, imageUrl: string): Promise<void> {
    await this.deleteImage(imageUrl);
  }

  // ========================================
  // METHODES SPECIFIQUES POUR LES BANNIERES
  // ========================================

  async uploadBanner(file: File): Promise<string> {
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
  // METHODES SPECIFIQUES POUR LE LOGO
  // ========================================

  async uploadLogo(file: File): Promise<string> {
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
  // METHODES SPECIFIQUES POUR LES FONDS D'ECRAN
  // ========================================

  async uploadBackground(pageKey: string, file: File): Promise<string> {
    return this.uploadImage(file, 'background', pageKey);
  }

  async getBackground(pageKey: string): Promise<UploadedImage | null> {
    const images = await this.getImages('background', pageKey);
    return images.length > 0 ? images[0] : null;
  }

  async deleteBackground(pageKey: string): Promise<void> {
    const background = await this.getBackground(pageKey);
    if (background) {
      await this.deleteImage(background.url);
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;