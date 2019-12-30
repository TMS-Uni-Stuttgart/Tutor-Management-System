import { RouteType } from './Routing.routes';

interface EnterPointsFormParams {
  tutorialId: string;
  sheetId: string;
  teamId: string;
}

export function getTutorialRelatedPath(route: RouteType, tutorialId: string): string {
  if (!route.isTutorialRelated) {
    return route.path;
  }

  return `/tutorial/${tutorialId}/${route.path}`.replace(/\/\/+/, '/');
}

export function getEnterPointsFormPath({
  tutorialId,
  sheetId,
  teamId,
}: EnterPointsFormParams): string {
  return `/tutorial/${tutorialId}/enterpoints/${sheetId}/${teamId}`;
}
