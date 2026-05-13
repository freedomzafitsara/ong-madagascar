// E:\projet-ymad\frontend\src\services\imageService.ts
// Service de gestion d'images - Version finale

import api from '@/lib/api';

// ============================================
// BANNIÈRES
// ============================================

export const getBanner = async () => {
  try {
    const response = await api.get('/banners');
    return response.data;
  } catch {
    return null;
  }
};

export const saveBanner = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/banner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBanner = async (id: string) => {
  await api.delete(`/banners/${id}`);
};

// ============================================
// LOGOS
// ============================================

export const getLogo = async () => {
  try {
    const response = await api.get('/logo');
    return response.data;
  } catch {
    return null;
  }
};

export const saveLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteLogo = async (id: string) => {
  await api.delete(`/logo/${id}`);
};

// ============================================
// PROJETS (pour les pages publiques)
// ============================================

export const getAllProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getMainImageUrl = (project: any): string => {
  return project?.imageUrl || project?.cover_image_url || '/images/placeholder-project.jpg';
};

export const getProjectImages = (project: any): string[] => {
  return project?.galleryImages || project?.gallery_images || [];
};