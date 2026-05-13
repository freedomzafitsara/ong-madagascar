// backend/src/modules/auth/dto/change-password.dto.ts

import { IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour le changement de mot de passe
 * Utilisé dans la route PUT /api/auth/change-password
 */
export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Mot de passe actuel de l\'utilisateur',
    example: 'MonAncienMotDePasse123',
    required: true 
  })
  @IsString({ message: 'Le mot de passe actuel doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe actuel est requis' })
  currentPassword: string;

  @ApiProperty({ 
    description: 'Nouveau mot de passe (minimum 6 caractères)',
    example: 'MonNouveauMotDePasse456',
    minLength: 6,
    required: true 
  })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
  // Optionnel: Ajouter une validation de force du mot de passe
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une lettre et un chiffre',
  })
  newPassword: string;
}