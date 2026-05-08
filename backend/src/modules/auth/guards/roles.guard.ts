import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Non authentifié');
    }

    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.SUPER_ADMIN]: 100,
      [UserRole.ADMIN]: 80,
      [UserRole.STAFF]: 60,
      [UserRole.MEMBER]: 40,
      [UserRole.VOLUNTEER]: 30,
      [UserRole.PARTNER]: 20,
      [UserRole.VISITOR]: 10,
    };

    const userLevel = roleHierarchy[user.role as UserRole] || 0;
    const requiredLevel = Math.min(...requiredRoles.map(r => roleHierarchy[r]));

    if (userLevel < requiredLevel) {
      throw new ForbiddenException('Droits insuffisants');
    }

    return true;
  }
}