// backend/src/modules/auth/dto/update-profile.dto.ts

import { IsString, IsOptional, IsUrl, IsEmail, Length, IsBoolean, IsPhoneNumber, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Le prenom doit être une chaîne de caracteres' })
  @IsOptional()
  @Length(2, 100, { message: 'Le prenom doit contenir entre 2 et 100 caracteres' })
  first_name?: string;

  @IsString({ message: 'Le nom doit être une chaîne de caracteres' })
  @IsOptional()
  @Length(2, 100, { message: 'Le nom doit contenir entre 2 et 100 caracteres' })
  last_name?: string;

  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsOptional()
  email?: string;

  //  AJOUT : Champ phone
  @IsString({ message: 'Le téléphone doit être une chaîne de caracteres' })
  @IsOptional()
  @MaxLength(20, { message: 'Le téléphone ne doit pas dépasser 20 caracteres' })
  phone?: string;

  @IsString({ message: 'Le role doit être une chaîne de caracteres' })
  @IsOptional()
  role?: string;

  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit être un booleen' })
  is_active?: boolean;

  @IsUrl({}, { message: 'L URL de l avatar doit être une URL valide' })
  @IsOptional()
  avatar?: string;

  //  AJOUT : Champ pour la langue préférée
  @IsString({ message: 'La langue préférée doit être une chaîne de caracteres' })
  @IsOptional()
  @Length(2, 10, { message: 'La langue doit contenir entre 2 et 10 caracteres' })
  preferred_language?: string;

  //  AJOUT : Champ pour le fuseau horaire
  @IsString({ message: 'Le fuseau horaire doit être une chaîne de caracteres' })
  @IsOptional()
  timezone?: string;
}