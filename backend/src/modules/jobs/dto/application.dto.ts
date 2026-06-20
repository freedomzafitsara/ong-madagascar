// backend/src/modules/jobs/dto/application.dto.ts

import { 
  IsUUID, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  Min, 
  Max,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsUrl,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================================
// ENUMERATIONS
// ============================================================

export enum ApplicationStatusEnum {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

// ============================================================
// DTO POUR LA CREATION D'UNE CANDIDATURE
// ============================================================

export class CreateJobApplicationDto {
  @IsUUID(4, { message: 'L\'ID de l\'offre doit etre un UUID valide' })
  @IsNotEmpty({ message: 'L\'ID de l\'offre est requis' })
  job_offer_id: string;

  @IsString({ message: 'Le nom complet doit etre une chaine de caracteres' })
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @MinLength(2, { message: 'Le nom complet doit contenir au moins 2 caracteres' })
  @MaxLength(255, { message: 'Le nom complet ne doit pas depasser 255 caracteres' })
  full_name: string;

  @IsEmail({}, { message: 'L\'email doit etre valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @MaxLength(255, { message: 'L\'email ne doit pas depasser 255 caracteres' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Le telephone doit etre une chaine de caracteres' })
  @MaxLength(20, { message: 'Le telephone ne doit pas depasser 20 caracteres' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'adresse ne doit pas depasser 500 caracteres' })
  address?: string;

  @IsOptional()
  @IsInt({ message: 'Les annees d\'experience doivent etre un nombre entier' })
  @Min(0, { message: 'Les annees d\'experience doivent etre superieures ou egales a 0' })
  @Max(50, { message: 'Les annees d\'experience ne doivent pas depasser 50' })
  @Type(() => Number)
  experience_years?: number;

  @IsOptional()
  @IsString({ message: 'Le poste actuel doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'Le poste actuel ne doit pas depasser 100 caracteres' })
  current_position?: string;

  @IsOptional()
  @IsString({ message: 'L\'entreprise actuelle doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'L\'entreprise actuelle ne doit pas depasser 100 caracteres' })
  current_company?: string;

  // ✅ CORRECTION: Supprimer @IsUrl() et utiliser @IsString()
  @IsOptional()
  @IsString({ message: 'Le CV doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL du CV ne doit pas depasser 500 caracteres' })
  cv_url?: string;

  @IsOptional()
  @IsString({ message: 'La lettre de motivation doit etre une chaine de caracteres' })
  @MaxLength(10000, { message: 'La lettre de motivation ne doit pas depasser 10000 caracteres' })
  cover_letter?: string;

  // ✅ CORRECTION: Supprimer @IsUrl() et utiliser @IsString()
  @IsOptional()
  @IsString({ message: 'L\'URL de la lettre de motivation doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL de la lettre de motivation ne doit pas depasser 500 caracteres' })
  cover_letter_url?: string;

  // ✅ CORRECTION: Supprimer @IsUrl() et utiliser @IsString()
  @IsOptional()
  @IsString({ message: 'L\'URL de la photo doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL de la photo ne doit pas depasser 500 caracteres' })
  photo_url?: string;

  @IsOptional()
  @IsString({ message: 'L\'URL LinkedIn doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL LinkedIn ne doit pas depasser 500 caracteres' })
  linkedin_url?: string;

  @IsOptional()
  @IsString({ message: 'L\'URL du portfolio doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL du portfolio ne doit pas depasser 500 caracteres' })
  portfolio_url?: string;

  @IsOptional()
  @IsString({ message: 'L\'URL du diplome doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL du diplome ne doit pas depasser 500 caracteres' })
  diploma_url?: string;

  @IsOptional()
  @IsString({ message: 'L\'URL de l\'attestation doit etre une chaine de caracteres' })
  @MaxLength(500, { message: 'L\'URL de l\'attestation ne doit pas depasser 500 caracteres' })
  attestation_url?: string;

  @IsOptional()
  @IsString({ message: 'L\'experience doit etre une chaine de caracteres' })
  @MaxLength(10000, { message: 'L\'experience ne doit pas depasser 10000 caracteres' })
  experience?: string;
}

// ============================================================
// DTO POUR LA MISE A JOUR DU STATUT D'UNE CANDIDATURE
// ============================================================

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatusEnum, { message: 'Le statut doit etre: submitted, reviewing, shortlisted, accepted ou rejected' })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: ApplicationStatusEnum;

  @IsOptional()
  @IsString({ message: 'Les notes doivent etre une chaine de caracteres' })
  @MaxLength(2000, { message: 'Les notes ne doivent pas depasser 2000 caracteres' })
  notes?: string;
}

// ============================================================
// DTO POUR LES REQUETES DE LISTE DES CANDIDATURES
// ============================================================

export class ApplicationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit etre un nombre entier' })
  @Min(1, { message: 'La page doit etre superieure ou egale a 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit etre un nombre entier' })
  @Min(1, { message: 'La limite doit etre superieure ou egale a 1' })
  @Max(100, { message: 'La limite ne doit pas depasser 100' })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ApplicationStatusEnum, { message: 'Le statut doit etre valide' })
  status?: ApplicationStatusEnum;

  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'offre doit etre un UUID valide' })
  job_offer_id?: string;

  @IsOptional()
  @IsString({ message: 'La recherche doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'La recherche ne doit pas depasser 100 caracteres' })
  search?: string;
}

// ============================================================
// DTO POUR LA REPONSE D'UNE CANDIDATURE
// ============================================================

export class ApplicationResponseDto {
  id: string;
  job_offer_id: string;
  job_title_fr?: string;
  job_title_mg?: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  current_position?: string;
  current_company?: string;
  cv_url?: string;
  cover_letter?: string;
  cover_letter_url?: string;
  photo_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: string;
  status_label?: string;
  notes?: string;
  created_at: Date;
  applied_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;

  constructor(partial: Partial<ApplicationResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: any): ApplicationResponseDto {
    const statusLabels: Record<string, string> = {
      submitted: 'Soumise',
      reviewing: 'En cours d\'examen',
      shortlisted: 'Préselectionnee',
      accepted: 'Acceptee',
      rejected: 'Rejetee'
    };

    return new ApplicationResponseDto({
      id: entity.id,
      job_offer_id: entity.job_offer_id,
      job_title_fr: entity.jobOffer?.title_fr,
      job_title_mg: entity.jobOffer?.title_mg,
      full_name: entity.full_name,
      email: entity.email,
      phone: entity.phone,
      address: entity.address,
      experience_years: entity.experience_years,
      current_position: entity.current_position,
      current_company: entity.current_company,
      cv_url: entity.cv_url,
      cover_letter: entity.cover_letter,
      cover_letter_url: entity.cover_letter_url,
      photo_url: entity.photo_url,
      linkedin_url: entity.linkedin_url,
      portfolio_url: entity.portfolio_url,
      status: entity.status,
      status_label: statusLabels[entity.status] || entity.status,
      notes: entity.notes,
      created_at: entity.created_at,
      applied_at: entity.applied_at || entity.created_at,
      reviewed_at: entity.reviewed_at,
      reviewed_by: entity.reviewed_by
    });
  }
}

// ============================================================
// DTO POUR LES STATISTIQUES DES CANDIDATURES
// ============================================================

export class ApplicationStatsResponseDto {
  total: number;
  submitted: number;
  reviewing: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
  pending_review: number;
  acceptance_rate: number;
  rejection_rate: number;

  constructor(partial: Partial<ApplicationStatsResponseDto>) {
    Object.assign(this, partial);
    if (this.total > 0) {
      this.acceptance_rate = (this.accepted / this.total) * 100;
      this.rejection_rate = (this.rejected / this.total) * 100;
    } else {
      this.acceptance_rate = 0;
      this.rejection_rate = 0;
    }
    this.pending_review = this.submitted + this.reviewing;
  }
}

// ============================================================
// DTO POUR L'EXPORT DES CANDIDATURES
// ============================================================

export class ExportApplicationsQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatusEnum, { message: 'Le statut doit etre valide' })
  status?: ApplicationStatusEnum;

  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'offre doit etre un UUID valide' })
  job_offer_id?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La date de debut doit etre une date valide' })
  from_date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La date de fin doit etre une date valide' })
  to_date?: Date;
}

// ============================================================
// PAGINATED RESPONSE DTO
// ============================================================

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}