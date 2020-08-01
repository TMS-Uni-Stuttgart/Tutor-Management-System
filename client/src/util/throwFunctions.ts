/**
 * Returns a function that throws an Error indicating that the corresponding context is not initialized.
 *
 * @param contextName Name of the context.
 * @returns Function that throws an `Error` (see above).
 */
export function throwContextNotInitialized(contextName: string) {
  return (): never => {
    throw new Error(`Context '${contextName}' not initialised.`);
  };
}
