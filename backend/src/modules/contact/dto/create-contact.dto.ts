// backend/src/modules/contact/dto/create-contact.dto.ts

import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom ne doit pas dépasser 255 caractères' })
  name: string;  // Changé: full_name -> name

  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @MaxLength(255, { message: 'L\'email ne doit pas dépasser 255 caractères' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Le téléphone ne doit pas dépasser 50 caractères' })
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le sujet est requis' })
  @MinLength(3, { message: 'Le sujet doit contenir au moins 3 caractères' })
  @MaxLength(500, { message: 'Le sujet ne doit pas dépasser 500 caractères' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Le message est requis' })
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caractères' })
  @MaxLength(5000, { message: 'Le message ne doit pas dépasser 5000 caractères' })
  message: string;
}

export class UpdateContactStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Le statut est requis' })
  status: string;
}

export class ContactQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  status?: string;

  @IsOptional()
  search?: string;
}