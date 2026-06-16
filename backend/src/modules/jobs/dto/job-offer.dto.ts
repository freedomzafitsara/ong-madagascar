// backend/src/modules/jobs/dto/job-offer.dto.ts

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsDate, 
  IsUUID,
  MaxLength, 
  MinLength,
  IsNotEmpty,
  Min,
  Max,
  IsIn,
  IsInt
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';

// ============================================================
// CONSTANTES ET ENUMERATIONS
// ============================================================

export const CONTRACT_TYPES = ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'ALTERNANCE', 'TEMPORARY'] as const;
export type ContractType = typeof CONTRACT_TYPES[number];

export const JOB_STATUSES = ['draft', 'published', 'closed', 'expired', 'archived'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

// ============================================================
// CREATE JOB OFFER DTO
// ============================================================

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre en francais est requis' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caracteres' })
  @MaxLength(255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_fr: string;

  @IsString()
  @IsNotEmpty({ message: 'La description en francais est requise' })
  @MinLength(20, { message: 'La description doit contenir au moins 20 caracteres' })
  description_fr: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Le titre malgache ne doit pas depasser 255 caracteres' })
  title_mg?: string;

  @IsOptional()
  @IsString()
  description_mg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Le nom de l\'entreprise ne doit pas depasser 255 caracteres' })
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Le lieu ne doit pas depasser 255 caracteres' })
  location?: string;

  @IsOptional()
  @IsString()
  @IsIn(CONTRACT_TYPES, { message: 'Le type de contrat doit etre: CDI, CDD, STAGE, FREELANCE, ALTERNANCE ou TEMPORARY' })
  contract_type?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La date limite doit etre une date valide' })
  deadline?: Date;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'is_published doit etre un booleen' })
  is_published?: boolean;

  // ✅ CORRECTION: Supprimer @IsUrl() - Accepter URL relative ou absolue
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas depasser 500 caracteres' })
  image_url?: string;

  @IsOptional()
  @IsUUID(4, { message: 'main_image_id doit etre un UUID valide' })
  main_image_id?: string;
}

// ============================================================
// UPDATE JOB OFFER DTO
// ============================================================

export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {}

// ============================================================
// UPDATE JOB STATUS DTO
// ============================================================

export class UpdateJobStatusDto {
  @IsString({ message: 'Le statut doit etre une chaine de caracteres' })
  @IsIn(JOB_STATUSES, { 
    message: 'Le statut doit etre: draft, published, closed, expired ou archived' 
  })
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: JobStatus;
}

// ============================================================
// JOB OFFER QUERY DTO
// ============================================================

export class JobOfferQueryDto {
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
  @IsString()
  @IsIn(JOB_STATUSES, { message: 'Le statut doit etre valide' })
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'is_published doit etre un booleen' })
  is_published?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(CONTRACT_TYPES, { message: 'Le type de contrat doit etre valide' })
  contract_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La recherche ne doit pas depasser 100 caracteres' })
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'deadline', 'title_fr', 'views_count', 'applications_count'], {
    message: 'Le tri doit etre: created_at, updated_at, deadline, title_fr, views_count ou applications_count'
  })
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'L\'ordre doit etre ASC ou DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ============================================================
// JOB OFFER RESPONSE DTO
// ============================================================

export class JobOfferResponseDto {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: string;
  deadline?: Date;
  is_published: boolean;
  image_url?: string;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: Date;
  updated_at: Date;
  days_until_deadline?: number;
  is_expired?: boolean;
  main_image_id?: string;

  constructor(partial: Partial<JobOfferResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: any): JobOfferResponseDto {
    const dto = new JobOfferResponseDto({
      id: entity.id,
      title_fr: entity.title_fr,
      title_mg: entity.title_mg,
      description_fr: entity.description_fr,
      description_mg: entity.description_mg,
      company: entity.company,
      location: entity.location,
      contract_type: entity.contract_type,
      deadline: entity.deadline,
      is_published: entity.is_published,
      image_url: entity.image_url,
      status: entity.status,
      views_count: entity.views_count,
      applications_count: entity.applications_count,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      main_image_id: entity.main_image_id
    });

    if (entity.deadline) {
      const today = new Date();
      const deadline = new Date(entity.deadline);
      dto.days_until_deadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      dto.is_expired = dto.days_until_deadline < 0;
    }

    return dto;
  }
}

// ============================================================
// JOB OFFER STATS DTO
// ============================================================

export class JobOfferStatsDto {
  total: number;
  published: number;
  draft: number;
  expired: number;
  closed: number;
  archived: number;
  total_views: number;
  total_applications: number;
  conversion_rate?: number;
  contracts_by_type?: Record<string, number>;
  locations?: Record<string, number>;

  constructor(partial: Partial<JobOfferStatsDto>) {
    Object.assign(this, partial);
    if (this.total > 0 && this.total_applications !== undefined) {
      this.conversion_rate = (this.total_applications / this.total) * 100;
    }
  }
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