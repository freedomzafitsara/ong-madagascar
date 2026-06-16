// frontend/src/services/upload.service.ts

'use client';

// ============================================================
// INTERFACES
// ============================================================

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
}

export type EntityType = 'job' | 'project' | 'blog' | 'profile' | 'background' | 'cv' | 'cover_letter';

// ============================================================
// CONSTANTES
// ============================================================

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001').replace(/\/api$/, '');

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

  // ============================================================
  // UPLOAD
  // ============================================================

  async uploadImage(
    file: File, 
    entityType: EntityType = 'job', 
    entityId?: string, 
    isMain: boolean = false
  ): Promise<UploadedFile> {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validDocumentTypes = ['application/pdf'];
    
    const fileType = file.type.toLowerCase();
    const isImage = validImageTypes.includes(fileType);
    const isDocument = validDocumentTypes.includes(fileType);
    
    if (!isImage && !isDocument) {
      throw new Error('Format non supporte. JPG, PNG, WEBP, GIF, PDF uniquement.');
    }

    const maxSize = isDocument ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`Fichier trop grand. Maximum ${isDocument ? '100' : '5'} Mo.`);
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie. Veuillez vous reconnecter.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    if (entityId) {
      formData.append('entityId', entityId);
    }
    formData.append('isMain', String(isMain));

    const uploadUrl = `${API_BASE_URL}/api/upload/single`;
    
    console.log('Upload:', file.name, file.type, file.size);
    
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
      
      // Convertir la réponse en UploadedFile
      const uploadedFile: UploadedFile = {
        id: data.id,
        url: this.getImageUrl(data.id),
        fileName: data.fileName || data.filename || '',
        originalName: data.originalName || data.original_name || file.name,
        fileSize: data.fileSize || data.size || file.size,
        format: data.format || data.mimeType || this.getExtensionFromFile(file),
        type: data.type || entityType,
        entityId: data.entityId || entityId || null,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      
      console.log('Fichier stocke:', uploadedFile.id);
      
      return uploadedFile;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  private getExtensionFromFile(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return ext;
  }

  // ============================================================
  // RECUPERATION DES FICHIERS
  // ============================================================

  async getFiles(entityType: EntityType, entityId?: string): Promise<UploadedFile[]> {
    const params = new URLSearchParams({ type: entityType });
    if (entityId) {
      params.append('entityId', entityId);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    }));
    
    return files;
  }

  async getFile(id: string): Promise<UploadedFile> {
    const response = await fetch(`${API_BASE_URL}/api/upload/file/${id}`, {
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
    };
  }

  async getMainFile(entityType: EntityType, entityId: string): Promise<UploadedFile | null> {
    const files = await this.getFiles(entityType, entityId);
    return files.length > 0 ? files[0] : null;
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

  async deleteFile(id: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie');
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }
  }

  async deleteFilesByEntity(entityType: EntityType, entityId: string): Promise<void> {
    const files = await this.getFiles(entityType, entityId);
    for (const file of files) {
      await this.deleteFile(file.id);
    }
  }

  // ============================================================
  // UTILITAIRES
  // ============================================================

  getImageUrl(id: string): string {
    return `${API_BASE_URL}/api/upload/file/${id}`;
  }

  getImageUrlFromFile(file: UploadedFile): string {
    return file.url || this.getImageUrl(file.id);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;