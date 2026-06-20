// frontend/src/services/upload.service.ts

import api from '@/lib/api';

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  format: string;
}

export const uploadService = {
  // Upload d'image avec authentification
  async uploadImage(file: File, type: string = 'background', entityId?: string): Promise<UploadedFile> {
    // ✅ Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('Vous devez être connecté pour uploader des fichiers.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    try {
      // ✅ Utiliser l'instance api qui inclut déjà le token
      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      return {
        id: data.id || data.fileId,
        url: data.url || data.fileUrl || data.data?.url,
        fileName: data.filename || data.fileName || data.data?.filename || file.name,
        originalName: file.name,
        fileSize: file.size,
        format: file.type.split('/')[1] || 'unknown',
      };
    } catch (error: any) {
      console.error('Erreur upload:', error);
      
      // ✅ Gestion spécifique des erreurs d'authentification
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Session expirée. Veuillez vous reconnecter pour uploader des fichiers.');
      }
      
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload');
    }
  },

  getImageUrl(id: string): string {
    return `/api/upload/file/${id}`;
  },

  async deleteImage(id: string): Promise<void> {
    try {
      await api.delete(`/upload/${id}`);
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  },
};