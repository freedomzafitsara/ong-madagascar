// backend/src/modules/contact/dto/reply-contact.dto.ts

import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class ReplyContactDto {
  @IsString()
  @MinLength(3, { message: 'La reponse doit contenir au moins 3 caracteres' })
  @MaxLength(5000, { message: 'La reponse ne doit pas depasser 5000 caracteres' })
  reply: string;

  @IsOptional()
  @IsString()
  admin_notes?: string;
}