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
  MaxLength
} from 'class-validator';
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
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  cover_letter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}