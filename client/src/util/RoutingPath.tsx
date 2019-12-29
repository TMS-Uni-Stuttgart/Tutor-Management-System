import { SvgIconProps } from '@material-ui/core/SvgIcon';
import {
  Book as BookIcon,
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@material-ui/icons';
import {
  AccountBadge as AccountBadgeIcon,
  AccountMultipleCheck as AccountMultipleCheckIcon,
  File as FileIcon,
  Login as LoginIcon,
  ScriptText as ScriptTextIcon,
  Teach as TeachIcon,
  FileDocumentBox as FileDocumentBoxIcon,
  FileDocumentBoxMultiple as FileDocumentBoxMultipleIcon,
} from 'mdi-material-ui';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import AttendanceAdminView from '../view/attendance/AttendanceAdminView';
import AttendanceView from '../view/attendance/AttendanceView';
import Dashboard from '../view/dashboard/Dashboard';
import PointManagement from '../view/pointsmanagement/PointManagement';
import EnterPointsView from '../view/enter-points-view/EnterPointsView';
import Login from '../view/Login';
import ScheinCriteriaManagement from '../view/scheincriteriamanagement/ScheinCriteriaManagement';
import SheetManagement from '../view/sheetmanagement/SheetManagement';
import TutorStudentmanagement from '../view/studentmanagement/TutorStudentmanagement';
import Teamoverview from '../view/teamoverview/Teamoverview';
import TutorialManagement from '../view/tutorialmanagement/TutorialManagement';
import UserManagement from '../view/usermanagement/UserManagement';
import AllStudentsAdminView from '../view/studentmanagement/AllStudentsAdminView';
import ScheinExamPointEntry from '../view/pointsmanagement/ScheinExamPointEntry';
import ScheinExamManagement from '../view/pointsmanagement/ScheinExamManagement';
import TutorialSubstituteManagement from '../view/tutorialmanagement/TutorialSubstituteManagement';
import { Role } from 'shared/dist/model/Role';

export enum RoutingPath {
  ROOT = '/',
  LOGIN = '/login',
  STUDENTOVERVIEW = '/studentoverview',
  TEAMOVERVIEW = '/teamoverview',
  ATTENDANCE = '/attendance',
  ENTER_POINTS = '/enterpoints',
  ENTER_POINTS_OLD = '/enterpoints/old',
  SCHEIN_EXAMS = '/scheinexams',
  DASHBOARD = '/dashboard',
  MANAGE_USERS = '/admin/usermanagement',
  MANAGE_TUTORIALS = '/admin/tutorialmanagement',
  MANAGE_TUTORIALS_SUBSTITUTES = '/admin/tutorialmanagement/:tutorialid/substitute',
  MANAGE_SCHEIN_CRITERIAS = '/admin/scheincriteriamanagement',
  MANAGE_ATTENDANCES = '/admin/attendances',
  MANAGE_SHEETS = '/admin/sheets',
  MANAGE_ALL_STUDENTS = '/admin/students',
  MANAGE_SCHEIN_EXAMS = '/admin/scheinexams',
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

export const PATH_REDIRECT_AFTER_LOGIN: RoutingPath = RoutingPath.DASHBOARD;

export const ROUTES: readonly RouteType[] = [
  {
    path: RoutingPath.LOGIN,
    title: 'Tutor Management System',
    component: Login,
    roles: 'all',
    isInDrawer: false,
    isPrivate: false,
    isExact: true,
    icon: LoginIcon,
  },
  {
    path: RoutingPath.DASHBOARD,
    title: 'Dashboard',
    component: Dashboard,
    icon: DashboardIcon,
    roles: 'all',
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.ATTENDANCE,
    title: 'Anwesenheiten',
    component: AttendanceView,
    icon: AccountMultipleCheckIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  },
  {
    // FIXME: REMOVE ME? OR LEAVE ME IN AS ESCAPE HATCH?
    path: RoutingPath.ENTER_POINTS_OLD,
    title: 'Punkte verwalten (alt)',
    component: PointManagement,
    icon: BookIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: false,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.ENTER_POINTS,
    title: 'Punkte verwalten',
    component: EnterPointsView,
    icon: BookIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.SCHEIN_EXAMS,
    title: 'Scheinklausuren',
    component: ScheinExamPointEntry,
    icon: FileDocumentBoxIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.STUDENTOVERVIEW,
    title: 'Studierendenübersicht',
    component: TutorStudentmanagement,
    icon: PersonIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.TEAMOVERVIEW,
    title: 'Teamübersicht',
    component: Teamoverview,
    icon: GroupIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.MANAGE_USERS,
    title: 'Nutzerverwaltung',
    component: UserManagement,
    icon: AccountBadgeIcon,
    roles: [Role.ADMIN],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_TUTORIALS_SUBSTITUTES,
    title: 'Tutorienvertretungen',
    component: TutorialSubstituteManagement,
    icon: TeachIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: false,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_TUTORIALS,
    title: 'Tutorienverwaltung',
    component: TutorialManagement,
    icon: TeachIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
    isExact: true,
  },
  {
    path: RoutingPath.MANAGE_ALL_STUDENTS,
    title: 'Studierendenübersicht',
    component: AllStudentsAdminView,
    icon: PersonIcon,
    roles: [Role.ADMIN],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_SCHEIN_CRITERIAS,
    title: 'Scheinkriterien',
    component: ScheinCriteriaManagement,
    icon: ScriptTextIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_SHEETS,
    title: 'Übungsblätter',
    component: SheetManagement,
    icon: FileIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_ATTENDANCES,
    title: 'Anwesenheiten',
    component: AttendanceAdminView,
    icon: AccountMultipleCheckIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_SCHEIN_EXAMS,
    title: 'Scheinklausuren',
    component: ScheinExamManagement,
    icon: FileDocumentBoxMultipleIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
];

export function getTutorialRelatedPath(route: RouteType, tutorialId: string): string {
  if (!route.isTutorialRelated) {
    return route.path;
  }

  return `/tutorial/${tutorialId}/${route.path}`.replace(/\/\/+/, '/');
}
