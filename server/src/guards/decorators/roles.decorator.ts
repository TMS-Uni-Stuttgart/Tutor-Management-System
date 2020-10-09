import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from '../../shared/model/Role';

export const ROLE_METADATA_KEY = 'roles';

/**
 * Configures the roles for guards.
 *
 * Can be used to determine which roles have access to an endpoint for example.
 *
 * @param roles Roles which can be read by the guard.
 */
export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLE_METADATA_KEY, roles);
