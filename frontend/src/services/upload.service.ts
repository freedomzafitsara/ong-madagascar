// frontend/src/services/upload.service.ts

'use client';

// ============================================================
// TYPES ET INTERFACES
// ============================================================

export type EntityType = 'job' | 'project' | 'blog' | 'profile' | 'background' | 'cv' | 'cover_letter';

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: string;
  type: string;
  entityId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  success: boolean;
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: string;
  type: string;
  entityId: string | null;
  createdAt: string;
}

export interface UploadOptions {
  entityType: EntityType;
  entityId?: string;
  isMain?: boolean;
}

// ============================================================
// CONSTANTES
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

// ============================================================
// SERVICE
// ============================================================

class UploadService {
  
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    return null;
  }

  validateFile(file: File, type: 'image' | 'document' = 'image'): { valid: boolean; error?: string } {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validDocumentTypes = ['application/pdf'];
    
    const fileType = file.type.toLowerCase();
    
    if (type === 'image' && !validImageTypes.includes(fileType)) {
      return { 
        valid: false, 
        error: 'Format non supporte. Utilisez JPG, PNG, WEBP ou GIF.' 
      };
    }
    
    if (type === 'document' && !validDocumentTypes.includes(fileType)) {
      return { 
        valid: false, 
        error: 'Format non supporte. Utilisez PDF uniquement.' 
      };
    }
    
    const maxSize = type === 'document' ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Fichier trop grand. Maximum ${type === 'document' ? '100' : '5'} Mo.` 
      };
    }
    
    return { valid: true };
  }

  // ✅ CORRECTION: Utiliser la bonne URL /api/upload/single
  async uploadImage(
    file: File,
    options: UploadOptions
  ): Promise<UploadResponse> {
    // Validation du fichier
    const validation = this.validateFile(file, 'image');
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Vérification de l'authentification
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie. Veuillez vous reconnecter.');
    }

    // Construction du FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', options.entityType);
    
    if (options.entityId) {
      formData.append('entityId', options.entityId);
    }
    if (options.isMain !== undefined) {
      formData.append('isMain', String(options.isMain));
    }

    // ✅ URL CORRECTE: /upload/single (pas /upload/profile)
    const uploadUrl = `${API_BASE_URL}/upload/single`;
    
    console.log(`[Upload] ${file.name} (${file.type}) - ${(file.size / 1024).toFixed(0)} KB`);
    console.log(`[Upload] URL: ${uploadUrl}`);

    try {
      const response = await fetch(uploadUrl, {
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
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      console.log(`[Upload] Succès: ${data.id} - ${data.fileName}`);
      
      return {
        success: data.success,
        id: data.id,
        url: this.getImageUrl(data.id),
        fileName: data.fileName || data.filename || '',
        originalName: data.originalName || data.original_name || file.name,
        fileSize: data.fileSize || data.size || file.size,
        format: data.format || data.mimeType || this.getExtensionFromFile(file),
        type: data.type || options.entityType,
        entityId: data.entityId || options.entityId || null,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      
    } catch (error) {
      console.error('[Upload] Erreur:', error);
      throw error;
    }
  }

  private getExtensionFromFile(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return ext;
  }

  // ✅ CORRECTION: URL correcte pour récupérer les fichiers
  async getFiles(entityType: EntityType, entityId?: string): Promise<UploadedFile[]> {
    try {
      const token = this.getToken();
      const params = new URLSearchParams({ type: entityType });
      if (entityId) {
        params.append('entityId', entityId);
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // ✅ URL CORRECTE: /upload?type=...
      const response = await fetch(`${API_BASE_URL}/upload?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recuperation des fichiers');
      }

      const data = await response.json();
      
      const files = (data.files || []).map((file: any) => ({
        id: file.id,
        url: this.getImageUrl(file.id),
        fileName: file.fileName || file.filename || '',
        originalName: file.originalName || file.original_name || '',
        fileSize: file.fileSize || file.size || 0,
        format: file.format || file.mimeType || '',
        type: file.type || entityType,
        entityId: file.entityId || null,
        createdAt: file.createdAt || new Date().toISOString(),
        updatedAt: file.updatedAt || new Date().toISOString(),
      }));
      
      return files;
      
    } catch (error) {
      console.error('[Upload] Erreur récupération fichiers:', error);
      throw error;
    }
  }

  // ✅ CORRECTION: URL correcte pour récupérer un fichier
  async getFile(id: string): Promise<UploadedFile> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/file/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Fichier non trouve');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        url: this.getImageUrl(data.id),
        fileName: data.fileName || data.filename || '',
        originalName: data.originalName || data.original_name || '',
        fileSize: data.fileSize || data.size || 0,
        format: data.format || data.mimeType || '',
        type: data.type || '',
        entityId: data.entityId || null,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
      
    } catch (error) {
      console.error('[Upload] Erreur récupération fichier:', error);
      throw error;
    }
  }

  // ✅ CORRECTION: URL correcte pour supprimer un fichier
  async deleteFile(id: string): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      const data = await response.json();
      console.log(`[Upload] Fichier supprimé: ${id}`);
      return data;
      
    } catch (error) {
      console.error('[Upload] Erreur suppression:', error);
      throw error;
    }
  }

  // ✅ CORRECTION: URL correcte pour la santé du service
  async checkHealth(): Promise<{ status: string; uploadsDirectory: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Service indisponible');
      }

      return await response.json();
      
    } catch (error) {
      console.error('[Upload] Health check échoué:', error);
      throw error;
    }
  }

  // ============================================================
  // UTILITAIRES
  // ============================================================

  getImageUrl(id: string): string {
    return `${API_BASE_URL}/upload/file/${id}`;
  }

  getImageUrlFromFile(file: UploadedFile): string {
    return file.url || this.getImageUrl(file.id);
  }

  isImage(file: UploadedFile): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const format = file.format?.toLowerCase() || '';
    const type = file.type?.toLowerCase() || '';
    return imageTypes.some(t => format.includes(t) || type.includes(t));
  }

  isPDF(file: UploadedFile): boolean {
    const format = file.format?.toLowerCase() || '';
    const type = file.type?.toLowerCase() || '';
    return format === 'pdf' || type === 'application/pdf';
  }
}

// ============================================================
// EXPORT DE L'INSTANCE UNIQUE
// ============================================================

export const uploadService = new UploadService();

export default uploadService;