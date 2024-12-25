/**
 * Checks if the given object holds the given property.
 *
 * This is simply a type guard wrapper around `Object.hasOwnProperty`.
 *
 * @param obj Object to check
 * @param prop Property to check for.
 *
 * @returns Has the given object the given property?
 */
export function hasOwnProperty<X, Y extends string>(
    obj: X,
    prop: Y
): obj is X & Record<Y, unknown> {
    if (obj === undefined || obj === null) {
        return false;
    }

    if (typeof obj !== 'object') {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(obj, prop);
}
