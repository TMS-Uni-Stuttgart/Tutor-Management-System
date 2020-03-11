import { Role } from '../../../../server/src/shared/model/Role';
import { ROUTES, RouteType } from '../../routes/Routing.routes';
import { LoggedInUser } from '../../model/LoggedInUser';
import { RailSubItemProps } from './components/RailSubItem';
import { getTutorialRelatedPath } from '../../routes/Routing.helpers';
import { Tutorial } from '../../model/Tutorial';
import {
  Teach as TutorialIcon,
  AccountConvert as SubstituteTutorialIcon,
  CheckboxMarkedCircleOutline as TutorialToCorrectIcon,
} from 'mdi-material-ui';

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

export function getSubItems(route: RouteType, userData: LoggedInUser): RailSubItemProps[] {
  const subItems: RailSubItemProps[] = [];

  userData.tutorials.forEach(tutorial => {
    subItems.push({
      subPath: getTutorialRelatedPath(route, tutorial.id),
      icon: TutorialIcon,
      text: Tutorial.getDisplayString(tutorial),
    });
  });

  if (route.roles.includes(Role.CORRECTOR)) {
    userData.tutorialsToCorrect.forEach(tutorial => {
      subItems.push({
        subPath: getTutorialRelatedPath(route, tutorial.id),
        icon: TutorialToCorrectIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  if (route.isAccessibleBySubstitute) {
    userData.substituteTutorials.forEach(tutorial => {
      subItems.push({
        subPath: getTutorialRelatedPath(route, tutorial.id),
        icon: SubstituteTutorialIcon,
        text: Tutorial.getDisplayString(tutorial),
      });
    });
  }

  return subItems;
}
