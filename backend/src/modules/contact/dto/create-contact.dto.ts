// backend/src/modules/contact/dto/create-contact.dto.ts
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Nom complet du client',
    example: 'Client',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  @MaxLength(255, { message: 'Le nom ne doit pas depasser 255 caracteres' })
  full_name: string;

  @ApiProperty({
    description: 'Email du client',
    example: 'client@email.com',
    required: true,
  })
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(255, { message: 'L\'email ne doit pas depasser 255 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Telephone du client (optionnel)',
    example: '0321234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Le telephone ne doit pas depasser 50 caracteres' })
  phone?: string;

  @ApiProperty({
    description: 'Sujet du message',
    example: 'Demande d\'information sur les offres d\'emploi',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le sujet est requis' })
  @MinLength(3, { message: 'Le sujet doit contenir au moins 3 caracteres' })
  @MaxLength(255, { message: 'Le sujet ne doit pas depasser 255 caracteres' })
  subject: string;

  @ApiProperty({
    description: 'Message du client',
    example: 'Je souhaite obtenir plus d\'informations sur vos offres d\'emploi...',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le message est requis' })
  @MinLength(10, { message: 'Le message doit contenir au moins 10 caracteres' })
  @MaxLength(10000, { message: 'Le message ne doit pas depasser 10000 caracteres' })
  message: string;
}