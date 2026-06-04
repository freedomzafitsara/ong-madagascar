// backend/src/modules/blog/dto/create-blog-post.dto.ts

import { IsString, IsOptional, IsBoolean, MaxLength, IsUUID, IsNotEmpty } from 'class-validator';

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
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  cover_image?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsUUID()
  @IsNotEmpty({ message: 'L\'ID de l\'auteur est requis' })
  author_id: string;

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
  cover_image?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsUUID()
  @IsOptional()
  category_id?: string;
}

export class BlogPostQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  status?: string;

  @IsOptional()
  category_id?: string;

  @IsOptional()
  search?: string;
}