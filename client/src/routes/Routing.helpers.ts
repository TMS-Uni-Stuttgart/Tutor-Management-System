import { RouteType, RoutingPath } from './Routing.routes';

// interface PointsOverviewParams {
//   tutorialId: string;
//   route?: string;
//   sheetId?: string;
// }

// interface ScheinexamPointsOverviewParams {
//   tutorialId: string;
//   examId?: string;
//   route?: string;
// }

// interface EnterPointsForTeamParams {
//   tutorialId: string;
//   sheetId: string;
//   teamId: string;
// }

// interface EnterPointsForStudentParams {
//   tutorialId: string;
//   sheetId: string;
//   teamId: string;
//   studentId: string;
// }

// interface EnterPointsForScheinexamParams {
//   tutorialId: string;
//   examId: string;
//   studentId: string;
//   route: string;
// }

// interface StudentInfoParams {
//   studentId: string;
//   tutorialId?: string;
// }

// type Replacements<T extends keyof any> = {
//   [placeholder in T]: string;
// };

// type TutorialStudentReplacements = Replacements<'tutorialId' | 'studentId'>;
// type TutorialSheetReplacements = Replacements<'tutorialId' | 'sheetId'>;
// type TutorialExamReplacements = Replacements<'tutorialId' | 'examId'>;
// type ScheinexamPointsReplacements = Replacements<'tutorialId' | 'examId' | 'studentId'>;
// type StudentPointsReplacements = Replacements<'tutorialId' | 'sheetId' | 'studentId' | 'teamId'>;
// type TeamPointsReplacements = Replacements<'tutorialId' | 'sheetId' | 'teamId'>;

// export class RoutingHelpers {
//   constructor(private readonly basePath?: string) {}

//   getTutorialRelatedPath(route: RouteType, tutorialId: string): string {
//     if (!route.isTutorialRelated) {
//       return route.path;
//     }

//     return this.replacePlaceholders(route.path, { tutorialId });
//   }

//   getPointOverviewPath(replacements: TutorialSheetReplacements): string {
//     const path = this.basePath ?? RoutingPath.ENTER_POINTS_OVERVIEW;

//     return this.replacePlaceholders(path, replacements);
//   }

//   getEnterPointsForTeamPath(replacements: TeamPointsReplacements): string {
//     return this.replacePlaceholders(RoutingPath.ENTER_POINTS_TEAM, replacements);
//   }

//   getEnterPointsForStudentPath(replacements: StudentPointsReplacements): string {
//     return this.replacePlaceholders(RoutingPath.ENTER_POINTS_STUDENT, replacements);
//   }

//   getPresentationPointsPath(replacements: TutorialSheetReplacements): string {
//     const path = this.basePath ?? RoutingPath.PRESENTATION_POINTS;
//     return this.replacePlaceholders(path, replacements);
//   }

//   getScheinexamPointsOverviewPath(replacements: TutorialExamReplacements): string {
//     const path = this.basePath ?? RoutingPath.SCHEIN_EXAMS_OVERVIEW;
//     return this.replacePlaceholders(path, replacements);
//   }

//   getEnterPointsForScheinexamPath(replacements: ScheinexamPointsReplacements): string {
//     const path = this.basePath ?? RoutingPath.SCHEIN_EXAMS_STUDENT;
//     return this.replacePlaceholders(path, replacements);
//   }

//   getStudentOverviewPath(tutorialId?: string): string {
//     if (!!tutorialId) {
//       return this.replacePlaceholders(RoutingPath.STUDENTOVERVIEW, { tutorialId });
//     } else {
//       return RoutingPath.MANAGE_ALL_STUDENTS;
//     }
//   }

//   getStudentInfoPath(replacements: TutorialStudentReplacements): string {
//     return this.replacePlaceholders(RoutingPath.STUDENT_INFO, replacements);
//   }

//   getManageTutorialInternalsPath(tutorialId: string): string {
//     return this.replacePlaceholders(RoutingPath.MANAGE_TUTORIAL_INTERNALS, { tutorialId });
//   }

//   /**
//    * @param url URL to replace placeholders in.
//    * @param replacements Replacements with the placeholder as keys. Keys **MUST NOT** contain ':'.
//    *
//    * @returns URL with placeholders filled in.
//    * @throws `Error` - If the URL does not contain one of the given placeholders.
//    */
//   private replacePlaceholders(url: string, replacements: Replacements<any>): string {
//     let adjustedURL = url;

//     for (const [placeholder, replacement] of Object.entries(replacements)) {
//       if (!url.includes(`:${placeholder}`)) {
//         throw new Error(`URL '${url}' does not contain the placeholder '${placeholder}'`);
//       }

//       adjustedURL = adjustedURL.replace(`:${placeholder}`, replacement);
//     }

//     return adjustedURL.replace(/\/\/+/g, '/');
//   }
// }

// export function getTutorialRelatedPath(route: RouteType, tutorialId: string): string {
//   if (!route.isTutorialRelated) {
//     return route.path;
//   }

//   return getPathOfRouteWithTutorial(route.path, tutorialId);
// }

// function getPathOfRouteWithTutorial(routingPath: RoutingPath, tutorialId: string): string {
//   return `/tutorial/${tutorialId}/${routingPath}`.replace(/\/\/+/, '/');
// }

// export function getPointOverviewPath({ tutorialId, sheetId, route }: PointsOverviewParams): string {
//   const path =
//     route?.replace(':tutorialId', tutorialId) ??
//     getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_OVERVIEW, tutorialId);

//   if (!!sheetId) {
//     return path.replace(':sheetId?', sheetId);
//   } else {
//     return path.replace('/:sheetId?', '');
//   }
// }

// export function getPresentationPointsPath({
//   tutorialId,
//   sheetId,
//   route,
// }: PointsOverviewParams): string {
//   const path =
//     route?.replace(':tutorialId', tutorialId) ??
//     getPathOfRouteWithTutorial(RoutingPath.PRESENTATION_POINTS, tutorialId);

//   if (!!sheetId) {
//     return path.replace(':sheetId?', sheetId);
//   } else {
//     return path.replace('/:sheetId?', '');
//   }
// }

// export function getScheinexamPointsOverviewPath({
//   tutorialId,
//   examId,
//   route,
// }: ScheinexamPointsOverviewParams): string {
//   const path =
//     route?.replace(':tutorialId', tutorialId) ??
//     getPathOfRouteWithTutorial(RoutingPath.SCHEIN_EXAMS_OVERVIEW, tutorialId);

//   return path.replace(':examId?', examId ?? '').replace(/\/\/+/, '/');
// }

// export function getEnterPointsForTeamPath({
//   tutorialId,
//   sheetId,
//   teamId,
// }: EnterPointsForTeamParams): string {
//   const path: string = getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_TEAM, tutorialId);

//   return path.replace(':sheetId', sheetId).replace(':teamId', teamId).replace(/\/\/+/, '/');
// }

// export function getEnterPointsForStudentPath({
//   tutorialId,
//   sheetId,
//   teamId,
//   studentId,
// }: EnterPointsForStudentParams): string {
//   const path: string = getPathOfRouteWithTutorial(RoutingPath.ENTER_POINTS_STUDENT, tutorialId);

//   return path
//     .replace(':sheetId', sheetId)
//     .replace(':teamId', teamId)
//     .replace(':studentId', studentId)
//     .replace(/\/\/+/, '/');
// }

// export function getEnterPointsForScheinexamPath({
//   tutorialId,
//   examId,
//   studentId,
//   route,
// }: EnterPointsForScheinexamParams): string {
//   const path = route.replace(':tutorialId', tutorialId);

//   return path.replace(':examId', examId).replace(':studentId', studentId).replace(/\/\/+/, '/');
// }

// export function getStudentOverviewPath(tutorialId?: string): string {
//   if (!!tutorialId) {
//     return getPathOfRouteWithTutorial(RoutingPath.STUDENTOVERVIEW, tutorialId);
//   } else {
//     return RoutingPath.MANAGE_ALL_STUDENTS;
//   }
// }

// export function getStudentInfoPath({ studentId, tutorialId }: StudentInfoParams): string {
//   const path = RoutingPath.STUDENT_INFO;

//   return path
//     .replace(':studentId', studentId)
//     .replace(':tutorialId?', tutorialId ?? '')
//     .replace(/\/\/+/, '/');
// }

// export function getScheincriteriaInfoPath(criteriaId: string): string {
//   return RoutingPath.SCHEIN_CRITERIAS_INFO.replace(':id', criteriaId).replace(/\/\/+/, '/');
// }

// export function getManageTutorialInternalsPath(tutorialId: string): string {
//   const path = RoutingPath.MANAGE_TUTORIAL_INTERNALS;
//   return path.replace(':tutorialId', tutorialId).replace(/\/\/+/g, '/');
// }
