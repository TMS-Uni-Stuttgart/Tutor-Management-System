import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { HasRoleGuard } from './has-role.guard';
import { TutorialGuard } from './tutorial.guard';

/**
 * Checks if the request is made on a team ID which the logged in user is allowed to access (ie is the tutor of).
 *
 * By default the `id` param is assumend to be the one belonging to the tutorial and the `teamId` param to be the one belonging to the team. If the tutorial ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 *
 * By default, only the tutor of the tutorial of the team gains access to the endpoint. However, one can configure this with the `@AllowSubstitutes()` and `@AllowCorrectors()` decorators.
 */
@Injectable()
export class TeamGuard extends TutorialGuard {
    constructor(tutorialService: TutorialService, reflector: Reflector) {
        super(tutorialService, reflector);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const hasRoleGuard = new HasRoleGuard(this.reflector);

        if (hasRoleGuard.canActivate(context)) {
            return true;
        }

        const user = this.getUserFromRequest(context);
        const tutorial = await this.getTutorialFromRequest(context);

        return this.hasUserAccessToTutorial({ user, tutorial, context });
    }
}
