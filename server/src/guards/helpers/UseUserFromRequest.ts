import { ExecutionContext, ForbiddenException, Logger, CanActivate } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard } from '../authenticated.guard';

export abstract class UseUserFromRequest implements CanActivate {
  abstract canActivate(context: ExecutionContext): boolean | Promise<boolean>;

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
