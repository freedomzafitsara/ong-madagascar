// backend/src/modules/auth/dto/update-role.dto.ts

import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateRoleDto {
  @IsString({ message: 'Le role doit être une chaîne de caracteres' })
  @IsNotEmpty({ message: 'Le role est requis' })
  @IsIn(['admin', 'super_admin'], { message: 'Le role doit être admin ou super_admin' })
  role: string;
}