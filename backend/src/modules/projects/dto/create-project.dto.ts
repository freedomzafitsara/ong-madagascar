// backend/src/modules/projects/dto/create-project.dto.ts

import { IsString, IsOptional, IsDateString, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  description_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_fr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description_fr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class ProjectQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  status?: string;

  @IsOptional()
  search?: string;
}