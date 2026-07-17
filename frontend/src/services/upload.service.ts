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
// CONSTANTES
// ============================================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 Mo

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
};

const buildImageUrl = (id?: string, fileName?: string, type?: string): string => {
  const baseUrl = getBaseUrl();
  if (id) {
    return `${baseUrl}/uploads/${id}`;
  }
  if (fileName && type) {
    return `${baseUrl}/uploads/${type}/${fileName}`;
  }
  return `${baseUrl}/uploads`;
};

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

    // ✅ Validation du type de fichier
    const validTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Format de fichier non supporte. Types acceptes: JPG, PNG, WEBP, GIF, SVG, BMP, PDF. Format recu: ${file.type}`);
    }

    // ✅ Verification de la taille
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new Error(`Le fichier est trop volumineux (max ${maxSize / 1024 / 1024} Mo).`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('entityType', type);
    
    if (entityId) {
      formData.append('entityId', entityId);
      formData.append('entity_id', entityId);
    }

    try {
      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      const baseUrl = getBaseUrl();
      
      // ✅ Construction correcte de l'URL
      let fileUrl = data.url || data.fileUrl || data.data?.url;
      
      if (!fileUrl) {
        if (data.id) {
          fileUrl = buildImageUrl(data.id);
        } else if (data.fileName) {
          fileUrl = buildImageUrl(undefined, data.fileName, type);
        } else {
          fileUrl = `${baseUrl}/uploads/${type}/${file.name}`;
        }
      } else if (!fileUrl.startsWith('http')) {
        if (fileUrl.startsWith('/uploads')) {
          fileUrl = `${baseUrl}${fileUrl}`;
        } else if (fileUrl.startsWith('/')) {
          fileUrl = `${baseUrl}${fileUrl}`;
        } else {
          fileUrl = `${baseUrl}/${fileUrl}`;
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
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de l\'upload';
      throw new Error(errorMsg);
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
    return buildImageUrl(id);
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
      const baseUrl = getBaseUrl();

      // ✅ Si la reponse est un objet avec data
      const items = Array.isArray(data) ? data : (data.data || data.files || []);
      
      return items.map((item: any) => {
        let fileUrl = item.url || item.fileUrl || item.data?.url;
        if (!fileUrl) {
          fileUrl = buildImageUrl(item.id, item.filename || item.fileName, type);
        } else if (!fileUrl.startsWith('http')) {
          fileUrl = `${baseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
        }

        return {
          id: item.id || item.fileId || item.data?.id || '',
          url: fileUrl,
          fileName: item.filename || item.fileName || item.data?.filename || '',
          originalName: item.originalName || item.data?.originalName || '',
          fileSize: item.size || item.data?.size || 0,
          format: item.format || item.data?.format || 'unknown',
          path: item.path || item.data?.path || '',
          type: item.type || item.data?.type || type,
          entityId: item.entityId || item.data?.entityId || entityId || null,
          createdAt: item.createdAt || item.data?.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.data?.updatedAt || new Date().toISOString(),
        };
      });
    } catch (error: any) {
      console.error('Erreur upload multiple:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Session expiree. Veuillez vous reconnecter.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload');
    }
  },

  /**
   * Recuperation des fichiers par entite - CORRIGE
   */
  async getFilesByEntity(entityId: string, type: string): Promise<UploadedFile[]> {
    if (!entityId || !type) {
      throw new Error('ID de l\'entite et type requis.');
    }

    try {
      const response = await api.get(`/upload/entity/${type}/${entityId}`);
      const data = response.data;
      
      const baseUrl = getBaseUrl();

      // ✅ Extraction robuste des fichiers
      let files: any[] = [];
      
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          files = data;
        } else if (Array.isArray(data.data)) {
          files = data.data;
        } else if (Array.isArray(data.files)) {
          files = data.files;
        } else if (data.success && Array.isArray(data.files)) {
          files = data.files;
        }
      }

      return files.map((item: any) => ({
        id: item.id || item.fileId || '',
        url: item.url || item.fileUrl || buildImageUrl(item.id, item.filename || item.fileName, type),
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
      return []; // ✅ Retourner un tableau vide en cas d'erreur
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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `Format non supporte. Types acceptes: JPG, PNG, WEBP, GIF, SVG, BMP. Format recu: ${file.type}` };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { valid: false, error: `Taille maximale ${MAX_IMAGE_SIZE / 1024 / 1024} Mo.` };
    }
    if (file.size === 0) {
      return { valid: false, error: 'Fichier vide' };
    }
    return { valid: true };
  },

  /**
   * Verifie si le fichier est un PDF valide
   */
  isValidPdf(file: File): { valid: boolean; error?: string } {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Format PDF uniquement' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `Taille maximale ${MAX_FILE_SIZE / 1024 / 1024} Mo.` };
    }
    if (file.size === 0) {
      return { valid: false, error: 'Fichier vide' };
    }
    return { valid: true };
  }
};

export default uploadService;