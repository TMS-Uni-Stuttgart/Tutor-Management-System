import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HasRoleGuard } from './has-role.guard';

/**
 * Checks if the request is made on a user ID which belongs to the user making the request.
 *
 * By default the `id` param is assumed to be the one beloging to the user. If the user ID is in a different param field one can provide the _name_ of the field through the `@IDField()` decorator.
 *
 * Any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 */
@Injectable()
export class SameUserGuard extends HasRoleGuard {
    constructor(reflector: Reflector) {
        super(reflector);
    }

    canActivate(context: ExecutionContext): boolean {
        if (super.canActivate(context)) {
            return true;
        }

        const user = this.getUserFromRequest(context);
        const paramId = this.getIdFieldContentFromContext(context);

        return user.id.toString() === paramId;
    }
}
