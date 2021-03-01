/**
 * Returns the adjusted route containing a possible prefix.
 *
 * @param route Route to adjust (if needed)
 * @returns The given route but with the route prefix if there is one defined.
 */
export function getRouteWithPrefix(route: string): string {
  if (typeof ROUTE_PREFIX !== 'undefined' && !!ROUTE_PREFIX) {
    return `/${ROUTE_PREFIX}/${route}`.replace(/\/\//g, '/');
  } else {
    return route;
  }
}
