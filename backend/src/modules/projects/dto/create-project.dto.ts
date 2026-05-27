// backend/src/modules/projects/dto/create-project.dto.ts

import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ProjectStatus } from '../../../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  title_mg?: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  description_mg?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  category: string;

  @IsString()
  region: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  spent?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  beneficiaries_count?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  youth_impact?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  jobs_created?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsArray()
  @IsOptional()
  gallery_images?: string[];

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;
}

export class UpdateProjectDto extends CreateProjectDto {}