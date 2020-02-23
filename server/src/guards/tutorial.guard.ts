import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { HasRoleGuard } from './has-role.guard';
import { UseMetadata } from './helpers/UseMetadata';
import { TutorialDocument } from '../database/models/tutorial.model';

/**
 * Checks if the request is made on a tutorial ID which the logged in user is allowed to access.
 *
 * By default the `id` param is assumend to be the one belonging to the tutorial. If the tutorial ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 */
@Injectable()
export class TutorialGuard extends UseMetadata {
  constructor(private readonly tutorialService: TutorialService, reflector: Reflector) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.getRolesFromContext(context);
    const roleGuard = new HasRoleGuard(roles);

    if (roleGuard.canActivate(context)) {
      return true;
    }

    // TODO: Support substitutions & correctors aswell.
    const user = this.getUserFromRequest(context);
    const tutorial = await this.getTutorialFromRequest(context);

    return tutorial.tutor?.id === user._id;
  }

  private async getTutorialFromRequest(context: ExecutionContext): Promise<TutorialDocument> {
    const tutorialId = this.getIdFieldContentFromContext(context);

    return this.tutorialService.findById(tutorialId);
  }
}
