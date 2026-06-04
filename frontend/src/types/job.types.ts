/**
 * Types pour la gestion des offres d'emploi
 * @module JobTypes
 */

// ============================================================
// ÉNUMÉRATIONS
// ============================================================

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  EXPIRED = 'expired',
  ARCHIVED = 'archived'
}

export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE',
  ALTERNANCE = 'ALTERNANCE',
  TEMPORARY = 'TEMPORARY'
}

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================

export interface JobOffer {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type: string;
  deadline?: string | Date;
  is_published: boolean;
  image_url?: string;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_offer_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience?: string;
  experience_years?: number;
  cover_letter?: string;
  cv_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
  status: ApplicationStatus;
  notes?: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
  jobOffer?: JobOffer;
}

// ============================================================
// DTOs POUR LES REQUÊTES API
// ============================================================

export interface CreateJobOfferDto {
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: string;
  deadline?: Date | string;
  is_published?: boolean;
  image_url?: string;
}

export interface UpdateJobOfferDto extends Partial<CreateJobOfferDto> {}

export interface UpdateJobStatusDto {
  status: JobStatus;
}

export interface CreateJobApplicationDto {
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience?: string;
  experience_years?: number;
  cover_letter?: string;
  cv_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
  notes?: string;
}

// ============================================================
// RÉPONSES API PAGINÉES
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface JobOfferStats {
  total: number;
  published: number;
  draft: number;
  expired: number;
  totalApplications: number;
  pendingApplications: number;
}

export interface ApplicationStats {
  total: number;
  submitted: number;
  reviewing: number;
  shortlisted: number;
  interview: number;
  accepted: number;
  rejected: number;
}