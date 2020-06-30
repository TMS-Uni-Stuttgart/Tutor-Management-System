import { RouteType, RoutingPath } from './Routing.routes';

interface PointsOverviewParams {
  tutorialId: string;
  sheetId?: string;
}

interface ScheinexamPointsOverviewParams {
  tutorialId: string;
  examId?: string;
}

interface EnterPointsForTeamParams {
  tutorialId: string;
  sheetId: string;
  teamId: string;
}

interface EnterPointsForStudentParams {
  tutorialId: string;
  sheetId: string;
  teamId: string;
  studentId: string;
}

interface EnterPointsForScheinexamParams {
  tutorialId: string;
  examId: string;
  studentId: string;
}

interface StudentInfoParams {
  studentId: string;
  tutorialId?: string;
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

export function getPresentationPointsPath({ tutorialId, sheetId }: PointsOverviewParams): string {
  const path = getPathOfRouteWithTutorial(RoutingPath.PRESENTATION_POINTS, tutorialId);

  if (!!sheetId) {
    return path.replace(':sheetId?', sheetId);
  } else {
    return path.replace('/:sheetId?', '');
  }
}

export function getScheinexamPointsOverviewPath({
  tutorialId,
  examId,
}: ScheinexamPointsOverviewParams): string {
  const path = getPathOfRouteWithTutorial(RoutingPath.SCHEIN_EXAMS_OVERVIEW, tutorialId);

  return path.replace(':examId?', examId ?? '').replace(/\/\/+/, '/');
}

export function getEnterPointsForTeamPath({
  tutorialId,
  sheetId,
  teamId,
}: EnterPointsForTeamParams): string {
  const path: string = getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_TEAM, tutorialId);

  return path.replace(':sheetId', sheetId).replace(':teamId', teamId).replace(/\/\/+/, '/');
}

export function getEnterPointsForStudentPath({
  tutorialId,
  sheetId,
  teamId,
  studentId,
}: EnterPointsForStudentParams): string {
  const path: string = getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_STUDENT, tutorialId);

  return path
    .replace(':sheetId', sheetId)
    .replace(':teamId', teamId)
    .replace(':studentId', studentId)
    .replace(/\/\/+/, '/');
}

export function getEnterPointsForScheinexamPath({
  tutorialId,
  examId,
  studentId,
}: EnterPointsForScheinexamParams): string {
  const path = getPathOfRouteWithTutorial(RoutingPath.SCHEIN_EXAMS_STUDENT, tutorialId);

  return path.replace(':examId', examId).replace(':studentId', studentId).replace(/\/\/+/, '/');
}

export function getStudentOverviewPath(tutorialId?: string): string {
  if (!!tutorialId) {
    return getPathOfRouteWithTutorial(RoutingPath.STUDENTOVERVIEW, tutorialId);
  } else {
    return RoutingPath.MANAGE_ALL_STUDENTS;
  }
}

export function getStudentInfoPath({ studentId, tutorialId }: StudentInfoParams): string {
  const path = RoutingPath.STUDENT_INFO;

  return path
    .replace(':studentId', studentId)
    .replace(':tutorialId?', tutorialId ?? '')
    .replace(/\/\/+/, '/');
}

export function getScheincriteriaInfoPath(criteriaId: string): string {
  return RoutingPath.SCHEIN_CRITERIAS_INFO.replace(':id', criteriaId).replace(/\/\/+/, '/');
}

export function getManageTutorialInternalsPath(tutorialId: string): string {
  const path = RoutingPath.MANAGE_TUTORIAL_INTERNALS;
  return path.replace(':tutorialId', tutorialId).replace(/\/\/+/g, '/');
}
