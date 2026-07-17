// frontend/src/types/upload.ts

export interface UploadedFile {
  id: string;
  url: string;
  filePath: string;
  filename: string;
  originalName: string;
  format: string;
  size: number;
  type: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
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
  entityId: string;
  createdAt: string;
}