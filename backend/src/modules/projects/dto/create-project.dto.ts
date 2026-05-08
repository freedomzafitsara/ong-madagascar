import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max, IsBoolean } from 'class-validator';
import { ProjectStatus } from '../../../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  description_mg?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  spent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  beneficiaries_count?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  youth_impact?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  jobs_created?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  gallery_images?: string[];

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  managerId?: string;
}