// backend/src/modules/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour définir les rôles autorisés sur une route
 * Utilisation: @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Raccourci pour les routes réservées aux administrateurs
 */
export const AdminOnly = () => Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Raccourci pour les routes réservées au super administrateur
 */
export const SuperAdminOnly = () => Roles(UserRole.SUPER_ADMIN);

/**
 * Raccourci pour les routes réservées aux candidats
 */
export const CandidateOnly = () => Roles(UserRole.CANDIDATE);