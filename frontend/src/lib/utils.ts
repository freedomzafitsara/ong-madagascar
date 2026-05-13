// src/lib/utils.ts
// Version finale - Y-Mad Platform
// Auteur: Équipe technique Y-Mad
// Dernière mise à jour: 2025

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================
// 1. TAILWIND CSS - Fusion de classes
// ============================================================

/**
 * Fusionne et optimise les classes Tailwind CSS
 * Évite les conflits et les doublons
 * 
 * @example
 * cn('bg-red-500', 'hover:bg-red-600', className)
 * // Retourne: "bg-red-500 hover:bg-red-600"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================
// 2. FORMATAGE DES DATES
// ============================================================

/**
 * Formate une date au format JJ/MM/AAAA
 * 
 * @param date - Date à formater (string, Date ou null)
 * @param locale - Langue ('fr-FR' ou 'mg-MG')
 * @returns Date formatée ou chaîne vide
 * 
 * @example
 * formatDate('2024-01-15') // "15/01/2024"
 * formatDate('2024-01-15', 'mg-MG') // "15/01/2024"
 */
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

/**
 * Formate une date avec l'heure (JJ/MM/AAAA HH:MM)
 * 
 * @param date - Date à formater
 * @param locale - Langue ('fr-FR' ou 'mg-MG')
 * @returns Date et heure formatées
 * 
 * @example
 * formatDateTime('2024-01-15T14:30:00') // "15/01/2024 14:30"
 */
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

/**
 * Formate une date en format long (ex: "15 janvier 2024")
 * 
 * @param date - Date à formater
 * @param locale - Langue ('fr-FR' ou 'mg-MG')
 * @returns Date formatée en toutes lettres
 * 
 * @example
 * formatDateLong('2024-01-15') // "15 janvier 2024"
 */
export const formatDateLong = (
  date: string | Date | null | undefined,
  locale: string = 'fr-FR'
): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString(locale === 'mg' ? 'mg-MG' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

/**
 * Formate une date en temps relatif (ex: "il y a 2 jours")
 * 
 * @param date - Date à formater
 * @returns Date relative en français
 * 
 * @example
 * formatRelativeDate('2024-01-13') // "il y a 2 jours"
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

// ============================================================
// 3. FORMATAGE MONNAIE (Ariary)
// ============================================================

/**
 * Formate un montant en monnaie locale (Ariary)
 * 
 * @param amount - Montant à formater
 * @param currency - Code devise ('MGA', 'EUR', 'USD')
 * @returns Montant formaté avec symbole
 * 
 * @example
 * formatCurrency(1500000) // "1 500 000 Ar"
 * formatCurrency(100, 'EUR') // "100,00 €"
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'MGA'
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 Ar';
  
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'MGA' ? 0 : 2,
  });
  
  let result = formatter.format(amount);
  
  // Personnalisation pour l'Ariary malgache
  if (currency === 'MGA') {
    result = result.replace('MGA', 'Ar').replace('Ar', 'Ar').trim();
  }
  
  return result;
};

/**
 * Formate un montant avec abréviation (K, M, B)
 * Idéal pour les tableaux de bord et graphiques
 * 
 * @param amount - Montant à formater
 * @returns Montant abrégé
 * 
 * @example
 * formatCurrencyShort(1500000) // "1.5M Ar"
 * formatCurrencyShort(50000000) // "50M Ar"
 */
export const formatCurrencyShort = (amount: number | null | undefined): string => {
  if (!amount || isNaN(amount)) return '0 Ar';
  
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

// ============================================================
// 4. FORMATAGE TÉLÉPHONE (Madagascar)
// ============================================================

/**
 * Formate un numéro de téléphone malgache pour l'affichage
 * 
 * @param phone - Numéro à formater
 * @returns Numéro formaté (ex: "034 12 345 67")
 * 
 * @example
 * formatPhoneNumber('0341234567') // "034 12 345 67"
 * formatPhoneNumber('+261341234567') // "034 12 345 67"
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  // Format 10 chiffres: 0341234567 → 034 12 345 67
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  // Format international: +261341234567 → 034 12 345 67
  if (cleaned.length === 12 && cleaned.startsWith('261')) {
    return '0' + cleaned.slice(2).replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
};

/**
 * Nettoie un numéro de téléphone pour le stockage
 * 
 * @param phone - Numéro à nettoyer
 * @returns Numéro nettoyé (ex: "0341234567")
 * 
 * @example
 * cleanPhoneNumber('034 12 345 67') // "0341234567"
 * cleanPhoneNumber('+261341234567') // "0341234567"
 */
export const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\s/g, '').replace(/^\+261/, '0');
};

/**
 * Vérifie si un numéro de téléphone malgache est valide
 * 
 * @param phone - Numéro à vérifier
 * @returns true si le numéro est valide
 * 
 * @example
 * isValidPhoneNumber('0341234567') // true
 * isValidPhoneNumber('+261341234567') // true
 * isValidPhoneNumber('123456') // false
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(?:(?:\+261|0)[234])\d{8}$/;
  return regex.test(cleaned);
};

// ============================================================
// 5. FORMATAGE TEXTE
// ============================================================

/**
 * Tronque un texte à une longueur maximale
 * 
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale (défaut: 100)
 * @returns Texte tronqué avec "..."
 * 
 * @example
 * truncateText('Très long texte...', 10) // "Très long..."
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 100
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Met la première lettre en majuscule
 * 
 * @param str - Chaîne à transformer
 * @returns Première lettre en majuscule
 * 
 * @example
 * capitalize('madagascar') // "Madagascar"
 */
export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Met en majuscule la première lettre de chaque mot
 * 
 * @param str - Chaîne à transformer
 * @returns Chaque mot avec majuscule
 * 
 * @example
 * capitalizeWords('jean rakotomalala') // "Jean Rakotomalala"
 */
export const capitalizeWords = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Génère un slug SEO-friendly à partir d'un texte
 * 
 * @param text - Texte à convertir en slug
 * @returns Slug sans accents ni caractères spéciaux
 * 
 * @example
 * generateSlug('Projet Éducation à Madagascar') // "projet-education-a-madagascar"
 */
export const generateSlug = (text: string | null | undefined): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplace les espaces par des tirets
    .replace(/^-+|-+$/g, '');         // Supprime les tirets en début/fin
};

// ============================================================
// 6. VALIDATION
// ============================================================

/**
 * Vérifie si une chaîne est un email valide
 * 
 * @param email - Email à vérifier
 * @returns true si l'email est valide
 * 
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return regex.test(email);
};

// ============================================================
// 7. FORMATAGE DES NOMBRES
// ============================================================

/**
 * Formate un nombre avec séparateurs de milliers
 * 
 * @param num - Nombre à formater
 * @returns Nombre formaté (ex: "12 500")
 * 
 * @example
 * formatNumber(12500) // "12 500"
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Calcule un pourcentage
 * 
 * @param value - Valeur partielle
 * @param total - Valeur totale
 * @returns Pourcentage arrondi
 * 
 * @example
 * calculatePercentage(50, 200) // 25
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Formate un pourcentage
 * 
 * @param value - Valeur à formater
 * @returns Pourcentage avec symbole
 * 
 * @example
 * formatPercentage(25) // "25%"
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
};

// ============================================================
// 8. STOCKAGE LOCAL AVEC EXPIRATION
// ============================================================

/**
 * Sauvegarde des données dans localStorage avec date d'expiration
 * 
 * @param key - Clé de stockage
 * @param value - Valeur à stocker
 * @param ttlMinutes - Durée de vie en minutes (défaut: 60)
 */
export const setLocalStorageWithExpiry = (
  key: string,
  value: any,
  ttlMinutes: number = 60
): void => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttlMinutes * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Récupère des données du localStorage avec vérification d'expiration
 * 
 * @param key - Clé de stockage
 * @returns Valeur stockée ou null si expirée
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

// ============================================================
// 9. COULEURS ET BADGES (UI)
// ============================================================

/**
 * Retourne la classe CSS pour un statut de projet
 */
export const getProjectStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    paused: 'bg-yellow-100 text-yellow-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

/**
 * Retourne le libellé français d'un statut de projet
 */
export const getProjectStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Actif',
    completed: 'Terminé',
    draft: 'Brouillon',
    cancelled: 'Annulé',
    paused: 'En pause',
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
    Freelance: 'bg-indigo-100 text-indigo-700',
    Volontariat: 'bg-green-100 text-green-700',
    Alternance: 'bg-teal-100 text-teal-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

/**
 * Retourne la classe CSS pour un statut de candidature
 */
export const getApplicationStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    interviewed: 'bg-purple-100 text-purple-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

/**
 * Retourne le libellé français d'un statut de candidature
 */
export const getApplicationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    reviewing: 'En cours d\'examen',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    interviewed: 'Entretien réalisé',
  };
  return labels[status] || status;
};

// ============================================================
// 10. GESTION DES FICHIERS
// ============================================================

/**
 * Formate une taille de fichier en unité lisible
 * 
 * @param bytes - Taille en octets
 * @returns Taille formatée (ex: "1.5 Mo")
 * 
 * @example
 * formatFileSize(1536000) // "1.5 Mo"
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes || bytes === 0) return '0 o';
  
  const k = 1024;
  const sizes = ['o', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Génère une URL complète pour un fichier
 * 
 * @param url - Chemin relatif ou URL absolue
 * @param defaultUrl - URL par défaut si aucune
 * @returns URL complète
 */
export const getFileUrl = (
  url: string | null | undefined,
  defaultUrl: string = '/images/placeholder.jpg'
): string => {
  if (!url) return defaultUrl;
  if (url.startsWith('http')) return url;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
  return `${apiUrl}${url}`;
};

// ============================================================
// 11. GÉNÉRATION D'IDENTIFIANTS
// ============================================================

/**
 * Génère un identifiant unique (UUID v4)
 * 
 * @returns UUID unique
 * 
 * @example
 * generateUniqueId() // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 */
export const generateUniqueId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/**
 * Génère un identifiant court aléatoire
 * 
 * @param length - Longueur de l'identifiant (défaut: 8)
 * @returns Identifiant court
 * 
 * @example
 * generateShortId() // "a1b2c3d4"
 */
export const generateShortId = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// ============================================================
// 12. FONCTIONS UTILITAIRES AVANCÉES
// ============================================================

/**
 * Anti-rebond (debounce) pour optimiser les recherches
 * 
 * @param func - Fonction à exécuter
 * @param delay - Délai d'attente en millisecondes
 * @returns Fonction debounced
 * 
 * @example
 * const handleSearch = debounce((value) => fetchResults(value), 300);
 */
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

/**
 * Clone profond d'un objet
 * 
 * @param obj - Objet à cloner
 * @returns Copie indépendante de l'objet
 * 
 * @example
 * const copy = deepClone(originalObject);
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Attend un délai (Promise)
 * 
 * @param ms - Nombre de millisecondes
 * @returns Promise résolue après le délai
 * 
 * @example
 * await delay(1000); // Attend 1 seconde
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Copie du texte dans le presse-papier
 * 
 * @param text - Texte à copier
 * @returns true si la copie a réussi
 * 
 * @example
 * await copyToClipboard('Texte à copier');
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ============================================================
// 13. EXPORT PAR DÉFAUT POUR IMPORT FACILE
// ============================================================

export default {
  cn,
  formatDate,
  formatDateTime,
  formatDateLong,
  formatRelativeDate,
  formatCurrency,
  formatCurrencyShort,
  formatPhoneNumber,
  cleanPhoneNumber,
  isValidPhoneNumber,
  truncateText,
  capitalize,
  capitalizeWords,
  generateSlug,
  isValidEmail,
  formatNumber,
  calculatePercentage,
  formatPercentage,
  setLocalStorageWithExpiry,
  getLocalStorageWithExpiry,
  getProjectStatusColor,
  getProjectStatusLabel,
  getContractTypeColor,
  getApplicationStatusColor,
  getApplicationStatusLabel,
  formatFileSize,
  getFileUrl,
  generateUniqueId,
  generateShortId,
  debounce,
  deepClone,
  delay,
  copyToClipboard,
};