import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = parseInt(request.params.id);

    // Admin puede ver todo
    if (user.role === 'admin') {
      return true;
    }

    // Usuario solo puede ver sus propios datos
    if (user.id === resourceId) {
      return true;
    }

    throw new ForbiddenException('No tienes permisos para acceder a este recurso');
  }
}
