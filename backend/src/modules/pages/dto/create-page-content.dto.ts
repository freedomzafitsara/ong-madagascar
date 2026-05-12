import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class HeroDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  subtitle_mg?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  badge_mg?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  buttonText_mg?: string;

  @IsOptional()
  @IsString()
  buttonLink?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}

class SectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  description_mg?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  order?: number;

  @IsOptional()
  isActive?: boolean;
}

export class CreatePageContentDto {
  @IsString()
  page: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeroDto)
  hero?: HeroDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  @IsOptional()
  @IsArray()
  stats?: any[];

  @IsOptional()
  @IsObject()
  cta?: any;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;

  @IsOptional()
  @IsString()
  seo_keywords?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;
}

export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {}