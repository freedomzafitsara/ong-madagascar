import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../entities/user.entity';

export class UpdateRoleDto {
  @IsEnum(UserRole, { message: 'Le rôle doit être une valeur valide parmi les rôles definis' })
  @IsNotEmpty({ message: 'Le rôle est requis' })
  role: UserRole;
}