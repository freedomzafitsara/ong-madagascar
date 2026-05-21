import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L adresse email est requise' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caracteres' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caracteres' })
  @MaxLength(50, { message: 'Le mot de passe ne doit pas depasser 50 caracteres' })
  password: string;

  @IsString({ message: 'Le prenom doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le prenom est requis' })
  @MinLength(2, { message: 'Le prenom doit contenir au moins 2 caracteres' })
  firstName: string;

  @IsString({ message: 'Le nom doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Le telephone doit être une chaîne de caracteres' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'La region doit être une chaîne de caracteres' })
  region?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Le rôle doit être une valeur valide parmi les rôles definis' })
  role?: UserRole;
}