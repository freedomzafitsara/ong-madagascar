import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../../entities/user.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Accès réservé au Super Administrateur');
    }

    return true;
  }
}