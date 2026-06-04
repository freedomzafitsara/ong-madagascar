// backend/src/modules/auth/dto/register.dto.ts

import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L email est requis' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caracteres' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caracteres' })
  password: string;

  @IsString({ message: 'Le prenom doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le prenom est requis' })
  first_name: string;

  @IsString({ message: 'Le nom doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  last_name: string;

  @IsOptional()
  @IsIn(['admin', 'super_admin'], { message: 'Le role doit être admin ou super_admin' })
  role?: string;
}