// backend/src/modules/contact/dto/update-contact-status.dto.ts

import { IsString, IsNotEmpty, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactStatusDto {
  @ApiProperty({
    description: 'Nouveau statut du message',
    enum: ['unread', 'read', 'replied', 'archived'],
    example: 'replied',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Le statut est requis' })
  @IsIn(['unread', 'read', 'replied', 'archived'], { message: 'Statut invalide' })
  status: 'unread' | 'read' | 'replied' | 'archived';

  @ApiProperty({
    description: 'Notes internes de l\'administrateur (optionnel)',
    example: 'Message transfere au service RH',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Les notes ne doivent pas depasser 1000 caracteres' })
  admin_notes?: string;
}