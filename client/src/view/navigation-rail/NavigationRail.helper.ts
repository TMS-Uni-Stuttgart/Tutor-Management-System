import { Role } from '../../../../server/src/shared/model/Role';
import { ROUTES, RouteType } from '../../routes/Routing.routes';

function isRoleMatching(userRoles: Role[], routeRoles: Role[] | 'all'): boolean {
  if (routeRoles === 'all') {
    return true;
  }

  return routeRoles.findIndex(role => userRoles.includes(role)) !== -1;
}

export function filterRoutes(userRoles: Role[]) {
  const userRoutesWithoutTutorialRoutes: RouteType[] = [];
  const tutorialRoutes: RouteType[] = [];
  const managementRoutes: RouteType[] = [];

  for (const route of ROUTES) {
    if (!route.isInDrawer) {
      continue;
    }

    if (!isRoleMatching(userRoles, route.roles)) {
      continue;
    }

    if (
      Array.isArray(route.roles) &&
      (route.roles.indexOf(Role.ADMIN) !== -1 || route.roles.indexOf(Role.EMPLOYEE) !== -1)
    ) {
      managementRoutes.push(route);
    } else {
      if (!route.isTutorialRelated) {
        userRoutesWithoutTutorialRoutes.push(route);
      }

      if (route.isTutorialRelated) {
        tutorialRoutes.push(route);
      }
    }
  }

  return {
    withoutTutorialRoutes: userRoutesWithoutTutorialRoutes,
    tutorialRoutes,
    managementRoutes,
  };
}
