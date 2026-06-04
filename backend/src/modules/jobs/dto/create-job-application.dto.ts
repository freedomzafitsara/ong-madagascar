/**
 * DTO pour la création d'une candidature
 * @description Contient toutes les validations pour soumettre une candidature
 * 
 * Champs obligatoires :
 * - job_offer_id: UUID de l'offre
 * - full_name: Nom complet du candidat
 * - email: Email du candidat
 * 
 * Champs optionnels :
 * - phone, cv_url
 * - cover_letter
 */

import { 
  IsUUID, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsIn,
  Length, 
  IsNotEmpty,
  IsUrl,
  Matches,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

// Types pour les statuts (utilisés pour la validation)
const VALID_STATUSES = ['submitted', 'reviewing', 'shortlisted', 'accepted', 'rejected'] as const;
type ValidStatus = typeof VALID_STATUSES[number];

export class CreateJobApplicationDto {
  // ============================================================
  // RELATION
  // ============================================================
  
  /**
   * ID de l'offre d'emploi
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID(4, { message: 'L\'ID de l\'offre doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID de l\'offre est requis' })
  job_offer_id: string;

  // ============================================================
  // INFORMATIONS PERSONNELLES
  // ============================================================
  
  /**
   * Nom complet du candidat
   * @example "Rakoto Jean"
   */
  @IsString({ message: 'Le nom complet doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @Length(2, 255, { message: 'Le nom complet doit contenir entre 2 et 255 caractères' })
  @Matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/, { 
    message: 'Le nom complet ne doit contenir que des lettres, espaces, tirets et apostrophes' 
  })
  full_name: string;

  /**
   * Adresse email du candidat
   * @example "jean.rakoto@email.com"
   */
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @MaxLength(255, { message: 'L\'email ne doit pas dépasser 255 caractères' })
  email: string;

  /**
   * Numéro de téléphone du candidat
   * @example "+261341234567"
   */
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @Length(9, 20, { message: 'Le téléphone doit contenir entre 9 et 20 caractères' })
  @Matches(/^[+\d\s\-]+$/, { 
    message: 'Le téléphone ne doit contenir que des chiffres, espaces, tirets et le signe +' 
  })
  phone?: string;

  // ============================================================
  // DOCUMENTS DE CANDIDATURE
  // ============================================================
  
  /**
   * Lettre de motivation
   * @example "Je suis vivement intéressé par ce poste..."
   */
  @IsOptional()
  @IsString({ message: 'La lettre de motivation doit être une chaîne de caractères' })
  @MaxLength(10000, { message: 'La lettre de motivation ne doit pas dépasser 10000 caractères' })
  cover_letter?: string;

  // ============================================================
  // URLs DES DOCUMENTS (Cloudinary)
  // ============================================================
  
  /**
   * URL du CV (fichier PDF)
   * @example "https://res.cloudinary.com/.../cv.pdf"
   */
  @IsOptional()
  @IsUrl({}, { message: 'L\'URL du CV doit être une URL valide' })
  @MaxLength(500, { message: 'L\'URL du CV ne doit pas dépasser 500 caractères' })
  cv_url?: string;
}

/**
 * DTO pour la mise à jour du statut d'une candidature
 */
export class UpdateApplicationStatusDto {
  /**
   * Nouveau statut de la candidature
   * Valeurs possibles : submitted, reviewing, shortlisted, accepted, rejected
   * @example "accepted"
   */
  @IsString({ message: 'Le statut doit être une chaîne de caractères' })
  @IsIn(VALID_STATUSES, { 
    message: 'Le statut doit être une valeur valide: submitted, reviewing, shortlisted, accepted, rejected' 
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: string;

  /**
   * Notes internes du recruteur (optionnel)
   * @example "Candidat très prometteur, à contacter pour un entretien"
   */
  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  @MaxLength(2000, { message: 'Les notes ne doivent pas dépasser 2000 caractères' })
  notes?: string;
}

/**
 * DTO pour la recherche/filtrage des candidatures
 */
export class JobApplicationQueryDto {
  /**
   * Filtrer par statut de candidature
   */
  @IsOptional()
  @IsString()
  @IsIn(VALID_STATUSES, { message: 'Le statut doit être une valeur valide' })
  status?: string;

  /**
   * Filtrer par offre d'emploi spécifique
   */
  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'offre doit être un UUID valide' })
  job_offer_id?: string;

  /**
   * Page de résultats (pour pagination)
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  /**
   * Nombre d'éléments par page
   * @default 10
   */
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}