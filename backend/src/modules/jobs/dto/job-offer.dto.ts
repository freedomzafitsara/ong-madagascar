import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsDate, 
  IsEmail, 
  Length, 
  MaxLength, 
  IsNotEmpty,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobType, JobStatus } from '../../../entities/job-offer.entity';

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  @IsNotEmpty()
  @Length(20, 5000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_mg?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  company_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['cdi', 'cdd', 'stage', 'freelance', 'benevolat'])
  job_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sector?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contact_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contact_phone?: string;
}

export class UpdateJobOfferDto {
  @IsOptional()
  @IsString()
  @Length(5, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(20, 5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_mg?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  company_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsString()
  @IsIn(['cdi', 'cdd', 'stage', 'freelance', 'benevolat'])
  job_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sector?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contact_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contact_phone?: string;
}

export class UpdateJobStatusDto {
  @IsEnum(JobStatus)
  @IsNotEmpty()
  status: JobStatus;
}