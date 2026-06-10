// backend/src/modules/blog/dto/create-blog-post.dto.ts

import { IsString, IsOptional, IsBoolean, MaxLength, IsUUID, IsNotEmpty, IsInt, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlogPostDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre français est requis' })
  @MaxLength(255, { message: 'Le titre ne doit pas dépasser 255 caractères' })
  title_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Le titre malgache ne doit pas dépasser 255 caractères' })
  title_mg?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu français est requis' })
  content_fr: string;

  @IsString()
  @IsOptional()
  content_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000, { message: 'Le résumé ne doit pas dépasser 10000 caractères' })
  summary_fr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000, { message: 'Le résumé malgache ne doit pas dépasser 10000 caractères' })
  summary_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  image_url?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  status?: string = 'draft';

  @IsString()
  @IsOptional()
  type?: string = 'news';

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  author?: string;

  // SUPPRIMER author_id du DTO - on l'utilise depuis le token
  // @IsUUID()
  // @IsOptional()
  // author_id?: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;
}

export class UpdateBlogPostDto {
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
  content_fr?: string;

  @IsString()
  @IsOptional()
  content_mg?: string;

  @IsString()
  @IsOptional()
  summary_fr?: string;

  @IsString()
  @IsOptional()
  summary_mg?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  author?: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;
}

export class BlogPostQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  search?: string;
}