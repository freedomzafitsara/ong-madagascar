// backend/src/modules/jobs/dto/create-job-application.dto.ts

import { 
  IsUUID, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsInt, 
  Min, 
  Max, 
  IsEnum, 
  Length, 
  IsNotEmpty,
  IsUrl,
  IsDate,
  IsArray,
  MaxLength,
  MinLength
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApplicationStatus } from '../../../entities/job-application.entity';

export class CreateJobApplicationDto {
  @IsUUID(undefined, { message: 'L\'ID de l\'offre doit être un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID de l\'offre est requis' })
  job_offer_id: string;

  @IsString({ message: 'Le nom complet doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @MinLength(2, { message: 'Le nom complet doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom complet ne doit pas dépasser 255 caractères' })
  full_name: string;

  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @MaxLength(255, { message: 'L\'email ne doit pas dépasser 255 caractères' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @MinLength(9, { message: 'Le téléphone doit contenir au moins 9 caractères' })
  @MaxLength(20, { message: 'Le téléphone ne doit pas dépasser 20 caractères' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @MaxLength(500, { message: 'L\'adresse ne doit pas dépasser 500 caractères' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La ville ne doit pas dépasser 100 caractères' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'La région doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La région ne doit pas dépasser 100 caractères' })
  region?: string;

  @IsOptional()
  @IsInt({ message: 'Les années d\'expérience doivent être un nombre entier' })
  @Min(0, { message: 'Les années d\'expérience doivent être positives' })
  @Max(50, { message: 'Les années d\'expérience ne peuvent pas dépasser 50' })
  experience_years?: number;

  @IsOptional()
  @IsString({ message: 'Le niveau d\'éducation doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le niveau d\'éducation ne doit pas dépasser 100 caractères' })
  education_level?: string;

  @IsOptional()
  @IsString({ message: 'Le poste actuel doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'Le poste actuel ne doit pas dépasser 255 caractères' })
  current_position?: string;

  @IsOptional()
  @IsString({ message: 'L\'entreprise actuelle doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'L\'entreprise actuelle ne doit pas dépasser 255 caractères' })
  current_company?: string;

  @IsOptional()
  @IsArray({ message: 'Les compétences doivent être un tableau' })
  @IsString({ each: true, message: 'Chaque compétence doit être une chaîne de caractères' })
  skills?: string[];

  @IsOptional()
  @IsString({ message: 'La lettre de motivation doit être une chaîne de caractères' })
  @MaxLength(5000, { message: 'La lettre de motivation ne doit pas dépasser 5000 caractères' })
  cover_letter?: string;

  @IsOptional()
  @IsString({ message: 'Le message doit être une chaîne de caractères' })
  @MaxLength(5000, { message: 'Le message ne doit pas dépasser 5000 caractères' })
  message?: string;

  // URLs des documents (pour l'upload direct)
  @IsOptional()
  @IsUrl({}, { message: 'L\'URL de la photo doit être valide' })
  @MaxLength(500, { message: 'L\'URL de la photo ne doit pas dépasser 500 caractères' })
  photo_url?: string;

  @IsOptional()
  @IsUrl({}, { message: 'L\'URL du CV doit être valide' })
  @MaxLength(500, { message: 'L\'URL du CV ne doit pas dépasser 500 caractères' })
  cv_url?: string;

  @IsOptional()
  @IsUrl({}, { message: 'L\'URL du diplôme doit être valide' })
  @MaxLength(500, { message: 'L\'URL du diplôme ne doit pas dépasser 500 caractères' })
  diploma_url?: string;

  @IsOptional()
  @IsUrl({}, { message: 'L\'URL de l\'attestation doit être valide' })
  @MaxLength(500, { message: 'L\'URL de l\'attestation ne doit pas dépasser 500 caractères' })
  attestation_url?: string;

  // Disponibilité
  @IsOptional()
  @IsDate({ message: 'La date de disponibilité doit être une date valide' })
  availability_date?: Date;

  @IsOptional()
  @IsInt({ message: 'La période de préavis doit être un nombre entier' })
  @Min(0, { message: 'La période de préavis doit être positive' })
  notice_period_days?: number;

  // Salaire attendu
  @IsOptional()
  @IsString({ message: 'Le salaire attendu doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le salaire attendu ne doit pas dépasser 100 caractères' })
  expected_salary?: string;

  // Source
  @IsOptional()
  @IsString({ message: 'La source doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'La source ne doit pas dépasser 100 caractères' })
  source?: string;

  @IsOptional()
  @IsString({ message: 'Le référent doit être une chaîne de caractères' })
  @MaxLength(255, { message: 'Le référent ne doit pas dépasser 255 caractères' })
  referrer?: string;
}

export class UpdateJobApplicationDto extends PartialType(CreateJobApplicationDto) {}

// ============================================================
// UPDATE APPLICATION STATUS DTO
// ============================================================

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus, { message: 'Le statut doit être une valeur valide' })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: ApplicationStatus;

  @IsOptional()
  @IsString({ message: 'Les notes doivent être une chaîne de caractères' })
  @MaxLength(1000, { message: 'Les notes ne doivent pas dépasser 1000 caractères' })
  notes?: string;
}

// ============================================================
// JOB APPLICATION QUERY DTO
// ============================================================

export class JobApplicationQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus, { message: 'Le statut doit être une valeur valide' })
  status?: ApplicationStatus;

  @IsOptional()
  @IsUUID(undefined, { message: 'L\'ID de l\'offre doit être un UUID valide' })
  job_offer_id?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  user_id?: string;

  @IsOptional()
  @IsDate({ message: 'La date de début doit être une date valide' })
  from_date?: Date;

  @IsOptional()
  @IsDate({ message: 'La date de fin doit être une date valide' })
  to_date?: Date;

  @IsOptional()
  @IsInt({ message: 'La page doit être un nombre entier' })
  @Min(1, { message: 'La page doit être au moins 1' })
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'La limite doit être un nombre entier' })
  @Min(1, { message: 'La limite doit être au moins 1' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100' })
  limit?: number = 10;
}

// ============================================================
// JOB APPLICATION RESPONSE DTO
// ============================================================

export class JobApplicationResponseDto {
  id: string;
  job_offer_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  experience_years: number;
  education_level?: string;
  current_position?: string;
  current_company?: string;
  skills: string[];
  cover_letter?: string;
  photo_url?: string;
  cv_url: string;
  diploma_url?: string;
  attestation_url?: string;
  status: string;
  admin_notes?: string;
  rejection_reason?: string;
  interview_date?: Date;
  score?: number;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}