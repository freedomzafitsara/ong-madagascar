// src/lib/validation.ts
// Version finale - Validation des formulaires Y-MaD
// Association: Young for Madagascar Development
// Theme: Gestion des offres d'emploi

import { z } from 'zod';

// ============================================================
// 1. VALIDATION AUTHENTIFICATION
// ============================================================

export const registerSchema = z.object({
  first_name: z.string()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres')
    .max(50, 'Le prenom est trop long'),
  
  last_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(50, 'Le nom est trop long'),
  
  email: z.string()
    .email('Email invalide')
    .min(5, 'Email trop court'),
  
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caracteres')
    .max(100, 'Mot de passe trop long'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caracteres'),
  confirmPassword: z.string()
    .min(6, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// ============================================================
// 2. VALIDATION PROFIL
// ============================================================

export const updateProfileSchema = z.object({
  first_name: z.string()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres')
    .max(50, 'Le prenom est trop long')
    .optional(),
  
  last_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(50, 'Le nom est trop long')
    .optional(),
  
  email: z.string()
    .email('Email invalide')
    .optional(),
});

// ============================================================
// 3. VALIDATION OFFRES D'EMPLOI
// ============================================================

export const jobOfferSchema = z.object({
  title_fr: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caracteres')
    .max(255, 'Le titre est trop long'),
  
  title_mg: z.string()
    .max(255, 'Le titre est trop long')
    .optional(),
  
  description_fr: z.string()
    .min(20, 'La description doit contenir au moins 20 caracteres')
    .max(5000, 'La description est trop longue'),
  
  description_mg: z.string()
    .max(5000, 'La description est trop longue')
    .optional(),
  
  company: z.string()
    .min(2, 'Le nom de l entreprise est requis')
    .max(255, 'Nom trop long'),
  
  location: z.string()
    .max(255, 'Localisation trop longue')
    .optional(),
  
  contract_type: z.enum(['CDI', 'CDD', 'STAGE', 'FREELANCE', 'BENEVOLE']),
  
  deadline: z.string()
    .min(1, 'Date limite requise'),
  
  is_published: z.boolean().optional(),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
});

export const jobApplicationSchema = z.object({
  job_offer_id: z.string().uuid('Offre invalide'),
  full_name: z.string()
    .min(3, 'Nom complet requis')
    .max(255, 'Nom trop long'),
  
  email: z.string().email('Email invalide'),
  
  phone: z.string()
    .min(9, 'Telephone requis')
    .max(20, 'Telephone trop long')
    .optional(),
  
  cv_url: z.string().url('URL du CV invalide').optional().or(z.literal('')),
  
  cover_letter: z.string()
    .max(2000, 'Lettre trop longue')
    .optional(),
});

// ============================================================
// 4. VALIDATION PROJETS
// ============================================================

export const projectSchema = z.object({
  title_fr: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caracteres')
    .max(255, 'Le titre est trop long'),
  
  title_mg: z.string()
    .max(255, 'Le titre est trop long')
    .optional(),
  
  description_fr: z.string()
    .min(10, 'La description doit contenir au moins 10 caracteres')
    .max(5000, 'La description est trop longue'),
  
  description_mg: z.string()
    .max(5000, 'La description est trop longue')
    .optional(),
  
  location: z.string()
    .max(255, 'Localisation trop longue')
    .optional(),
  
  start_date: z.string().optional(),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
  status: z.enum(['active', 'completed', 'planning', 'draft']).optional(),
});

// ============================================================
// 5. VALIDATION BLOG
// ============================================================

export const blogPostSchema = z.object({
  title_fr: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caracteres')
    .max(255, 'Le titre est trop long'),
  
  title_mg: z.string()
    .max(255, 'Le titre est trop long')
    .optional(),
  
  content_fr: z.string()
    .min(20, 'Le contenu doit contenir au moins 20 caracteres'),
  
  content_mg: z.string()
    .optional(),
  
  cover_image: z.string().url('URL invalide').optional().or(z.literal('')),
  
  slug: z.string()
    .max(255, 'Slug trop long')
    .optional(),
  
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category_id: z.string().uuid('Categorie invalide').optional(),
});

// ============================================================
// 6. VALIDATION CONTACT
// ============================================================

export const contactSchema = z.object({
  full_name: z.string()
    .min(2, 'Nom complet requis')
    .max(255, 'Nom trop long'),
  
  email: z.string().email('Email invalide'),
  
  subject: z.string()
    .min(3, 'Sujet requis')
    .max(255, 'Sujet trop long'),
  
  message: z.string()
    .min(10, 'Message trop court')
    .max(5000, 'Message trop long'),
});

// ============================================================
// 7. VALIDATION PAGES (fonds d'écran)
// ============================================================

export const pageBackgroundSchema = z.object({
  page_key: z.string()
    .min(1, 'Page requise'),
  
  image_url: z.string().url('URL de l image invalide'),
  
  alt_fr: z.string().max(255, 'Texte alternatif trop long').optional(),
  alt_mg: z.string().max(255, 'Texte alternatif trop long').optional(),
  
  is_active: z.boolean().optional(),
  overlay_opacity: z.number().min(0).max(100).optional(),
  position: z.enum(['center', 'top', 'bottom', 'left', 'right']).optional(),
  size: z.enum(['cover', 'contain', 'auto']).optional(),
});

// ============================================================
// 8. VALIDATION LANGUE (traductions)
// ============================================================

export const translationSchema = z.object({
  key: z.string()
    .min(1, 'Cle requise')
    .max(255, 'Cle trop longue'),
  
  value_fr: z.string()
    .min(1, 'Traduction francaise requise'),
  
  value_mg: z.string()
    .min(1, 'Traduction malgache requise'),
});

// ============================================================
// 9. TYPES INFERES (pour TypeScript)
// ============================================================

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type JobOfferFormData = z.infer<typeof jobOfferSchema>;
export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type BlogPostFormData = z.infer<typeof blogPostSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type PageBackgroundFormData = z.infer<typeof pageBackgroundSchema>;
export type TranslationFormData = z.infer<typeof translationSchema>;

// ============================================================
// 10. FONCTION UTILITAIRE POUR VALIDATION
// ============================================================

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