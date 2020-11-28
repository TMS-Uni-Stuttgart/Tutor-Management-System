import { logger } from './Logger';

/**
 * Returns a function that throws an Error indicating that the corresponding context is not initialized.
 *
 * @param contextName Name of the context.
 * @returns Function that throws an `Error` (see above).
 */
export function throwContextNotInitialized(contextName: string) {
  return (): never => {
    logger.error(`Context '${contextName}' not initialised.`, { context: contextName });
    throw new Error(`Context '${contextName}' not initialised.`);
  };
}
