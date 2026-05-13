// src/lib/validation.ts
// Version finale - Validation des formulaires Y-Mad

import { z } from 'zod';

// ============================================================
// 1. VALIDATION AUTHENTIFICATION
// ============================================================

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long'),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long'),
  
  email: z.string()
    .email('Email invalide')
    .min(5, 'Email trop court'),
  
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Mot de passe trop long'),
  
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^(?:(?:\+261|0)[234])\d{8}$/.test(val.replace(/\s/g, '')),
      { message: 'Numéro de téléphone malgache invalide' }
    ),
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string()
    .min(6, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Schéma de validation pour mot de passe oublié
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

/**
 * Schéma de validation pour réinitialisation du mot de passe
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// ============================================================
// 2. VALIDATION PROFIL
// ============================================================

/**
 * Schéma de validation pour la mise à jour du profil
 */
export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .optional(),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .optional(),
  
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^(?:(?:\+261|0)[234])\d{8}$/.test(val.replace(/\s/g, '')),
      { message: 'Numéro de téléphone malgache invalide' }
    ),
  
  region: z.string().optional(),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),
  position: z.string().max(100, 'Le poste est trop long').optional(),
  department: z.string().max(100, 'Le département est trop long').optional(),
  skills: z.string().max(500, 'Trop de compétences').optional(),
  
  socialLinkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  socialTwitter: z.string().url('URL Twitter invalide').optional().or(z.literal('')),
  socialGithub: z.string().url('URL GitHub invalide').optional().or(z.literal('')),
});

// ============================================================
// 3. VALIDATION PROJETS
// ============================================================

/**
 * Schéma de validation pour la création d'un projet
 */
export const projectSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre est trop long'),
  
  title_mg: z.string().optional(),
  
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(5000, 'La description est trop longue'),
  
  description_mg: z.string().optional(),
  
  location: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['active', 'completed', 'draft', 'cancelled', 'paused']),
  budget: z.number().min(0, 'Le budget ne peut pas être négatif').optional(),
  progress: z.number().min(0).max(100).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// ============================================================
// 4. VALIDATION ÉVÉNEMENTS
// ============================================================

/**
 * Schéma de validation pour la création d'un événement
 */
export const eventSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre est trop long'),
  
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères'),
  
  event_type: z.enum(['camp', 'workshop', 'hackathon', 'conference', 'formation']),
  location: z.string().optional(),
  region: z.string().optional(),
  start_datetime: z.string().min(1, 'Date de début requise'),
  end_datetime: z.string().optional(),
  max_capacity: z.number().min(0).optional(),
  is_free: z.boolean(),
  price_mga: z.number().min(0).optional(),
});

/**
 * Schéma de validation pour l'inscription à un événement
 */
export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid('ID d\'événement invalide'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});

// ============================================================
// 5. VALIDATION OFFRES D'EMPLOI
// ============================================================

/**
 * Schéma de validation pour la création d'une offre d'emploi
 */
export const jobOfferSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre est trop long'),
  
  company_name: z.string()
    .min(2, 'Le nom de l\'entreprise est requis'),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères'),
  
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  
  job_type: z.enum(['CDI', 'CDD', 'Stage', 'Freelance', 'Volontariat']),
  sector: z.string().optional(),
  region: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(['draft', 'published', 'closed', 'expired']).optional(),
});

/**
 * Schéma de validation pour la candidature
 */
export const jobApplicationSchema = z.object({
  job_offer_id: z.string().uuid('Offre invalide'),
  full_name: z.string()
    .min(3, 'Nom complet requis')
    .max(100, 'Nom trop long'),
  
  email: z.string().email('Email invalide'),
  phone: z.string()
    .min(10, 'Téléphone requis')
    .refine(
      (val) => /^(?:(?:\+261|0)[234])\d{8}$/.test(val.replace(/\s/g, '')),
      { message: 'Numéro de téléphone malgache invalide' }
    ),
  
  address: z.string()
    .min(5, 'Adresse requise')
    .max(200, 'Adresse trop longue'),
  
  experience_years: z.number().min(0).max(50).optional(),
  cover_letter: z.string().max(2000, 'Lettre trop longue').optional(),
});

// ============================================================
// 6. VALIDATION DONS
// ============================================================

/**
 * Schéma de validation pour un don
 */
export const donationSchema = z.object({
  amount: z.number()
    .min(100, 'Le montant minimum est de 100 Ar')
    .max(100_000_000, 'Montant trop élevé'),
  
  donor_name: z.string().min(2, 'Nom requis').optional(),
  donor_email: z.string().email('Email invalide').optional(),
  donor_phone: z.string().optional(),
  
  currency: z.enum(['MGA', 'EUR', 'USD']).default('MGA'),
  payment_method: z.enum(['mvola', 'orange_money', 'airtel', 'bank', 'cash', 'paypal']),
  message: z.string().max(500, 'Message trop long').optional(),
  project_id: z.string().uuid().optional(),
});

// ============================================================
// 7. VALIDATION BÉNÉFICIAIRES
// ============================================================

/**
 * Schéma de validation pour un bénéficiaire
 */
export const beneficiarySchema = z.object({
  firstName: z.string()
    .min(2, 'Prénom requis')
    .max(50, 'Prénom trop long'),
  
  lastName: z.string()
    .min(2, 'Nom requis')
    .max(50, 'Nom trop long'),
  
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  region: z.string().optional(),
  commune: z.string().optional(),
  fokontany: z.string().optional(),
  educationLevel: z.enum(['primaire', 'ceg', 'lycee', 'universite', 'aucun']).optional(),
  employmentStatus: z.enum(['chomeur', 'etudiant', 'employe', 'entrepreneur']).optional(),
  beforeYmAd: z.string().max(500, 'Trop long').optional(),
  afterYmAd: z.string().max(500, 'Trop long').optional(),
});

// ============================================================
// 8. VALIDATION CONTACT
// ============================================================

/**
 * Schéma de validation pour le formulaire de contact
 */
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nom requis')
    .max(100, 'Nom trop long'),
  
  email: z.string().email('Email invalide'),
  subject: z.string()
    .min(3, 'Sujet requis')
    .max(200, 'Sujet trop long'),
  
  message: z.string()
    .min(10, 'Message trop court')
    .max(2000, 'Message trop long'),
});

// ============================================================
// 9. TYPES INFÉRÉS (pour TypeScript)
// ============================================================

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;
export type JobOfferFormData = z.infer<typeof jobOfferSchema>;
export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
export type DonationFormData = z.infer<typeof donationSchema>;
export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;

// ============================================================
// 10. FONCTION UTILITAIRE POUR VALIDATION
// ============================================================

/**
 * Valide un formulaire et retourne les erreurs formatées
 * 
 * @param schema - Schéma Zod
 * @param data - Données à valider
 * @returns { success, errors, data }
 */
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: null, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors, data: null };
};