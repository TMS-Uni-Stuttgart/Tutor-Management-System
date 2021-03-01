import { PathParam } from './types';

/**
 * Create a new part of the route representing a parameter.
 *
 * @param param Name of param to add.
 * @param optional Is param optional? Only the last parameter of a path can be optional.
 *
 * @returns Parameter object for the Route.
 */
export function param<T extends string, B extends boolean>(param: T, optional: B): PathParam<T, B>;
export function param<T extends string, B extends boolean>(param: T): PathParam<T, false>;
export function param<T extends string, B extends boolean>(
  param: T,
  optional?: B
): PathParam<T, B> {
  if (optional === undefined) {
    return { param, optional: false } as PathParam<T, B>;
  }

  return { param, optional };
}
