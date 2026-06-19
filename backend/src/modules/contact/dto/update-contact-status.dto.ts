// backend/src/modules/contact/dto/update-contact-status.dto.ts

import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateContactStatusDto {
  @IsString()
  @IsIn(['unread', 'read', 'replied', 'archived'], {
    message: 'Statut invalide. Valeurs autorisees: unread, read, replied, archived'
  })
  status: string;

  @IsOptional()
  @IsString()
  admin_notes?: string;
}