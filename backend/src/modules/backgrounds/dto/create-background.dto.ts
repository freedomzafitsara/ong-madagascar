import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateBackgroundDto {
  @IsString()
  page: string;

  @IsString()
  image_url: string;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @IsOptional()
  @IsString()
  mobile_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  alt_text?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overlay_opacity?: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  size?: string;
}

export class UpdateBackgroundDto extends PartialType(CreateBackgroundDto) {}