/**
 * DTO (Data Transfer Object) pour la gestion des offres d'emploi
 * @module JobOfferDto
 * @description Ce fichier contient tous les DTOs nécessaires pour la gestion des offres d'emploi
 * 
 * Contenu :
 * - CreateJobOfferDto : Création d'une offre
 * - UpdateJobOfferDto : Modification d'une offre
 * - UpdateJobStatusDto : Mise à jour du statut
 * - JobOfferQueryDto : Recherche et filtrage
 * - JobOfferResponseDto : Structure de réponse
 * - JobOfferStatsDto : Statistiques
 */

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsDate, 
  IsUUID,
  MaxLength, 
  MinLength,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsUrl,
  IsInt
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';

// ============================================================
// CONSTANTES ET ÉNUMÉRATIONS
// ============================================================

/**
 * Types de contrat acceptés pour les offres d'emploi
 */
export const CONTRACT_TYPES = ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'ALTERNANCE', 'TEMPORARY'] as const;
export type ContractType = typeof CONTRACT_TYPES[number];

/**
 * Statuts possibles pour une offre d'emploi
 */
export const JOB_STATUSES = ['draft', 'published', 'closed', 'expired', 'archived'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

// ============================================================
// CREATE JOB OFFER DTO
// ============================================================

/**
 * DTO pour la création d'une offre d'emploi
 * @description Tous les champs nécessaires pour créer une nouvelle offre
 */
export class CreateJobOfferDto {
  // ============================================================
  // INFORMATIONS DE BASE (OBLIGATOIRES)
  // ============================================================

  /**
   * Titre de l'offre en français
   * @example "Développeur Full Stack"
   * @required
   */
  @IsString({ message: 'Le titre français doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre français est requis' })
  @MinLength(5, { message: 'Le titre français doit contenir au moins 5 caractères' })
  @MaxLength(255, { message: 'Le titre français ne doit pas dépasser 255 caractères' })
  title_fr: string;

  /**
   * Description détaillée de l'offre en français
   * @example "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe..."
   * @required
   */
  @IsString({ message: 'La description française doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description française est requise' })
  @MinLength(20, { message: 'La description française doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description française ne doit pas dépasser 5000 caractères' })
  description_fr: string;

  // ============================================================
  // INFORMATIONS DE BASE (OPTIONNELLES - VERSION MALGACHE)
  // ============================================================

  /**
   * Titre de l'offre en malgache (optionnel)
   * @example "Mpamoovitra Full Stack"
   */
  @IsOptional()
  @IsString({ message: 'Le titre malgache doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le titre malgache doit contenir au moins 3 caractères' })
  @MaxLength(255, { message: 'Le titre malgache ne doit pas dépasser 255 caractères' })
  title_mg?: string;

  /**
   * Description de l'offre en malgache (optionnelle)
   * @example "Mitady mpamoovitra Full Stack zaidra izahay..."
   */
  @IsOptional()
  @IsString({ message: 'La description malgache doit être une chaîne de caractères' })
  @MinLength(20, { message: 'La description malgache doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description malgache ne doit pas dépasser 5000 caractères' })
  description_mg?: string;

  // ============================================================
  // INFORMATIONS ENTREPRISE (OPTIONNELLES)
  // ============================================================

  /**
   * Nom de l'entreprise
   * @example "Tech Madagascar SARL"
   */
  @IsOptional()
  @IsString({ message: 'Le nom de l\'entreprise doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom de l\'entreprise ne doit pas dépasser 255 caractères' })
  company?: string;

  /**
   * Lieu de travail / Localisation
   * @example "Antananarivo, Madagascar"
   */
  @IsOptional()
  @IsString({ message: 'Le lieu doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le lieu doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le lieu ne doit pas dépasser 255 caractères' })
  location?: string;

  // ============================================================
  // DÉTAILS DU CONTRAT (OPTIONNELS)
  // ============================================================

  /**
   * Type de contrat
   * @example "CDI"
   * @default "CDI"
   */
  @IsOptional()
  @IsString({ message: 'Le type de contrat doit être une chaîne de caractères' })
  @IsIn(CONTRACT_TYPES, { 
    message: 'Le type de contrat doit être: CDI, CDD, STAGE, FREELANCE, ALTERNANCE ou TEMPORARY' 
  })
  contract_type?: string = 'CDI';

  /**
   * Date limite de candidature
   * @example "2024-12-31"
   */
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate({ message: 'La date limite doit être une date valide' })
  deadline?: Date;

  // ============================================================
  // PUBLICATION ET MÉDIAS (OPTIONNELS)
  // ============================================================

  /**
   * Statut de publication de l'offre
   * @default false
   */
  @IsOptional()
  @IsBoolean({ message: 'Le statut de publication doit être un booléen' })
  is_published?: boolean = false;

  /**
   * URL de l'image / logo de l'offre
   * @example "https://example.com/logo.jpg"
   */
  @IsOptional()
  @IsUrl({}, { message: 'L\'URL de l\'image doit être une URL valide' })
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  image_url?: string;
}

// ============================================================
// UPDATE JOB OFFER DTO
// ============================================================

/**
 * DTO pour la mise à jour partielle d'une offre d'emploi
 * @description Tous les champs sont optionnels pour permettre des mises à jour partielles
 */
export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {}

// ============================================================
// UPDATE JOB STATUS DTO
// ============================================================

/**
 * DTO pour la mise à jour du statut de publication
 * @deprecated Utiliser UpdateJobStatusV2Dto à la place
 */
export class UpdateJobStatusDto {
  /**
   * Statut de publication
   * @example true
   */
  @IsBoolean({ message: 'Le statut de publication doit être un booléen' })
  @IsNotEmpty({ message: 'Le statut de publication est requis' })
  is_published: boolean;
}

/**
 * DTO pour la mise à jour du statut (version améliorée)
 */
export class UpdateJobStatusV2Dto {
  /**
   * Nouveau statut de l'offre
   * @example "published"
   */
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsIn(JOB_STATUSES, { 
    message: 'Le statut doit être: draft, published, closed, expired ou archived' 
  })
  status: JobStatus;
}

// ============================================================
// JOB OFFER QUERY DTO (RECHERCHE ET FILTRAGE)
// ============================================================

/**
 * DTO pour la recherche et le filtrage des offres d'emploi
 * @description Utilisé pour les requêtes GET avec pagination et filtres
 */
export class JobOfferQueryDto {
  /**
   * Filtre par statut de l'offre
   * @example "published"
   */
  @IsOptional()
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsIn(JOB_STATUSES, { 
    message: 'Le statut doit être: draft, published, closed, expired ou archived' 
  })
  status?: string;

  /**
   * Filtre par statut de publication
   * @example true
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Le statut de publication doit être un booléen' })
  is_published?: boolean;

  /**
   * Filtre par type de contrat
   * @example "CDI"
   */
  @IsOptional()
  @IsString({ message: 'Le type de contrat doit être une chaîne de caractères' })
  @IsIn(CONTRACT_TYPES, { 
    message: 'Le type de contrat doit être: CDI, CDD, STAGE, FREELANCE, ALTERNANCE ou TEMPORARY' 
  })
  contract_type?: string;

  /**
   * Recherche textuelle (titre ou description)
   * @example "Développeur"
   */
  @IsOptional()
  @IsString({ message: 'La recherche doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La recherche ne doit pas dépasser 100 caractères' })
  search?: string;

  /**
   * Filtre par entreprise
   * @example "Tech Madagascar"
   */
  @IsOptional()
  @IsString({ message: 'L\'entreprise doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'L\'entreprise ne doit pas dépasser 255 caractères' })
  company?: string;

  /**
   * Filtre par localisation
   * @example "Antananarivo"
   */
  @IsOptional()
  @IsString({ message: 'La localisation doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'La localisation ne doit pas dépasser 255 caractères' })
  location?: string;

  /**
   * Filtre par date de création (après cette date)
   * @example "2024-01-01"
   */
  @IsOptional()
  @IsDate({ message: 'La date de début doit être une date valide' })
  @Type(() => Date)
  from_date?: Date;

  /**
   * Filtre par date de création (avant cette date)
   * @example "2024-12-31"
   */
  @IsOptional()
  @IsDate({ message: 'La date de fin doit être une date valide' })
  @Type(() => Date)
  to_date?: Date;

  // ============================================================
  // PAGINATION
  // ============================================================

  /**
   * Numéro de la page (démarre à 1)
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit être un nombre entier' })
  @Min(1, { message: 'La page doit être au moins 1' })
  page?: number = 1;

  /**
   * Nombre d'éléments par page
   * @default 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit être un nombre entier' })
  @Min(1, { message: 'La limite doit être au moins 1' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100' })
  limit?: number = 10;

  /**
   * Champ de tri
   * @default "created_at"
   */
  @IsOptional()
  @IsString({ message: 'Le champ de tri doit être une chaîne de caractères' })
  @IsIn(['created_at', 'updated_at', 'deadline', 'title_fr', 'views_count', 'applications_count'], {
    message: 'Le champ de tri doit être: created_at, updated_at, deadline, title_fr, views_count ou applications_count'
  })
  sortBy?: string = 'created_at';

  /**
   * Ordre de tri
   * @default "DESC"
   */
  @IsOptional()
  @IsString({ message: 'L\'ordre de tri doit être une chaîne de caractères' })
  @IsIn(['ASC', 'DESC'], {
    message: 'L\'ordre de tri doit être ASC ou DESC'
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ============================================================
// JOB OFFER RESPONSE DTO
// ============================================================

/**
 * DTO pour la réponse d'une offre d'emploi
 * @description Structure complète retournée par l'API
 */
export class JobOfferResponseDto {
  /** Identifiant unique de l'offre */
  id: string;

  /** Titre en français */
  title_fr: string;

  /** Titre en malgache (optionnel) */
  title_mg?: string;

  /** Description en français */
  description_fr: string;

  /** Description en malgache (optionnelle) */
  description_mg?: string;

  /** Nom de l'entreprise */
  company?: string;

  /** Lieu de travail */
  location?: string;

  /** Type de contrat */
  contract_type?: string;

  /** Date limite de candidature */
  deadline?: Date;

  /** Statut de publication */
  is_published: boolean;

  /** URL de l'image */
  image_url?: string;

  /** Statut de l'offre (draft, published, closed, expired, archived) */
  status: string;

  /** Nombre de vues */
  views_count: number;

  /** Nombre de candidatures reçues */
  applications_count: number;

  /** Date de création */
  created_at: Date;

  /** Date de dernière modification */
  updated_at: Date;

  // ============================================================
  // CHAMPS CALCULÉS (optionnels)
  // ============================================================

  /** Nombre de jours restants avant la date limite */
  days_until_deadline?: number | null;

  /** L'offre est-elle expirée ? */
  is_expired?: boolean;

  /** L'offre est-elle publiée ? */
  is_published_status?: boolean;
}

// ============================================================
// JOB OFFER STATS DTO
// ============================================================

/**
 * DTO pour les statistiques des offres d'emploi
 */
export class JobOfferStatsDto {
  /** Nombre total d'offres */
  total: number;

  /** Nombre d'offres publiées */
  published: number;

  /** Nombre d'offres en brouillon */
  draft: number;

  /** Nombre d'offres expirées */
  expired: number;

  /** Nombre d'offres fermées */
  closed: number;

  /** Nombre d'offres archivées */
  archived: number;

  /** Nombre total de vues */
  total_views: number;

  /** Nombre total de candidatures */
  total_applications: number;

  /** Taux de conversion (candidatures / vues) */
  conversion_rate?: number;

  /** Répartition par type de contrat */
  contracts_by_type?: Record<string, number>;

  /** Répartition par localisation */
  locations?: Record<string, number>;

  /** Offres les plus consultées */
  most_viewed?: JobOfferResponseDto[];

  /** Offres avec le plus de candidatures */
  most_applied?: JobOfferResponseDto[];
}

// ============================================================
// JOB OFFER IMPORT DTO
// ============================================================

/**
 * DTO pour l'import d'offres en masse (CSV/Excel)
 */
export class ImportJobOfferDto {
  /** Titre en français */
  title_fr: string;

  /** Description en français */
  description_fr: string;

  /** Nom de l'entreprise */
  company: string;

  /** Lieu de travail */
  location: string;

  /** Type de contrat */
  contract_type: string;

  /** Date limite (format YYYY-MM-DD) */
  deadline: string;

  /** Titre en malgache (optionnel) */
  title_mg?: string;

  /** Description en malgache (optionnelle) */
  description_mg?: string;
}