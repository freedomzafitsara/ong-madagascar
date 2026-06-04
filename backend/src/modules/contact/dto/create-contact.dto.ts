// backend/src/modules/contact/dto/create-contact.dto.ts

import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255, { message: 'Le nom ne doit pas dépasser 255 caractères' })
  full_name: string;

  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @MaxLength(255, { message: 'L\'email ne doit pas dépasser 255 caractères' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'L\'objet est requis' })
  @MinLength(3, { message: 'L\'objet doit contenir au moins 3 caractères' })
  @MaxLength(255, { message: 'L\'objet ne doit pas dépasser 255 caractères' })
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

  @IsOptional()
  @IsString()
  admin_notes?: string;
}

export class ReplyContactDto {
  @IsString()
  @IsNotEmpty({ message: 'La réponse est requise' })
  @MinLength(10, { message: 'La réponse doit contenir au moins 10 caractères' })
  reply_message: string;
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