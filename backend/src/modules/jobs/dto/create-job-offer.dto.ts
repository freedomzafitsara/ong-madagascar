import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsEmail } from 'class-validator';
import { JobType, JobStatus } from '../../../entities/job-offer.entity';

export class CreateJobOfferDto {
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

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}