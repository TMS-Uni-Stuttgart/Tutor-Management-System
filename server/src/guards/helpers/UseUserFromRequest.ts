import { ExecutionContext, ForbiddenException, Logger, CanActivate } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard } from '../authenticated.guard';

export abstract class UseUserFromRequest implements CanActivate {
  abstract canActivate(context: ExecutionContext): boolean | Promise<boolean>;

  /**
   * Returns the user which issues the request if there is one available.
   *
   * The user has to be present __and__ to be logged in.
   *
   * @param context Context to use.
   *
   * @returns The user from the context if available.
   *
   * @throws `ForbiddenException` - If the user is not available or not logged in.
   */
  protected getUserFromRequest(context: ExecutionContext): Express.User {
    const authGuard = new AuthenticatedGuard();
    const isAuthenticated = authGuard.canActivate(context);
    const request = context.switchToHttp().getRequest<Request>();

    if (!isAuthenticated || !request.user || !request.user.roles) {
      Logger.error('Request does not contain a user', undefined, UseUserFromRequest.name);
      throw new ForbiddenException('Forbidden ressource');
    }

    return request.user;
  }
}
