import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L adresse email est requise' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}