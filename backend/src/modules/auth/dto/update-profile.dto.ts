// backend/src/modules/auth/dto/update-profile.dto.ts

import { IsString, IsOptional, IsUrl, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jean' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rakoto' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '0341234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Analamanga' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ example: 'Développeur fullstack...' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'Développeur Senior' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ example: 'Technique' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'React, Node.js, TypeScript' })
  @IsString()
  @IsOptional()
  skills?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/...' })
  @IsUrl()
  @IsOptional()
  socialLinkedin?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/...' })
  @IsUrl()
  @IsOptional()
  socialTwitter?: string;

  @ApiPropertyOptional({ example: 'https://github.com/...' })
  @IsUrl()
  @IsOptional()
  socialGithub?: string;

  // ✅ AJOUTER CETTE LIGNE
  @ApiPropertyOptional({ example: 'https://cloudinary.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar_url?: string;
}