import { Role } from 'shared/model/Role';
import { ROUTES } from '../../routes/Routing.routes';
import { OnlyOptionalParamsRoute, TutorialRelatedDrawerRoute } from '../../routes/Routing.types';

interface FilteredRoutes {
  withoutTutorialRoutes: OnlyOptionalParamsRoute[];
  tutorialRoutes: TutorialRelatedDrawerRoute[];
  managementRoutes: OnlyOptionalParamsRoute[];
}

function isRoleMatching(userRoles: Role[], routeRoles: Role[] | 'all'): boolean {
  if (routeRoles === 'all') {
    return true;
  }

  return routeRoles.findIndex((role) => userRoles.includes(role)) !== -1;
}

export function filterRoutes(userRoles: Role[]): FilteredRoutes {
  const userRoutesWithoutTutorialRoutes: OnlyOptionalParamsRoute[] = [];
  const tutorialRoutes: TutorialRelatedDrawerRoute[] = [];
  const managementRoutes: OnlyOptionalParamsRoute[] = [];

  for (const route of Object.values(ROUTES)) {
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
      if (route.hasOnlyOptionalParams()) {
        managementRoutes.push(route);
      }
    } else {
      if (!route.isTutorialRelated && route.hasOnlyOptionalParams()) {
        userRoutesWithoutTutorialRoutes.push(route);
      }

      if (route.isTutorialRelated && route.isTutorialRelatedDrawerRoute()) {
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
