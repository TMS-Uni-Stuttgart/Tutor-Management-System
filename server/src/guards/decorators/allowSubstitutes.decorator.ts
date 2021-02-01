import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ALLOW_SUBSTITUTES_METADATA_KEY = 'allow-substitutes';

/**
 * Sets the metadata so that route guards can check if a substitute tutor would have access to this endpoint.
 */
export const AllowSubstitutes = (): CustomDecorator<string> =>
    SetMetadata(ALLOW_SUBSTITUTES_METADATA_KEY, true);
