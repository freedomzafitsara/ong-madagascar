// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==================== TAILWIND ====================

/**
 * Fusionne les classes Tailwind CSS
 * Utilisation: cn('bg-red-500', 'hover:bg-red-600', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== FORMATAGE DE DATES ====================

/**
 * Formate une date au format JJ/MM/AAAA
 * @example formatDate('2024-01-15') // "15/01/2024"
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Formate une date avec heure
 * @example formatDateTime('2024-01-15T14:30:00') // "15/01/2024 14:30"
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', {
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

/**
 * Formate une date en français (long)
 * @example formatDateLong('2024-01-15') // "15 janvier 2024"
 */
export const formatDateLong = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Formate une date relative (ex: "il y a 2 jours")
 * @example formatRelativeDate('2024-01-13') // "il y a 2 jours"
 */
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
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffWeeks < 4) return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
    if (diffMonths < 12) return `il y a ${diffMonths} mois`;
    return formatDateLong(d);
  } catch {
    return '';
  }
};

// ==================== FORMATAGE MONNAIE ====================

/**
 * Formate un montant en monnaie locale (Ariary)
 * @example formatCurrency(1500000) // "1 500 000 Ar"
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = 'MGA'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 Ar';
  
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  let result = formatter.format(amount);
  // Remplacer le symbole par 'Ar' pour l'Ariary
  if (currency === 'MGA') {
    result = result.replace('MGA', 'Ar').replace('Ar', 'Ar').trim();
  }
  return result;
};

/**
 * Formate un montant avec abréviation (K, M, B)
 * @example formatCurrencyShort(1500000) // "1.5M Ar"
 */
export const formatCurrencyShort = (amount: number | null | undefined): string => {
  if (!amount) return '0 Ar';
  
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B Ar`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M Ar`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K Ar`;
  }
  return `${amount} Ar`;
};

// ==================== FORMATAGE TEXTE ====================

/**
 * Tronque un texte à une longueur maximale
 * @example truncateText('Très long texte...', 10) // "Très long..."
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Met la première lettre en majuscule
 * @example capitalize('madagascar') // "Madagascar"
 */
export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Met en majuscule chaque mot
 * @example capitalizeWords('jean rakotomalala') // "Jean Rakotomalala"
 */
export const capitalizeWords = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

// ==================== SLUG ET URL ====================

/**
 * Génère un slug à partir d'un texte
 * @example generateSlug('Projet Éducation à Madagascar') // "projet-education-a-madagascar"
 */
export const generateSlug = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ==================== NOMBRES ET STATISTIQUES ====================

/**
 * Formate un nombre avec séparateurs de milliers
 * @example formatNumber(12500) // "12 500"
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Calcule un pourcentage
 * @example calculatePercentage(50, 200) // 25
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Formate un pourcentage
 * @example formatPercentage(25) // "25%"
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
};

// ==================== VALIDATION ====================

/**
 * Vérifie si une chaîne est un email valide
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return regex.test(email);
};

/**
 * Vérifie si une chaîne est un numéro de téléphone malgache
 * Formats: 0341234567, +261341234567, 034 12 345 67
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const regex = /^(?:(?:\+261|0)[234])\d{8}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Nettoie un numéro de téléphone
 * @example cleanPhoneNumber('034 12 345 67') // "0341234567"
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\s/g, '').replace(/^\+261/, '0');
};

// ==================== LOCAL STORAGE ====================

/**
 * Sauvegarde des données dans localStorage avec expiration
 */
export const setLocalStorageWithExpiry = (key: string, value: any, ttlMinutes: number = 60): void => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttlMinutes * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Récupère des données du localStorage avec vérification d'expiration
 */
export const getLocalStorageWithExpiry = (key: string): any | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
};

// ==================== COULEURS ET BADGES ====================

/**
 * Retourne la classe CSS pour un statut de projet
 */
export const getProjectStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

/**
 * Retourne le libellé d'un statut de projet
 */
export const getProjectStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Actif',
    completed: 'Terminé',
    draft: 'Brouillon',
    cancelled: 'Annulé',
  };
  return labels[status] || status;
};

/**
 * Retourne la classe CSS pour un type de contrat
 */
export const getContractTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    CDI: 'bg-blue-100 text-blue-700',
    CDD: 'bg-purple-100 text-purple-700',
    Stage: 'bg-orange-100 text-orange-700',
    Volontariat: 'bg-green-100 text-green-700',
    Alternance: 'bg-indigo-100 text-indigo-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

// ==================== TAILLE DE FICHIER ====================

/**
 * Formate une taille de fichier en unité lisible
 * @example formatFileSize(1536000) // "1.5 Mo"
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 o';
  const k = 1024;
  const sizes = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// ==================== GÉNÉRATION ID ====================

/**
 * Génère un ID unique
 * @example generateUniqueId() // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 */
export const generateUniqueId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Génère un ID court
 * @example generateShortId() // "a1b2c3d4"
 */
export const generateShortId = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};