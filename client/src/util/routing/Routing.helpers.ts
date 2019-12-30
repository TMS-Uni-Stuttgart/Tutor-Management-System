import { RouteType, RoutingPath } from './Routing.routes';

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

export function getEnterPointsFormPath({
  tutorialId,
  sheetId,
  teamId,
}: EnterPointsFormParams): string {
  return `/tutorial/${tutorialId}/enterpoints/${sheetId}/${teamId}`;
}
