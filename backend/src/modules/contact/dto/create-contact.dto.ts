// backend/src/modules/contact/dto/create-contact.dto.ts

import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Nom complet du client',
    example: 'Jean Dupont',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  @MaxLength(100, { message: 'Le nom ne doit pas depasser 100 caracteres' })
  full_name: string;

  @ApiProperty({
    description: 'Email du client',
    example: 'jean.dupont@email.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(100, { message: 'L\'email ne doit pas depasser 100 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Telephone du client (optionnel)',
    example: '+261 32 12 345 67',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('MG', { message: 'Numero de telephone malgache invalide' })
  @MaxLength(20, { message: 'Le telephone ne doit pas depasser 20 caracteres' })
  phone?: string;

  @ApiProperty({
    description: 'Sujet du message',
    example: 'Demande d\'information sur les offres d\'emploi',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le sujet est requis' })
  @MinLength(3, { message: 'Le sujet doit contenir au moins 3 caracteres' })
  @MaxLength(200, { message: 'Le sujet ne doit pas depasser 200 caracteres' })
  subject: string;

  @ApiProperty({
    description: 'Message du client',
    example: 'Je souhaite obtenir plus d\'informations sur vos offres d\'emploi pour les jeunes...',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le message est requis' })
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caracteres' })
  @MaxLength(5000, { message: 'Le message ne doit pas depasser 5000 caracteres' })
  message: string;
}