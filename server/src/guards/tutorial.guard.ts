import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Tutorial } from '../database/entities/tutorial.entity';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { HasRoleGuard } from './has-role.guard';
import { UseMetadata } from './helpers/UseMetadata';

interface HasAccessParams {
    tutorial: Tutorial;
    user: Express.User;
    context: ExecutionContext;
}

/**
 * Checks if the request is made on a tutorial ID which the logged in user is allowed to access.
 *
 * By default the `id` param is assumed to be the one belonging to the tutorial. If the tutorial ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediately can be configured with the `@Roles()` decorator.
 *
 * By default, only the tutor of the tutorial gains access to the endpoint. However, one can configure this with the `@AllowSubstitutes()` and `@AllowCorrectors()` decorators.
 */
@Injectable()
export class TutorialGuard extends UseMetadata {
    constructor(
        protected readonly tutorialService: TutorialService,
        reflector: Reflector
    ) {
        super(reflector);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roleGuard = new HasRoleGuard(this.reflector);

        if (roleGuard.canActivate(context)) {
            return true;
        }

        const user = this.getUserFromRequest(context);
        const tutorial = await this.getTutorialFromRequest(context);

        return this.hasUserAccessToTutorial({ user, tutorial, context });
    }

    /**
     * Returns if the user is allowed to access the given endpoint or not.
     *
     * This takes into account the metadata set by the `@AllowSubstitutes` and `@AllowCorrectors` decorators.
     *
     * @param params Must contain the user and tutorial to check and the current execution context.
     *
     * @returns Is the given user allowed to access the annotated endpoint?
     */
    protected hasUserAccessToTutorial({ tutorial, user, context }: HasAccessParams): boolean {
        const userId = user.id;
        const allowSubstitutes = this.isAllowedForSubstitutes(context);
        const allowCorrectors = this.isAllowedForCorrectors(context);

        if (tutorial.tutor?.id === userId) {
            return true;
        }

        if (allowSubstitutes) {
            for (const substitute of tutorial.substitutes) {
                if (userId === substitute.substituteTutor.id) {
                    return true;
                }
            }
        }

        if (allowCorrectors) {
            for (const corrector of tutorial.correctors) {
                if (userId === corrector.id) {
                    return true;
                }
            }
        }

        return false;
    }

    protected async getTutorialFromRequest(context: ExecutionContext): Promise<Tutorial> {
        const tutorialId = this.getIdFieldContentFromContext(context);

        return this.tutorialService.findById(tutorialId);
    }
}
