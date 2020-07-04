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
export function hasOwnProperty<X extends unknown, Y extends string>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  if (typeof obj !== 'object' || !(obj instanceof Object)) {
    return false;
  }

  return obj.hasOwnProperty(prop);
}
