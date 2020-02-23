import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../shared/model/Role';
import { HasRoleGuard } from './has-role.guard';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLE_METADATA_KEY } from '../decorators/roles.decorator';
import { ID_FIELD_METADATA_KEY } from '../decorators/idField.decorator';
import { TutorialService } from '../module/tutorial/tutorial.service';

/**
 * Checks if the request is made on a tutorial ID which the logged in user is allowed to access.
 *
 * By default the `id` param is assumend to be the one belonging to the tutorial. If the user ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 */
@Injectable()
export class TutorialGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tutorialService: TutorialService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: Role[] | undefined = this.reflector.get<Role[]>(
      ROLE_METADATA_KEY,
      context.getHandler()
    );
    const roleGuard = new HasRoleGuard(roles ?? [Role.ADMIN]);

    if (roleGuard.canActivate(context)) {
      return true;
    }

    // TODO: Support substitutions & correctors aswell.
    const user = roleGuard.getUserFromRequest(context);
    const tutorial = await this.getTutorialFromRequest(context);

    return tutorial.tutor?.id === user._id;
  }

  private async getTutorialFromRequest(context: ExecutionContext) {
    const idField = this.reflector.get<string>(ID_FIELD_METADATA_KEY, context.getHandler()) ?? 'id';

    const request = context.switchToHttp().getRequest<Request>();
    if (!request.params[idField]) {
      Logger.error(
        `Request params must contain a '${idField}' field.`,
        undefined,
        TutorialGuard.name
      );
      throw new ForbiddenException('Forbidden ressource.');
    }

    return this.tutorialService.findById(request.params[idField]);
  }
}
