/**
 * DTO (Data Transfer Object) pour la mise à jour des offres d'emploi
 * @module UpdateJobOfferDto
 * @description Ce fichier contient le DTO pour la mise à jour partielle des offres d'emploi
 * 
 * Avantages :
 * - Tous les champs sont optionnels pour permettre des mises à jour partielles
 * - Hérite de CreateJobOfferDto via PartialType
 * - Supporte le PATCH (mise à jour partielle) HTTP
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateJobOfferDto } from './create-job-offer.dto';
import { IsOptional, IsString, IsBoolean, IsDate, IsUrl, MinLength, MaxLength, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

// ============================================================
// CONSTANTES (importées depuis job-offer.dto.ts)
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

// ============================================================
// UPDATE JOB OFFER DTO (Version améliorée)
// ============================================================

/**
 * DTO pour la mise à jour partielle d'une offre d'emploi
 * @description Étend CreateJobOfferDto avec tous les champs optionnels
 * Utilisé pour les requêtes PATCH (mise à jour partielle)
 * 
 * @example
 * // Mise à jour partielle - seulement le titre
 * PATCH /api/jobs/offers/123
 * {
 *   "title_fr": "Nouveau titre"
 * }
 * 
 * @example
 * // Mise à jour complète - plusieurs champs
 * PATCH /api/jobs/offers/123
 * {
 *   "title_fr": "Nouveau titre",
 *   "description_fr": "Nouvelle description",
 *   "is_published": true
 * }
 */
export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {
  /**
   * Titre en français (optionnel)
   * @example "Développeur Full Stack Senior"
   */
  @IsOptional()
  @IsString({ message: 'Le titre français doit être une chaîne de caractères' })
  @MinLength(5, { message: 'Le titre français doit contenir au moins 5 caractères' })
  @MaxLength(255, { message: 'Le titre français ne doit pas dépasser 255 caractères' })
  title_fr?: string;

  /**
   * Titre en malgache (optionnel)
   * @example "Mpamoovitra Full Stack Senior"
   */
  @IsOptional()
  @IsString({ message: 'Le titre malgache doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le titre malgache doit contenir au moins 3 caractères' })
  @MaxLength(255, { message: 'Le titre malgache ne doit pas dépasser 255 caractères' })
  title_mg?: string;

  /**
   * Description en français (optionnelle)
   * @example "Nous recherchons un développeur Full Stack senior avec 5 ans d'expérience..."
   */
  @IsOptional()
  @IsString({ message: 'La description française doit être une chaîne de caractères' })
  @MinLength(20, { message: 'La description française doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description française ne doit pas dépasser 5000 caractères' })
  description_fr?: string;

  /**
   * Description en malgache (optionnelle)
   * @example "Mitady mpamoovitra Full Stack senior manana traikefa 5 taona..."
   */
  @IsOptional()
  @IsString({ message: 'La description malgache doit être une chaîne de caractères' })
  @MinLength(20, { message: 'La description malgache doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description malgache ne doit pas dépasser 5000 caractères' })
  description_mg?: string;

  /**
   * Nom de l'entreprise (optionnel)
   * @example "Tech Madagascar SARL"
   */
  @IsOptional()
  @IsString({ message: 'Le nom de l\'entreprise doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom de l\'entreprise ne doit pas dépasser 255 caractères' })
  company?: string;

  /**
   * Lieu de travail (optionnel)
   * @example "Antananarivo, Madagascar"
   */
  @IsOptional()
  @IsString({ message: 'Le lieu doit être une chaîne de caractères' })
  @MinLength(2, { message: 'Le lieu doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le lieu ne doit pas dépasser 255 caractères' })
  location?: string;

  /**
   * Type de contrat (optionnel)
   * @example "CDI"
   */
  @IsOptional()
  @IsString({ message: 'Le type de contrat doit être une chaîne de caractères' })
  @IsIn(CONTRACT_TYPES, { 
    message: 'Le type de contrat doit être: CDI, CDD, STAGE, FREELANCE, ALTERNANCE ou TEMPORARY' 
  })
  contract_type?: string;

  /**
   * Date limite de candidature (optionnelle)
   * @example "2024-12-31"
   */
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate({ message: 'La date limite doit être une date valide' })
  deadline?: Date;

  /**
   * Statut de publication (optionnel)
   * @example true
   */
  @IsOptional()
  @IsBoolean({ message: 'Le statut de publication doit être un booléen' })
  is_published?: boolean;

  /**
   * URL de l'image (optionnelle)
   * @example "https://example.com/logo.jpg"
   */
  @IsOptional()
  @IsUrl({}, { message: 'L\'URL de l\'image doit être une URL valide' })
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  image_url?: string;
}

// ============================================================
// UPDATE JOB STATUS DTO (Version améliorée)
// ============================================================

/**
 * DTO pour la mise à jour du statut d'une offre
 * @description Utilisé spécifiquement pour changer le statut d'une offre
 */
export class UpdateJobStatusDto {
  /**
   * Statut de publication (version simple)
   * @example true
   * @deprecated Utiliser `status` à la place pour plus de flexibilité
   */
  @IsOptional()
  @IsBoolean({ message: 'Le statut de publication doit être un booléen' })
  is_published?: boolean;

  /**
   * Statut avancé de l'offre
   * @example "published"
   */
  @IsOptional()
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsIn(JOB_STATUSES, { 
    message: 'Le statut doit être: draft, published, closed, expired ou archived' 
  })
  status?: JobStatus;
}

// ============================================================
// UTILITAIRES POUR LES MISE À JOUR PARTIELLES
// ============================================================

/**
 * Interface pour représenter les champs modifiables d'une offre
 */
export interface UpdatableJobOfferFields {
  title_fr?: string;
  title_mg?: string;
  description_fr?: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: string;
  deadline?: Date;
  is_published?: boolean;
  image_url?: string;
}

/**
 * Type utilitaire pour les mises à jour partielles
 */
export type JobOfferUpdatePayload = Partial<UpdatableJobOfferFields>;

// ============================================================
// DTO POUR LA MISE À JOUR EN MASSE (BULK UPDATE)
// ============================================================

/**
 * DTO pour la mise à jour en masse des offres d'emploi
 * @description Permet de mettre à jour plusieurs offres simultanément
 */
export class BulkUpdateJobOfferDto {
  /**
   * Liste des IDs des offres à mettre à jour
   * @example ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"]
   */
  @IsOptional()
  ids?: string[];

  /**
   * Données à appliquer à toutes les offres sélectionnées
   */
  @IsOptional()
  data?: UpdateJobOfferDto;

  /**
   * Filtre pour sélectionner les offres à mettre à jour
   */
  @IsOptional()
  filter?: {
    status?: string;
    contract_type?: string;
    is_published?: boolean;
  };
}

// ============================================================
// EXEMPLE D'UTILISATION
// ============================================================

/**
 * @example
 * // Mise à jour partielle simple
 * const updateData: UpdateJobOfferDto = {
 *   title_fr: "Nouveau titre",
 *   is_published: true
 * };
 * 
 * // Mise à jour complète
 * const updateData: UpdateJobOfferDto = {
 *   title_fr: "Développeur Full Stack Senior",
 *   title_mg: "Mpamoovitra Full Stack Senior",
 *   description_fr: "Description détaillée...",
 *   description_mg: "Famaritana amin'ny teny malagasy...",
 *   company: "Tech Madagascar",
 *   location: "Antananarivo",
 *   contract_type: "CDI",
 *   deadline: new Date("2024-12-31"),
 *   is_published: true,
 *   image_url: "https://example.com/logo.jpg"
 * };
 */