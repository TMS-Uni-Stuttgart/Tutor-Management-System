/**
 * Waits for the given amount of milliseconds before moving forward.
 *
 * @param milliseconds Amount of time to wait (in milliseconds).
 *
 * @returns A promise that will resolve after the given amount of milliseconds (it cannot fail).
 */
export function wait(milliseconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
