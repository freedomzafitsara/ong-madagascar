// backend/src/modules/auth/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '../../../entities/user.entity';

// ============================================================
// JWT AUTH GUARD - Protection des routes
// ============================================================

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Non autorise. Veuillez vous connecter.');
    }
    return user;
  }
}

// ============================================================
// ROLES GUARD - Verification des roles
// ============================================================

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('Acces refuse. Vous n\'avez pas les droits necessaires.');
    }

    return true;
  }
}

// ============================================================
// ADMIN GUARD - Verification que l'utilisateur est administrateur
// ============================================================

@Injectable()
export class AdminGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Acces refuse. Droits administrateur requis.');
    }

    return true;
  }
}

// ============================================================
// SUPER ADMIN GUARD - Verification que l'utilisateur est super administrateur
// ============================================================

@Injectable()
export class SuperAdminGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Acces refuse. Droits super administrateur requis.');
    }

    return true;
  }
}

// ============================================================
// CANDIDATE GUARD - Verification que l'utilisateur est candidat
// ============================================================

@Injectable()
export class CandidateGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    if (user.role !== UserRole.CANDIDATE && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Seuls les candidats peuvent effectuer cette action');
    }

    return true;
  }
}

// ============================================================
// VISITOR GUARD - Verification que l'utilisateur est visiteur
// ============================================================

@Injectable()
export class VisitorGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    if (user.role !== UserRole.VISITOR) {
      throw new ForbiddenException('Acces reserve aux visiteurs');
    }

    return true;
  }
}

// ============================================================
// ACTIVE USER GUARD - Verification que l'utilisateur est actif
// ============================================================

@Injectable()
export class ActiveUserGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    if (!user.is_active) {
      throw new ForbiddenException('Compte desactive. Veuillez contacter l\'administrateur.');
    }

    return true;
  }
}

// ============================================================
// OWNER GUARD - Verification que l'utilisateur est le proprietaire
// ============================================================

@Injectable()
export class OwnerGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = request.params.id || request.params.userId || request.body.user_id;

    if (!user) {
      throw new UnauthorizedException('Non autorise');
    }

    // L'admin et le super_admin peuvent tout faire
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // L'utilisateur ne peut modifier que ses propres donnees
    if (user.id !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres donnees');
    }

    return true;
  }
}

// ============================================================
// DECORATEURS - Pour utilisation dans les controllers
// ============================================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Admin = () => SetMetadata(ROLES_KEY, [UserRole.ADMIN, UserRole.SUPER_ADMIN]);
export const SuperAdmin = () => SetMetadata(ROLES_KEY, [UserRole.SUPER_ADMIN]);
export const Candidate = () => SetMetadata(ROLES_KEY, [UserRole.CANDIDATE]);