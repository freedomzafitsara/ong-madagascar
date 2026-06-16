// backend/src/modules/auth/guards/candidate.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../entities/user.entity';

@Injectable()
export class CandidateGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Non autorise. Veuillez vous connecter.');
    }

    //  Vérifier que l'utilisateur a le rôle candidat ou administrateur
    if (user.role !== UserRole.CANDIDATE && 
        user.role !== UserRole.ADMIN && 
        user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Seuls les candidats peuvent effectuer cette action.');
    }

    return true;
  }
}