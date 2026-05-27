import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsUrl, IsNumber, Min } from 'class-validator';

export type PartnerType = 'company' | 'ngo' | 'embassy' | 'institution';

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  name_mg?: string;

  @IsUrl()
  @IsOptional()
  logo_url?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  description_mg?: string;

  @IsEnum(['company', 'ngo', 'embassy', 'institution'])
  partner_type: PartnerType;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsUrl()
  @IsOptional()
  contract_url?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  contribution_amount?: number;

  @IsEmail()
  contact_email: string;

  @IsString()
  @IsOptional()
  contact_phone?: string;
}

export class UpdatePartnerDto extends CreatePartnerDto {}