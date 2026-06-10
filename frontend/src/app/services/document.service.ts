// frontend/src/services/document.service.ts

'use client';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001').replace(/\/api$/, '');

export interface UploadedDocument {
  id: string;
  url: string;
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

class DocumentService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || localStorage.getItem('token');
    }
    return null;
  }

  async uploadDocument(file: File, type: 'cv' | 'cover_letter', entityId?: string): Promise<UploadedDocument> {
    // Validation
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format non supporte. Veuillez uploader un fichier PDF ou DOC/DOCX.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Fichier trop grand. Maximum 5 Mo.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    const uploadUrl = `${API_BASE_URL}/api/upload/document`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
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
    return data;
  }

  getDocumentUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  }
}

export const documentService = new DocumentService();
export default documentService;