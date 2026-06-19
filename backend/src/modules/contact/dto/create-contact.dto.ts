// backend/src/modules/contact/dto/create-contact.dto.ts

import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  @MaxLength(255, { message: 'Le nom ne doit pas depasser 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  full_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  @MaxLength(255, { message: 'Le nom ne doit pas depasser 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(255, { message: 'L\'email ne doit pas depasser 255 caracteres' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Le telephone ne doit pas depasser 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsString()
  @MinLength(3, { message: 'Le sujet doit contenir au moins 3 caracteres' })
  @MaxLength(500, { message: 'Le sujet ne doit pas depasser 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  subject: string;

  @IsString()
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caracteres' })
  @Transform(({ value }) => value?.trim())
  message: string;
}