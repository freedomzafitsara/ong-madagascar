/**
 * Types pour la gestion des offres d'emploi
 * @module JobTypes
 */

// ============================================================
// ENUMERATIONS
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

// ✅ CORRECTION: ApplicationStatus avec tous les statuts corrects
export enum ApplicationStatus {
  SUBMITTED = 'submitted',      // Soumise
  REVIEWING = 'reviewing',      // En revision
  SHORTLISTED = 'shortlisted',  // Pre-selectionnee
  INTERVIEW = 'interview',      // Entretien
  ACCEPTED = 'accepted',        // Acceptee
  REJECTED = 'rejected'         // Refusee
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
  contract_type: ContractType | string;
  deadline?: string | Date;
  is_published: boolean;
  image_url?: string;
  main_image_id?: string;
  status: JobStatus | string;
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
  experience_years?: number;
  current_position?: string;
  current_company?: string;
  cover_letter?: string;
  cv_url?: string;
  cover_letter_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: ApplicationStatus | string;
  notes?: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
  jobOffer?: JobOffer;
}

// ============================================================
// DTOs POUR LES REQUETES API
// ============================================================

export interface CreateJobOfferDto {
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: ContractType | string;
  deadline?: Date | string;
  is_published?: boolean;
  image_url?: string;
  main_image_id?: string;
}

export interface UpdateJobOfferDto extends Partial<CreateJobOfferDto> {
  status?: JobStatus | string;
}

export interface UpdateJobStatusDto {
  status: JobStatus | string;
}

// ✅ CORRECTION: CreateJobApplicationDto avec tous les champs
export interface CreateJobApplicationDto {
  job_offer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  current_position?: string;
  current_company?: string;
  cover_letter?: string;
  cv_url?: string;
  cover_letter_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus | string;
  notes?: string;
}

// ============================================================
// REPONSES API PAGINEES
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
  closed?: number;
  archived?: number;
  totalViews?: number;
  total_applications?: number;
  contracts_by_type?: Record<string, number>;
}

// ✅ CORRECTION: ApplicationStats avec les bons noms
export interface ApplicationStats {
  total: number;
  submitted: number;
  reviewing: number;
  shortlisted: number;
  interview: number;
  accepted: number;
  rejected: number;
}

// ============================================================
// TYPES UTILITAIRES
// ============================================================

export type JobStatusType = JobStatus | string;
export type ContractTypeType = ContractType | string;
export type ApplicationStatusType = ApplicationStatus | string;

// ============================================================
// CONSTANTES
// ============================================================

export const JOB_STATUS_LABELS: Record<JobStatus, { fr: string; mg: string; color: string }> = {
  [JobStatus.DRAFT]: { fr: 'Brouillon', mg: 'Volavola', color: 'gray' },
  [JobStatus.PUBLISHED]: { fr: 'Publiee', mg: 'Navoaka', color: 'green' },
  [JobStatus.CLOSED]: { fr: 'Fermee', mg: 'Nakatona', color: 'red' },
  [JobStatus.EXPIRED]: { fr: 'Expiree', mg: 'Lany daty', color: 'orange' },
  [JobStatus.ARCHIVED]: { fr: 'Archivee', mg: 'Voatahiry', color: 'purple' },
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, { fr: string; mg: string; icon: string }> = {
  [ContractType.CDI]: { fr: 'CDI', mg: 'CDI', icon: 'Award' },
  [ContractType.CDD]: { fr: 'CDD', mg: 'CDD', icon: 'Calendar' },
  [ContractType.STAGE]: { fr: 'Stage', mg: 'Fiofanana', icon: 'Target' },
  [ContractType.FREELANCE]: { fr: 'Freelance', mg: 'Freelance', icon: 'Briefcase' },
  [ContractType.ALTERNANCE]: { fr: 'Alternance', mg: 'Fiofanana mifandimby', icon: 'Zap' },
  [ContractType.TEMPORARY]: { fr: 'Temporaire', mg: 'Vonjimaika', icon: 'Clock' },
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, { fr: string; mg: string; color: string }> = {
  [ApplicationStatus.SUBMITTED]: { fr: 'Soumise', mg: 'Nalefa', color: 'gray' },
  [ApplicationStatus.REVIEWING]: { fr: 'En revision', mg: 'Azo dinihina', color: 'blue' },
  [ApplicationStatus.SHORTLISTED]: { fr: 'Pre-selectionnee', mg: 'Voafantina', color: 'purple' },
  [ApplicationStatus.INTERVIEW]: { fr: 'Entretien', mg: 'Dinidinika', color: 'orange' },
  [ApplicationStatus.ACCEPTED]: { fr: 'Acceptee', mg: 'Ekena', color: 'green' },
  [ApplicationStatus.REJECTED]: { fr: 'Refusee', mg: 'Lavina', color: 'red' },
};

// ✅ CORRECTION: Statut d'application par defaut
export const DEFAULT_APPLICATION_STATUS = ApplicationStatus.SUBMITTED;

// ✅ CORRECTION: Statut d'offre par defaut
export const DEFAULT_JOB_STATUS = JobStatus.DRAFT;

// ✅ CORRECTION: Type de contrat par defaut
export const DEFAULT_CONTRACT_TYPE = ContractType.CDI;