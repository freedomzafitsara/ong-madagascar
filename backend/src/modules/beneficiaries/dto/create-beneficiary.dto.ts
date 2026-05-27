// backend/src/modules/beneficiaries/dto/create-beneficiary.dto.ts

import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateBeneficiaryDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  region: string;

  @IsNumber()
  @IsOptional()
  @Min(15)
  @Max(100)
  age?: number;

  @IsString()
  @IsOptional()
  employment_status?: string;

  @IsString()
  @IsOptional()
  education_level?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  before_income?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  after_income?: number;

  @IsString({ each: true })
  @IsOptional()
  skills?: string[];
}

export class UpdateBeneficiaryDto extends CreateBeneficiaryDto {}