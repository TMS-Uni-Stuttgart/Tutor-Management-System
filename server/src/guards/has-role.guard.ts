import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '../shared/model/Role';
import { AuthenticatedGuard } from './authenticated.guard';
import { UseUserFromRequest } from './helpers/UseUserFromRequest';

/**
 * Guard which check if request is done by a user which fullfil the following conditions:
 * - Is authenticated & logged in.
 * - Has one of the `roles` specified on instantiation of this guard.
 *
 * If any of the above do _not_ apply access is refused and if all apply access is granted.
 */
@Injectable()
export class HasRoleGuard extends UseUserFromRequest {
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
    const authGuard = new AuthenticatedGuard();
    const isAuthenticated = authGuard.canActivate(context);

    if (!isAuthenticated) {
      throw new UnauthorizedException();
    }

    const { roles } = this.getUserFromRequest(context);

    for (const role of this.allowedRoles) {
      if (roles.includes(role)) {
        return true;
      }
    }

    return false;
  }
}
