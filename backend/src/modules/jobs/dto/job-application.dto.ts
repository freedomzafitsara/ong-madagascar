/**
 * DTO (Data Transfer Object) pour la gestion des candidatures
 * @module JobApplicationDto
 * @description Ce fichier contient tous les DTOs nécessaires pour la gestion des candidatures
 * 
 * Contenu :
 * - JobApplicationResponseDto : Structure de réponse pour une candidature
 * - JobApplicationQueryDto : Paramètres de recherche/filtrage
 * - UpdateApplicationStatusDto : Mise à jour du statut d'une candidature
 * - ApplicationStatusEnum : Énumération des statuts possibles
 */

import { 
  IsUUID, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsDate, 
  IsEnum, 
  IsInt, 
  Min, 
  Max,
  IsUrl,
  MinLength,
  MaxLength,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// ÉNUMÉRATION DES STATUTS (copie locale pour les DTOs)
// ============================================================

/**
 * Énumération des statuts possibles pour une candidature
 * @enum {string}
 */
export enum ApplicationStatusEnum {
  /** Candidature soumise - en attente de traitement */
  SUBMITTED = 'submitted',
  /** Candidature en cours d'examen */
  REVIEWING = 'reviewing',
  /** Candidature présélectionnée */
  SHORTLISTED = 'shortlisted',
  /** Candidat convoqué pour un entretien */
  INTERVIEW = 'interview',
  /** Candidature acceptée */
  ACCEPTED = 'accepted',
  /** Candidature refusée */
  REJECTED = 'rejected',
  /** Candidature retirée par le candidat */
  WITHDRAWN = 'withdrawn'
}

// ============================================================
// RESPONSE DTO
// ============================================================

/**
 * DTO pour la réponse d'une candidature (retournée par l'API)
 * @description Structure complète d'une candidature lors des réponses API
 */
export class JobApplicationResponseDto {
  /** Identifiant unique de la candidature (UUID) */
  @IsUUID()
  id: string;

  /** Identifiant de l'offre d'emploi associée (UUID) */
  @IsUUID()
  job_offer_id: string;

  /** Identifiant de l'utilisateur connecté (si connecté) */
  @IsOptional()
  @IsUUID()
  user_id?: string;

  // ============================================================
  // INFORMATIONS CANDIDAT
  // ============================================================

  /** Nom complet du candidat */
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  full_name: string;

  /** Adresse email du candidat */
  @IsEmail()
  @MaxLength(255)
  email: string;

  /** Numéro de téléphone du candidat */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  /** Adresse postale du candidat */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  /** Ville du candidat */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  /** Région du candidat */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  // ============================================================
  // EXPÉRIENCE ET COMPÉTENCES
  // ============================================================

  /** Description de l'expérience professionnelle */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  experience?: string;

  /** Nombre d'années d'expérience */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  /** Niveau d'éducation / diplôme */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  education_level?: string;

  /** Poste actuel du candidat */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  current_position?: string;

  /** Entreprise actuelle du candidat */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  current_company?: string;

  /** Liste des compétences (format JSON) */
  @IsOptional()
  skills?: string[];

  // ============================================================
  // DOCUMENTS DE CANDIDATURE
  // ============================================================

  /** Lettre de motivation */
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  cover_letter?: string;

  /** URL de la photo du candidat (Cloudinary) */
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  photo_url?: string;

  /** URL du CV (Cloudinary) */
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  cv_url?: string;

  /** URL du diplôme (Cloudinary) */
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  diploma_url?: string;

  /** URL de l'attestation de travail (Cloudinary) */
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  attestation_url?: string;

  // ============================================================
  // STATUT ET SUIVI ADMIN
  // ============================================================

  /** Statut actuel de la candidature */
  @IsEnum(ApplicationStatusEnum)
  status: ApplicationStatusEnum;

  /** Notes internes du recruteur */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Raison du refus (si applicable) */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;

  /** Date d'entretien programmée (si applicable) */
  @IsOptional()
  @IsDate()
  interview_date?: Date;

  /** Score attribué par le recruteur (0-100) */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  /** Identifiant du recruteur qui a examiné la candidature */
  @IsOptional()
  @IsUUID()
  reviewed_by?: string;

  /** Date d'examen par le recruteur */
  @IsOptional()
  @IsDate()
  reviewed_at?: Date;

  // ============================================================
  // DATES SYSTÈME
  // ============================================================

  /** Date de soumission de la candidature */
  @IsDate()
  @Type(() => Date)
  applied_at: Date;

  /** Date de création dans le système */
  @IsDate()
  @Type(() => Date)
  created_at: Date;

  /** Date de dernière modification */
  @IsDate()
  @Type(() => Date)
  updated_at: Date;
}

// ============================================================
// QUERY DTO (FILTRES ET PAGINATION)
// ============================================================

/**
 * DTO pour la recherche et le filtrage des candidatures
 * @description Utilisé pour les requêtes GET avec pagination
 */
export class JobApplicationQueryDto {
  /**
   * Filtre par statut de candidature
   * @example "submitted"
   */
  @IsOptional()
  @IsEnum(ApplicationStatusEnum, { 
    message: 'Le statut doit être une valeur valide: submitted, reviewing, shortlisted, interview, accepted, rejected, withdrawn' 
  })
  status?: ApplicationStatusEnum;

  /**
   * Filtre par offre d'emploi spécifique
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'offre doit être un UUID valide' })
  job_offer_id?: string;

  /**
   * Filtre par utilisateur spécifique
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  user_id?: string;

  /**
   * Date de début pour le filtrage (candidatures après cette date)
   * @example "2024-01-01"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from_date?: Date;

  /**
   * Date de fin pour le filtrage (candidatures avant cette date)
   * @example "2024-12-31"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to_date?: Date;

  /**
   * Recherche textuelle (nom, email)
   * @example "Rakoto"
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  // ============================================================
  // PAGINATION
  // ============================================================

  /**
   * Numéro de la page (démarre à 1)
   * @default 1
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un nombre entier' })
  @Min(1, { message: 'La page doit être au moins 1' })
  page?: number = 1;

  /**
   * Nombre d'éléments par page
   * @default 10
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier' })
  @Min(1, { message: 'La limite doit être au moins 1' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100' })
  limit?: number = 10;

  /**
   * Champ de tri
   * @default "applied_at"
   * @example "created_at"
   */
  @IsOptional()
  @IsString()
  @IsEnum(['applied_at', 'created_at', 'full_name', 'status'], {
    message: 'Le champ de tri doit être: applied_at, created_at, full_name ou status'
  })
  sortBy?: string = 'applied_at';

  /**
   * Ordre de tri
   * @default "DESC"
   * @example "ASC"
   */
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'], {
    message: 'L\'ordre de tri doit être ASC ou DESC'
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ============================================================
// UPDATE STATUS DTO
// ============================================================

/**
 * DTO pour la mise à jour du statut d'une candidature
 * @description Utilisé par les administrateurs pour modifier le statut
 */
export class UpdateApplicationStatusDto {
  /**
   * Nouveau statut de la candidature
   * @example "accepted"
   */
  @IsEnum(ApplicationStatusEnum, { 
    message: 'Le statut doit être une valeur valide: submitted, reviewing, shortlisted, interview, accepted, rejected, withdrawn' 
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: ApplicationStatusEnum;

  /**
   * Notes internes du recruteur (optionnel)
   * @example "Candidat très prometteur, à contacter pour un entretien"
   */
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Les notes ne doivent pas dépasser 2000 caractères' })
  notes?: string;

  /**
   * Raison du refus (requis si status = rejected)
   * @example "Profil non correspondant aux critères"
   */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La raison du refus ne doit pas dépasser 500 caractères' })
  rejection_reason?: string;

  /**
   * Date d'entretien (requis si status = interview)
   * @example "2024-12-15T10:00:00Z"
   */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  interview_date?: Date;

  /**
   * Score attribué (0-100)
   * @example 85
   */
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Le score doit être compris entre 0 et 100' })
  @Max(100, { message: 'Le score doit être compris entre 0 et 100' })
  score?: number;
}

// ============================================================
// STATISTIQUES DTO
// ============================================================

/**
 * DTO pour les statistiques des candidatures
 */
export class ApplicationStatsDto {
  /** Nombre total de candidatures */
  total: number;

  /** Candidatures en attente (submitted) */
  submitted: number;

  /** Candidatures en cours d'examen (reviewing) */
  reviewing: number;

  /** Candidatures présélectionnées (shortlisted) */
  shortlisted: number;

  /** Candidatures en entretien (interview) */
  interview: number;

  /** Candidatures acceptées (accepted) */
  accepted: number;

  /** Candidatures refusées (rejected) */
  rejected: number;

  /** Taux de transformation (acceptées / total) */
  conversion_rate?: number;
}

// ============================================================
// EXPORT DTO (CSV)
// ============================================================

/**
 * DTO pour l'export des candidatures
 */
export class ExportApplicationsDto {
  /** Format d'export (csv, excel, pdf) */
  @IsOptional()
  @IsEnum(['csv', 'excel', 'pdf'], {
    message: 'Le format doit être: csv, excel ou pdf'
  })
  format?: string = 'csv';

  /** Filtre par statut */
  @IsOptional()
  @IsEnum(ApplicationStatusEnum)
  status?: ApplicationStatusEnum;

  /** Filtre par offre */
  @IsOptional()
  @IsUUID()
  job_offer_id?: string;

  /** Date de début */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from_date?: Date;

  /** Date de fin */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to_date?: Date;
}