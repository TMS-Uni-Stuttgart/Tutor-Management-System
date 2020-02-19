import { ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../shared/model/Role';
import { HasRoleGuard } from './has-role.guard';

/**
 * Checks if the request is made on a user ID which belongs to the user making the request.
 *
 * By default the `id` param is assumed to be the one beloging to the user. If the user ID is in a different param field one can provide the _name_ of the field to the constructor of this class.
 *
 * Any user with the ADMIN role will get access to the endpoint.
 */
@Injectable()
export class SameUserGuard extends HasRoleGuard {
  constructor(private readonly userIdField: string = 'id') {
    super(Role.ADMIN);
  }

  canActivate(context: ExecutionContext): boolean {
    if (super.canActivate(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = this.getUserFromRequest(request);
    const paramId = this.getIdFromRequest(request);

    return user._id.toString() === paramId;
  }

  private getIdFromRequest(request: Request): string {
    if (!request.params[this.userIdField]) {
      Logger.error(
        `Request params must contain a '${this.userIdField}' field.`,
        undefined,
        SameUserGuard.name
      );
      throw new ForbiddenException('Forbidden ressource.');
    }

    return request.params[this.userIdField];
  }

  private getUserFromRequest(request: Request): Express.User {
    if (!request.user) {
      Logger.error('Request does not contain a user', undefined, SameUserGuard.name);
      throw new ForbiddenException(`Forbidden ressource.`);
    }

    return request.user;
  }
}
