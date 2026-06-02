// backend/src/modules/blog/dto/create-blog-post.dto.ts

import { IsString, IsOptional, IsEnum, IsBoolean, MaxLength } from 'class-validator';

// Types d'articles simplifiés pour le thème
export enum ArticleType {
  NEWS = 'news',
  SUCCESS_STORY = 'success_story',
  REPORT = 'report',
}

// Statuts simplifiés
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(255)
  title_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  content_fr: string;

  @IsString()
  @IsOptional()
  content_mg?: string;

  @IsString()
  @IsOptional()
  summary_fr?: string;

  @IsString()
  @IsOptional()
  summary_mg?: string;

  @IsEnum(ArticleType)
  @IsOptional()
  type?: ArticleType;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsString()
  author_id: string;
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

  @IsEnum(ArticleType)
  @IsOptional()
  type?: ArticleType;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}