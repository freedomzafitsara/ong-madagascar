// backend/src/modules/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const ROLES_KEY = 'roles';

// Rôles supportés par votre thème
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est requis, tout le monde peut accéder
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const route = `${request.method} ${request.url}`;

    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      this.logger.warn(`Tentative d'accès sans authentification à ${route}`);
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Accès non autorisé. Veuillez vous authentifier.',
        error: 'Forbidden',
      });
    }

    // Vérifier si l'utilisateur a un rôle
    if (!user.role) {
      this.logger.warn(`Utilisateur ${user.email} n'a pas de rôle défini`);
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Votre compte n\'a pas de rôle défini. Contactez l\'administrateur.',
        error: 'Forbidden',
      });
    }

    // Vérifier si l'utilisateur a un des rôles requis
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      this.logger.warn(
        `Utilisateur ${user.email} (rôle: ${user.role}) a tenté d'accéder à ${route} - Rôles requis: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException({
        statusCode: 403,
        message: `Accès refusé. Rôle requis: ${this.getRoleLabels(requiredRoles).join(', ')}. Votre rôle actuel: ${this.getRoleLabel(user.role)}.`,
        error: 'Forbidden',
        requiredRoles: requiredRoles,
        currentRole: user.role,
      });
    }

    this.logger.debug(`Utilisateur ${user.email} (${user.role}) autorisé sur ${route}`);
    return true;
  }

  private getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      super_admin: 'Super Administrateur',
      admin: 'Administrateur',
    };
    return labels[role] || role;
  }

  private getRoleLabels(roles: string[]): string[] {
    return roles.map(role => this.getRoleLabel(role));
  }
}