// frontend/src/services/upload.service.ts

'use client';

export interface DatabaseImage {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  isMain: boolean;
  displayOrder: number;
  altTextFr?: string;
  altTextMg?: string;
  createdAt: string;
}

export type EntityType = 'job' | 'project' | 'blog' | 'profile' | 'background' | 'cv' | 'cover_letter';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001').replace(/\/api$/, '');

class UploadService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    return null;
  }

  async uploadImage(
    file: File, 
    entityType: EntityType = 'job', 
    entityId?: string, 
    isMain: boolean = false
  ): Promise<DatabaseImage> {
    // CORRECTION: Accepter les images ET les PDF
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validDocumentTypes = ['application/pdf'];
    
    const fileType = file.type.toLowerCase();
    const isImage = validImageTypes.includes(fileType);
    const isDocument = validDocumentTypes.includes(fileType);
    
    if (!isImage && !isDocument) {
      throw new Error('Format non supporte. JPG, PNG, WEBP, GIF, PDF uniquement.');
    }

    // CORRECTION: Taille max différente selon le type
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
    
    console.log('=== UPLOAD DEBUG ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Upload URL:', uploadUrl);
    console.log('File:', file.name, file.type, file.size);
    console.log('EntityType:', entityType);
    console.log('EntityId:', entityId);
    console.log('IsMain:', isMain);
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);

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
      console.log('Response data:', data);
      
      const image: DatabaseImage = {
        id: data.id,
        url: this.getImageUrl(data.id),
        fileName: data.fileName,
        originalName: data.originalName || data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        isMain: data.isMain || false,
        displayOrder: data.displayOrder || 0,
        altTextFr: data.altTextFr,
        altTextMg: data.altTextMg,
        createdAt: data.createdAt,
      };
      
      console.log('Fichier stocke:', image);
      console.log('=== FIN UPLOAD ===');
      
      return image;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getImages(entityType: EntityType, entityId?: string): Promise<DatabaseImage[]> {
    const params = new URLSearchParams({ entityType });
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
      throw new Error('Erreur lors de la recuperation des images');
    }

    const data = await response.json();
    
    const images = (data.images || []).map((img: any) => ({
      id: img.id,
      url: this.getImageUrl(img.id),
      fileName: img.fileName,
      originalName: img.originalName || img.fileName,
      fileSize: img.fileSize,
      mimeType: img.mimeType,
      isMain: img.isMain || false,
      displayOrder: img.displayOrder || 0,
      altTextFr: img.altTextFr,
      altTextMg: img.altTextMg,
      createdAt: img.createdAt,
    }));
    
    return images;
  }

  async getMainImage(entityType: EntityType, entityId: string): Promise<DatabaseImage | null> {
    const response = await fetch(
      `${API_BASE_URL}/api/upload/main?entityType=${entityType}&entityId=${entityId}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.image) {
      return null;
    }
    
    const img = data.image;
    return {
      id: img.id,
      url: this.getImageUrl(img.id),
      fileName: img.fileName,
      originalName: img.originalName || img.fileName,
      fileSize: img.fileSize,
      mimeType: img.mimeType,
      isMain: img.isMain || true,
      displayOrder: img.displayOrder || 0,
      altTextFr: img.altTextFr,
      altTextMg: img.altTextMg,
      createdAt: img.createdAt,
    };
  }

  async getImageById(id: string): Promise<DatabaseImage> {
    const response = await fetch(`${API_BASE_URL}/api/upload/image/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Image non trouvee');
    }

    return {
      id: id,
      url: this.getImageUrl(id),
      fileName: '',
      originalName: '',
      fileSize: 0,
      mimeType: 'image/jpeg',
      isMain: false,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
    };
  }

  async updateImageAlt(id: string, altTextFr?: string, altTextMg?: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie');
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/${id}/alt`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ altTextFr, altTextMg }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise a jour');
    }
  }

  async setMainImage(id: string, entityType: EntityType, entityId: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/upload/${id}/main?entityType=${entityType}&entityId=${entityId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors du changement d\'image principale');
    }
  }

  async deleteImage(id: string): Promise<void> {
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

  async reorderImages(imageIds: string[]): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Non authentifie');
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ imageIds }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du reordonnancement');
    }
  }

  getImageUrl(id: string): string {
    return `${API_BASE_URL}/api/upload/image/${id}`;
  }

  async checkUploadHealth(): Promise<boolean> {
    try {
      const healthUrl = `${API_BASE_URL}/api/upload/health`;
      const response = await fetch(healthUrl);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;