import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/roles.enum';  // ← Doit pointer vers le bon fichier

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);