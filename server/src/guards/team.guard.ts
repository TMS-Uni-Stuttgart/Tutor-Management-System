import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TutorialDocument } from '../database/models/tutorial.model';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { HasRoleGuard } from './has-role.guard';
import { UseMetadata } from './helpers/UseMetadata';

/**
 * Checks if the request is made on a team ID which the logged in user is allowed to access (ie is the tutor of).
 *
 * By default the `id` param is assumend to be the one belonging to the tutorial and the `teamId` param to be the one belonging to the team. If the tutorial ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 */
@Injectable()
export class TeamGuard extends UseMetadata {
  constructor(reflector: Reflector, private readonly tutorialService: TutorialService) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.getRolesFromContext(context);
    const hasRoleGuard = new HasRoleGuard(roles);

    if (hasRoleGuard.canActivate(context)) {
      return true;
    }

    const user = this.getUserFromRequest(context);
    const tutorial = await this.getTutorialFromRequest(context);

    // TODO: Support correctors and substitutes.
    return tutorial.tutor?.id === user._id;
  }

  private async getTutorialFromRequest(context: ExecutionContext): Promise<TutorialDocument> {
    const tutorialId = this.getIdFieldContentFromContext(context);

    return this.tutorialService.findById(tutorialId);
  }
}
