import { ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ID_FIELD_METADATA_KEY } from '../decorators/idField.decorator';
import { ROLE_METADATA_KEY } from '../decorators/roles.decorator';
import { Role } from '../../shared/model/Role';
import { UseUserFromRequest } from './UseUserFromRequest';
import { ALLOW_SUBSTITUTES_METADATA_KEY } from '../decorators/allowSubstitutes.decorator';
import { ALLOW_CORRECTORS_METADATA_KEY } from '../decorators/allowCorrectors.decorator';

export abstract class UseMetadata extends UseUserFromRequest {
    constructor(protected readonly reflector: Reflector) {
        super();
    }

    /**
     * Gets the roles from the context if available.
     *
     * Defaults to only the ADMIN role if no roles could be found in the context in the `ROLE_METADATA_KEY` metadata field..
     *
     * @param context Context to get the roles from.
     *
     * @returns Roles given from the context or only the ADMIN role if no roles are given from the context.
     */
    protected getAllowedRolesFromContext(context: ExecutionContext): Role[] {
        const roles: Role[] | undefined = this.reflector.get<Role[]>(
            ROLE_METADATA_KEY,
            context.getHandler()
        );

        return roles ?? [Role.ADMIN];
    }

    /**
     * Gets the contents of the ID field of the params in the current context.
     *
     * Defaults to the value in the `id` field if no field name could be found in the `ID_FIELD_METADATA_KEY` of the metadata.
     *
     * @param context Context which executes the guard.
     *
     * @returns Content of the ID field of the params.
     *
     * @throws `ForbiddenException` - If there is no corresponding field in the request's params
     */
    protected getIdFieldContentFromContext(context: ExecutionContext): string {
        const idField = this.getIdField(context);
        const request = context.switchToHttp().getRequest<Request>();
        if (!request.params[idField]) {
            Logger.error(
                `Request params must contain a '${idField}' field.`,
                undefined,
                UseMetadata.name
            );
            throw new ForbiddenException('Forbidden ressource.');
        }

        return request.params[idField];
    }

    protected isAllowedForSubstitutes(context: ExecutionContext): boolean {
        const isAllowed = this.reflector.get<boolean>(
            ALLOW_SUBSTITUTES_METADATA_KEY,
            context.getHandler()
        );

        return Boolean(isAllowed);
    }

    protected isAllowedForCorrectors(context: ExecutionContext): boolean {
        const isAllowed = this.reflector.get<boolean>(
            ALLOW_CORRECTORS_METADATA_KEY,
            context.getHandler()
        );

        return Boolean(isAllowed);
    }

    private getIdField(context: ExecutionContext): string {
        const idField = this.reflector.get<string>(ID_FIELD_METADATA_KEY, context.getHandler());

        return idField ?? 'id';
    }
}
