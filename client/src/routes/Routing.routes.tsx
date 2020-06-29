import { SvgIconProps } from '@material-ui/core/SvgIcon';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Role } from 'shared/model/Role';
import { ADMIN_ROUTES } from './Routes.admin';
import { BASE_ROUTES } from './Routes.base';
import { TUTORIAL_ROUTES } from './Routes.tutorial';

export enum RoutingPath {
  ROOT = '/',
  LOGIN = '/login',
  STUDENTOVERVIEW = '/studentoverview',
  STUDENT_INFO = '/studentinfo/student/:studentId/:tutorialId?',
  TEAMOVERVIEW = '/teamoverview',
  ATTENDANCE = '/attendance',
  ENTER_POINTS_OVERVIEW = '/enterpoints/:sheetId?',
  ENTER_POINTS_TEAM = '/enterpoints/:sheetId/team/:teamId',
  ENTER_POINTS_STUDENT = '/enterpoints/:sheetId/team/:teamId/student/:studentId',
  PRESENTATION_POINTS = '/presentations/:sheetId?',
  SCHEIN_EXAMS_OVERVIEW = '/scheinexams/:examId?',
  SCHEIN_EXAMS_STUDENT = '/scheinexams/:examId/student/:studentId',
  DASHBOARD = '/dashboard',
  MANAGE_USERS = '/admin/usermanagement',
  IMPORT_USERS = '/admin/usermanagement/generate',
  MANAGE_TUTORIALS = '/admin/tutorialmanagement',
  MANAGE_TUTORIAL_INTERNALS = '/admin/tutorialmanagement/manage',
  GENERATE_TUTORIALS = '/admin/tutorialmanagement/generate',
  MANAGE_TUTORIALS_SUBSTITUTES = '/admin/tutorialmanagement/substitutes/:tutorialid/substitute',
  MANAGE_SCHEIN_CRITERIAS = '/admin/scheincriterias',
  SCHEIN_CRITERIAS_INFO = '/admin/scheincriterias/info/:id',
  MANAGE_ATTENDANCES = '/admin/attendances',
  MANAGE_SHEETS = '/admin/sheets',
  MANAGE_ALL_STUDENTS = '/admin/students',
  MANAGE_SCHEIN_EXAMS = '/admin/scheinexams',
  IMPORT_TUTORIALS_AND_USERS = '/admin/import',
}

type RouteComponent = React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;

export interface RouteType {
  path: RoutingPath;
  title: string;
  component: RouteComponent;
  icon: React.ComponentType<SvgIconProps>;
  roles: Role[] | 'all';
  isInDrawer: boolean;
  isPrivate: boolean;
  isTutorialRelated?: boolean;
  isAccessibleBySubstitute?: boolean;
  isExact?: boolean;
}

export const ROOT_REDIRECT_PATH: RoutingPath = RoutingPath.MANAGE_TUTORIAL_INTERNALS; // FIXME:
export const PATH_REDIRECT_AFTER_LOGIN: RoutingPath = RoutingPath.DASHBOARD;

export const ROUTES: readonly RouteType[] = [...BASE_ROUTES, ...TUTORIAL_ROUTES, ...ADMIN_ROUTES];
