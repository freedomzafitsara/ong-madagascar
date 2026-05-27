// backend/src/modules/blog/dto/create-blog-post.dto.ts

import { IsString, IsOptional, IsEnum, IsArray, MaxLength } from 'class-validator';
import { ArticleType, PostStatus } from '../../../entities/blog-post.entity';

export class UpdateBlogPostDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  summary_mg?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  content_mg?: string;

  @IsEnum(['news', 'testimonial', 'report', 'success_story', 'event_recap'])
  @IsOptional()
  type?: ArticleType;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: PostStatus;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class CreateBlogPostDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  summary: string;

  @IsString()
  @IsOptional()
  summary_mg?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  content_mg?: string;

  @IsEnum(['news', 'testimonial', 'report', 'success_story', 'event_recap'])
  type: ArticleType;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsEnum(['draft', 'published', 'archived'])
  @IsOptional()
  status?: PostStatus;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  author: string;
}