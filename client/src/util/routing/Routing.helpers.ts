import { RouteType, RoutingPath } from './Routing.routes';

interface PointsOverviewParams {
  tutorialId: string;
  sheetId?: string;
}

interface EnterPointsFormParams {
  tutorialId: string;
  sheetId: string;
  teamId: string;
}

export function getTutorialRelatedPath(route: RouteType, tutorialId: string): string {
  if (!route.isTutorialRelated) {
    return route.path;
  }

  return getPathOfRouteWithTutorial(route.path, tutorialId);
}

export function getPathOfRouteWithTutorial(routingPath: RoutingPath, tutorialId: string): string {
  return `/tutorial/${tutorialId}/${routingPath}`.replace(/\/\/+/, '/');
}

export function getPointOverviewPath({ tutorialId, sheetId }: PointsOverviewParams): string {
  const path = getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_OVERVIEW, tutorialId);

  if (!!sheetId) {
    return path.replace(':sheetId?', sheetId);
  } else {
    return path.replace('/:sheetId?', '');
  }
}

export function getEnterPointsFormPath({
  tutorialId,
  sheetId,
  teamId,
}: EnterPointsFormParams): string {
  const path: string = getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_FORM, tutorialId);

  return path
    .replace(':sheetId', sheetId)
    .replace(':teamId', teamId)
    .replace(/\/\/+/, '/');
}
