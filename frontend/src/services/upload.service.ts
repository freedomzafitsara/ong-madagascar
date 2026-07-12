// frontend/src/services/upload.service.ts

import api from '@/lib/api';

// ============================================================
// TYPES
// ============================================================

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: string;
  path?: string;
  type?: string;
  entityId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadOptions {
  entityType?: string;
  entityId?: string;
}

// ============================================================
// SERVICE
// ============================================================

export const uploadService = {
  /**
   * Upload d'image avec authentification
   */
  async uploadImage(file: File, type: string = 'background', entityId?: string): Promise<UploadedFile> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez etre connecte pour uploader des fichiers.');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format de fichier non supporte. Utilisez JPG, PNG, WEBP ou GIF.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux (max 5 Mo).');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // ✅ AJOUT: Envoyer les deux champs pour compatibilité
    formData.append('type', type);
    formData.append('entityType', type);
    
    if (entityId) {
      formData.append('entityId', entityId);
      formData.append('entity_id', entityId); // ✅ Compatibilité
    }

    try {
      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
      
      // ✅ Construction correcte de l'URL
      let fileUrl = data.url || data.fileUrl || data.data?.url;
      if (!fileUrl || !fileUrl.startsWith('http')) {
        if (fileUrl && fileUrl.startsWith('/uploads')) {
          fileUrl = `${baseUrl}${fileUrl}`;
        } else if (data.id) {
          fileUrl = `${baseUrl}/uploads/${type}/${data.fileName || data.id}`;
        } else {
          fileUrl = `${baseUrl}/uploads/${type}/${file.name}`;
        }
      }

      return {
        id: data.id || data.fileId || data.data?.id || '',
        url: fileUrl,
        fileName: data.filename || data.fileName || data.data?.filename || file.name,
        originalName: file.name,
        fileSize: file.size,
        format: file.type.split('/')[1] || 'unknown',
        path: data.path || data.data?.path || '',
        type: data.type || data.data?.type || type,
        entityId: data.entityId || data.data?.entityId || entityId || null,
        createdAt: data.createdAt || data.data?.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || data.data?.updatedAt || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Erreur upload:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Session expiree. Veuillez vous reconnecter pour uploader des fichiers.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload');
    }
  },

  /**
   * Upload de fichier (alias pour uploadImage)
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadedFile> {
    const { entityType = 'background', entityId } = options;
    return this.uploadImage(file, entityType, entityId);
  },

  /**
   * Recupere l'URL complete d'une image a partir de son ID
   */
  getImageUrl(id: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
    return `${baseUrl}/uploads/${id}`;
  },

  /**
   * Recupere l'URL relative d'une image (pour les appels API)
   */
  getImageUrlRelative(id: string): string {
    return `/api/upload/file/${id}`;
  },

  /**
   * Recupere l'URL complete d'un fichier (alias pour getImageUrl)
   */
  getFileUrl(id: string): string {
    return this.getImageUrl(id);
  },

  /**
   * Suppression d'une image
   */
  async deleteImage(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID du fichier requis pour la suppression.');
    }

    try {
      await api.delete(`/upload/${id}`);
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Session expiree. Veuillez vous reconnecter.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  },

  /**
   * Upload de plusieurs images
   */
  async uploadMultiple(files: File[], type: string = 'background', entityId?: string): Promise<UploadedFile[]> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez etre connecte pour uploader des fichiers.');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      throw new Error('Certains fichiers ont un format non supporte.');
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('type', type);
    formData.append('entityType', type);
    if (entityId) {
      formData.append('entityId', entityId);
      formData.append('entity_id', entityId);
    }

    try {
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';

      return data.map((item: any) => ({
        id: item.id || item.fileId || item.data?.id || '',
        url: item.url || item.fileUrl || item.data?.url || `${baseUrl}/uploads/${type}/${item.filename || item.id}`,
        fileName: item.filename || item.fileName || item.data?.filename || '',
        originalName: item.originalName || item.data?.originalName || '',
        fileSize: item.size || item.data?.size || 0,
        format: item.format || item.data?.format || 'unknown',
        path: item.path || item.data?.path || '',
        type: item.type || item.data?.type || type,
        entityId: item.entityId || item.data?.entityId || entityId || null,
        createdAt: item.createdAt || item.data?.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || item.data?.updatedAt || new Date().toISOString(),
      }));
    } catch (error: any) {
      console.error('Erreur upload multiple:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Session expiree. Veuillez vous reconnecter.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload');
    }
  },

  /**
   * Recuperation des fichiers par entite
   */
  async getFilesByEntity(entityId: string, type: string): Promise<UploadedFile[]> {
    if (!entityId || !type) {
      throw new Error('ID de l\'entite et type requis.');
    }

    try {
      const response = await api.get(`/upload/entity/${type}/${entityId}`);
      const data = response.data;
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';

      return (data.data || data || []).map((item: any) => ({
        id: item.id || item.fileId || '',
        url: item.url || item.fileUrl || `${baseUrl}/uploads/${type}/${item.filename || item.id}`,
        fileName: item.filename || item.fileName || '',
        originalName: item.originalName || '',
        fileSize: item.size || item.fileSize || 0,
        format: item.format || 'unknown',
        path: item.path || '',
        type: item.type || type,
        entityId: item.entityId || entityId,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
    } catch (error: any) {
      console.error('Erreur recuperation fichiers:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la recuperation des fichiers');
    }
  },

  /**
   * Genere une URL d'image a partir de l'objet UploadedFile
   */
  getFullUrl(file: UploadedFile | null | undefined): string | null {
    if (!file) return null;
    if (file.url) return file.url;
    if (file.id) return this.getImageUrl(file.id);
    return null;
  },

  /**
   * Verifie si un fichier est une image
   */
  isImage(file: File | UploadedFile): boolean {
    if (file instanceof File) {
      return file.type.startsWith('image/');
    }
    const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'];
    return imageFormats.includes(file.format?.toLowerCase() || '');
  },

  /**
   * Formate la taille du fichier en unites lisibles
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Verifie si le fichier est valide
   */
  isValidImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Format non supporte' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Taille maximale 5 Mo' };
    }
    if (file.size === 0) {
      return { valid: false, error: 'Fichier vide' };
    }
    return { valid: true };
  }
};

export default uploadService;