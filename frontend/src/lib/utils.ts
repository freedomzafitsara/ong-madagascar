// src/lib/utils.ts
// Version finale - Y-MaD Platform
// Association: Young for Madagascar Development
// Theme: Gestion des offres d'emploi

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// 1. TAILWIND CSS - Fusion de classes
// ============================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// 2. FORMATAGE DES DATES
// ============================================================

export const formatDate = (
  date: string | Date | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString(locale === 'mg' ? 'mg-MG' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export const formatDateTime = (
  date: string | Date | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString(locale === 'mg' ? 'mg-MG' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const formatRelativeDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'a l instant';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(d);
  } catch {
    return '';
  }
};

// ============================================================
// 3. FORMATAGE TEXTE
// ============================================================

export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 100
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const generateSlug = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================================
// 4. VALIDATION
// ============================================================

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return regex.test(email);
};

// ============================================================
// 5. FORMATAGE DES NOMBRES
// ============================================================

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// ============================================================
// 6. COULEURS ET BADGES POUR LES OFFRES D'EMPLOI
// ============================================================

export const getContractTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'CDI': 'bg-blue-100 text-blue-700',
    'CDD': 'bg-purple-100 text-purple-700',
    'STAGE': 'bg-orange-100 text-orange-700',
    'FREELANCE': 'bg-indigo-100 text-indigo-700',
    'BENEVOLE': 'bg-green-100 text-green-700',
    'ALTERNANCE': 'bg-cyan-100 text-cyan-700',
    'TEMPORARY': 'bg-gray-100 text-gray-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

export const getContractTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'CDI': 'CDI',
    'CDD': 'CDD',
    'STAGE': 'Stage',
    'FREELANCE': 'Freelance',
    'BENEVOLE': 'Bénévolat',
    'ALTERNANCE': 'Alternance',
    'TEMPORARY': 'Temporaire',
  };
  return labels[type] || type;
};

export const getJobStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-700',
    'published': 'bg-green-100 text-green-700',
    'closed': 'bg-red-100 text-red-700',
    'expired': 'bg-yellow-100 text-yellow-700',
    'archived': 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getJobStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'draft': 'Brouillon',
    'published': 'Publiee',
    'closed': 'Fermee',
    'expired': 'Expiree',
    'archived': 'Archivee',
  };
  return labels[status] || status;
};

export const getApplicationStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'submitted': 'bg-yellow-100 text-yellow-700',
    'reviewing': 'bg-blue-100 text-blue-700',
    'shortlisted': 'bg-purple-100 text-purple-700',
    'accepted': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getApplicationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'submitted': 'Soumise',
    'reviewing': 'En revision',
    'shortlisted': 'Preselectionnee',
    'accepted': 'Acceptee',
    'rejected': 'Refusee',
  };
  return labels[status] || status;
};

// ============================================================
// 7. PROJETS
// ============================================================

export const getProjectStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-700',
    'completed': 'bg-blue-100 text-blue-700',
    'planning': 'bg-yellow-100 text-yellow-700',
    'draft': 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getProjectStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'active': 'Actif',
    'completed': 'Termine',
    'planning': 'En planification',
    'draft': 'Brouillon',
  };
  return labels[status] || status;
};

// ============================================================
// 8. BLOG
// ============================================================

export const getPostStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-700',
    'published': 'bg-green-100 text-green-700',
    'archived': 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getPostStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'draft': 'Brouillon',
    'published': 'Publie',
    'archived': 'Archive',
  };
  return labels[status] || status;
};

// ============================================================
// 9. GESTION DES FICHIERS - CORRIGE
// ============================================================

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 o';
  
  const k = 1024;
  const sizes = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Construit l'URL complète d'une image
 * Supporte tous les formats d'URL
 * Retourne la chaîne complète ou l'URL par défaut
 */
export const getFileUrl = (url: string | null | undefined, defaultUrl: string = '/images/placeholder.jpg'): string => {
  if (!url) return defaultUrl;
  
  // Si l'URL est déjà complète
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4001';
  
  // ✅ Nettoyer les doubles slashes
  const cleanUrl = url.replace(/^\/+/, '');
  
  // ✅ Si l'URL commence par api/uploads
  if (cleanUrl.startsWith('api/uploads/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // ✅ Si l'URL commence par uploads
  if (cleanUrl.startsWith('uploads/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // ✅ Si l'URL commence par api/upload/file
  if (cleanUrl.startsWith('api/upload/file/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // ✅ Si l'URL commence par api/upload
  if (cleanUrl.startsWith('api/upload/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // ✅ Si l'URL est un chemin simple (sans slash)
  if (!cleanUrl.includes('/')) {
    return `${baseUrl}/${cleanUrl}`;
  }
  
  // Autre cas
  return `${baseUrl}/${cleanUrl}`;
};

/**
 * Extrait le nom de fichier d'une URL
 */
export const getFileNameFromUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1] || '';
};

/**
 * Vérifie si une URL est une image
 */
export const isImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const urlLower = url.toLowerCase();
  return extensions.some(ext => urlLower.includes(ext));
};

/**
 * Alias pour getFileUrl (compatibilité)
 */
export const buildImageUrl = getFileUrl;

// ============================================================
// 10. FONCTIONS UTILITAIRES
// ============================================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ============================================================
// 11. GESTION DES FONDS D'ECRAN
// ============================================================

/**
 * Construit l'URL complète pour un fond d'écran
 */
export const getBackgroundImageUrl = (background: { image_url?: string | null } | null | undefined): string | null => {
  if (!background || !background.image_url) return null;
  return getFileUrl(background.image_url);
};

/**
 * Styles CSS pour le fond d'écran
 */
export const getBackgroundStyles = (
  background: { image_url?: string | null; position?: string; is_active?: boolean } | null | undefined,
  overlayOpacity: number = 45
): React.CSSProperties => {
  const imageUrl = getBackgroundImageUrl(background);
  
  if (!imageUrl || !background?.is_active) {
    return {
      background: 'linear-gradient(135deg, #1e3a8a, #1e40af, #1d4ed8)',
    };
  }
  
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: background?.position || 'center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
  };
};

/**
 * Styles CSS pour l'overlay du fond d'écran
 */
export const getBackgroundOverlayStyles = (opacity: number = 45): React.CSSProperties => {
  return {
    backgroundColor: `rgba(0, 0, 0, ${Math.min(Math.max(opacity, 0), 100) / 100})`,
  };
};

// ============================================================
// 12. EXPORT PAR DEFAUT
// ============================================================

export default {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  truncateText,
  capitalize,
  capitalizeWords,
  generateSlug,
  isValidEmail,
  formatNumber,
  calculatePercentage,
  getContractTypeColor,
  getContractTypeLabel,
  getJobStatusColor,
  getJobStatusLabel,
  getApplicationStatusColor,
  getApplicationStatusLabel,
  getProjectStatusColor,
  getProjectStatusLabel,
  getPostStatusColor,
  getPostStatusLabel,
  formatFileSize,
  getFileUrl,
  getFileNameFromUrl,
  isImageUrl,
  buildImageUrl,
  debounce,
  delay,
  copyToClipboard,
  getBackgroundImageUrl,
  getBackgroundStyles,
  getBackgroundOverlayStyles,
};