import { IsUUID, IsString, IsEmail, IsOptional, IsInt, Min, Max, IsEnum, IsIn, Length, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '../../../entities/job-application.entity';

export class CreateJobApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  job_offer_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsOptional()
  @IsString()
  cover_letter?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}