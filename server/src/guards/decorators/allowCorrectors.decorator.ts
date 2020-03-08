import { SetMetadata } from '@nestjs/common';

export const ALLOW_CORRECTORS_METADATA_KEY = 'allow-correctors';

/**
 * Sets the metadata so that route guards can check if a corrector would have access to this endpoint.
 */
export const AllowCorrectors = () => SetMetadata(ALLOW_CORRECTORS_METADATA_KEY, true);
