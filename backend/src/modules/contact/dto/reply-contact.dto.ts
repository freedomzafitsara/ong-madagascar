// backend/src/modules/contact/dto/reply-contact.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyContactDto {
  @ApiProperty({
    description: 'Reponse au message du client',
    example: 'Bonjour, merci pour votre message. Nous reviendrons vers vous rapidement.',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'La reponse est requise' })
  @MinLength(10, { message: 'La reponse doit contenir au moins 10 caracteres' })
  @MaxLength(5000, { message: 'La reponse ne doit pas depasser 5000 caracteres' })
  reply: string;

  @ApiProperty({
    description: 'Notes internes de l\'administrateur (optionnel)',
    example: 'Client interessant, a recontacter dans 2 semaines',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Les notes ne doivent pas depasser 1000 caracteres' })
  admin_notes?: string;

  @ApiProperty({
    description: 'Copie de l\'email a l\'administrateur (optionnel)',
    example: 'admin@ymad.mg',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email de copie invalide' })
  cc?: string;
}