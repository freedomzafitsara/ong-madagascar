/**
 * DTO pour la création et la mise à jour des offres d'emploi
 * @description Contient toutes les validations pour gérer les offres d'emploi
 * 
 * Champs obligatoires :
 * - title_fr: Titre en français
 * - description_fr: Description en français
 * 
 * Champs optionnels :
 * - title_mg, description_mg (version malgache)
 * - company, location, contract_type
 * - deadline, is_published, image_url
 */

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsDateString, 
  MaxLength, 
  MinLength,
  IsIn,
  IsUrl,
  IsNotEmpty,
  IsInt,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// CREATE JOB OFFER DTO
// ============================================================

/**
 * Types de contrat acceptés
 */
export const CONTRACT_TYPES = ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'ALTERNANCE', 'TEMPORARY'] as const;
export type ContractType = typeof CONTRACT_TYPES[number];

/**
 * Statuts possibles pour une offre
 */
export const JOB_STATUSES = ['draft', 'published', 'closed', 'expired', 'archived'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

export class CreateJobOfferDto {
  // ============================================================
  // INFORMATIONS DE BASE (FRANÇAIS)
  // ============================================================
  
  /**
   * Titre de l'offre en français
   * @example "Développeur Full Stack"
   */
  @IsString({ message: 'Le titre français doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre français est requis' })
  @MinLength(3, { message: 'Le titre français doit contenir au moins 3 caractères' })
  @MaxLength(255, { message: 'Le titre français ne doit pas dépasser 255 caractères' })
  title_fr: string;

  /**
   * Description détaillée de l'offre en français
   * @example "Nous recherchons un développeur Full Stack expérimenté..."
   */
  @IsString({ message: 'La description française doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La description française est requise' })
  @MinLength(20, { message: 'La description française doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description française ne doit pas dépasser 5000 caractères' })
  description_fr: string;

  // ============================================================
  // INFORMATIONS DE BASE (MALGACHE)
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
   * Description détaillée de l'offre en malgache (optionnelle)
   * @example "Mitady mpamoovitra Full Stack zaidra izahay..."
   */
  @IsOptional()
  @IsString({ message: 'La description malgache doit être une chaîne de caractères' })
  @MinLength(20, { message: 'La description malgache doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description malgache ne doit pas dépasser 5000 caractères' })
  description_mg?: string;

  // ============================================================
  // INFORMATIONS ENTREPRISE
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
   * Lieu de travail
   * @example "Antananarivo, Madagascar"
   */
  @IsOptional()
  @IsString({ message: 'Le lieu doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le lieu doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le lieu ne doit pas dépasser 255 caractères' })
  location?: string;

  // ============================================================
  // DÉTAILS DU CONTRAT
  // ============================================================
  
  /**
   * Type de contrat
   * @example "CDI"
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
  @IsDateString({}, { message: 'La date limite doit être une date valide au format ISO (YYYY-MM-DD)' })
  deadline?: Date;

  // ============================================================
  // PUBLICATION
  // ============================================================
  
  /**
   * Statut de publication
   * @default false
   */
  @IsOptional()
  @IsBoolean({ message: 'Le statut de publication doit être un booléen' })
  is_published?: boolean = false;

  // ============================================================
  // MÉDIAS
  // ============================================================
  
  /**
   * URL de l'image de l'offre
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
 * DTO pour la mise à jour partielle d'une offre
 * Tous les champs sont optionnels
 */
export class UpdateJobOfferDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title_fr?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title_mg?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description_fr?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description_mg?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  company?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @IsIn(CONTRACT_TYPES)
  contract_type?: string;

  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  image_url?: string;
}

// ============================================================
// UPDATE JOB STATUS DTO
// ============================================================

/**
 * DTO pour la mise à jour du statut d'une offre
 */
export class UpdateJobStatusDto {
  /**
   * Nouveau statut de l'offre
   * @example "published"
   */
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsIn(JOB_STATUSES, { 
    message: 'Le statut doit être: draft, published, closed, expired ou archived' 
  })
  status: string;
}

// ============================================================
// JOB OFFER QUERY DTO
// ============================================================

/**
 * DTO pour la recherche/filtrage des offres d'emploi
 */
export class JobOfferQueryDto {
  /**
   * Page de résultats
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
   * Filtre par statut
   */
  @IsOptional()
  @IsString()
  @IsIn(JOB_STATUSES)
  status?: string;

  /**
   * Filtre par publication
   */
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  /**
   * Filtre par type de contrat
   */
  @IsOptional()
  @IsString()
  @IsIn(CONTRACT_TYPES)
  contract_type?: string;

  /**
   * Recherche textuelle (titre ou description)
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}