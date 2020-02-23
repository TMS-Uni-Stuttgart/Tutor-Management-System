import { SetMetadata } from '@nestjs/common';
import { Role } from '../shared/model/Role';

export const ROLE_METADATA_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLE_METADATA_KEY, roles);
