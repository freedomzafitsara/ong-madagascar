// backend/src/modules/volunteers/dto/create-volunteer.dto.ts

import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsUUID, IsNumber, Min, IsUrl } from 'class-validator';
import { VolunteerStatus, AvailabilityType } from '../../../entities/volunteer.entity';

export class CreateVolunteerDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUrl()
  @IsOptional()
  photo_url?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsString()
  region: string;

  @IsString()
  @IsOptional()
  availability?: string;

  @IsEnum(AvailabilityType)
  @IsOptional()
  availability_type?: AvailabilityType;

  @IsEnum(VolunteerStatus)
  @IsOptional()
  status?: VolunteerStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hours?: number;
}

export class UpdateVolunteerDto extends CreateVolunteerDto {}

export class VolunteerQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  region?: string;

  @IsOptional()
  status?: VolunteerStatus;

  @IsOptional()
  search?: string;
}