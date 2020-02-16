import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../shared/model/Role';
import { AuthenticatedGuard } from './authenticated.guard';

/**
 * Guard which check if request is done by a user which fullfil the following conditions:
 * - Is authenticated & logged in.
 * - Has one of the `roles` specified on instantiation of this guard.
 *
 * If any of the above do _not_ apply access is refused and if all apply access is granted.
 */
@Injectable()
export class HasRoleGuard extends AuthenticatedGuard {
  private readonly allowedRoles: readonly Role[];

  constructor(roles: Role | Role[]) {
    super();

    if (!Array.isArray(roles)) {
      this.allowedRoles = [roles];
    } else {
      this.allowedRoles = [...roles];
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const isAuthenticated: boolean = super.canActivate(context);
    const request = context.switchToHttp().getRequest<Request>();

    if (!isAuthenticated || !request.user || !request.user.roles) {
      throw new ForbiddenException('Forbidden ressource');
    }

    const { roles } = request.user;

    for (const role of this.allowedRoles) {
      if (roles.includes(role)) {
        return true;
      }
    }

    return false;
  }
}
