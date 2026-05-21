import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Le token doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;

  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caracteres' })
  newPassword: string;
}