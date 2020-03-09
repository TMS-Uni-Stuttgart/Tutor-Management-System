import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedGuard } from './authenticated.guard';
import { UseMetadata } from './helpers/UseMetadata';

/**
 * Guard which check if request is done by a user which fullfil the following conditions:
 * - Is authenticated & logged in.
 * - By default only users with the ADMIN role have access to the endpoint. This can be configured using the `@Roles()` decorator.
 *
 * If any of the above do _not_ apply access is refused and if all apply access is granted.
 */
@Injectable()
export class HasRoleGuard extends UseMetadata {
  constructor(reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext): boolean {
    const authGuard = new AuthenticatedGuard();
    const isAuthenticated = authGuard.canActivate(context);

    if (!isAuthenticated) {
      throw new UnauthorizedException();
    }

    const { roles } = this.getUserFromRequest(context);
    const allowedRoles = this.getAllowedRolesFromContext(context);

    for (const role of allowedRoles) {
      if (roles.includes(role)) {
        return true;
      }
    }

    return false;
  }
}
