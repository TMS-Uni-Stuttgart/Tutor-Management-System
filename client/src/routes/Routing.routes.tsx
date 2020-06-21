import { SvgIconProps } from '@material-ui/core/SvgIcon';
import {
  Account as StudentIcon,
  BadgeAccount as UserIcon,
  AccountMultiple as TeamIcon,
  AccountMultipleCheck as AttendancesIcon,
  Book as EnterPointsIcon,
  Comment as PresentationIcon,
  File as SheetIcon,
  TextBox as ScheinexamPointsIcon,
  TextBoxMultiple as ScheinexamManagementIcon,
  Login as LoginIcon,
  ScriptText as ScheincriteriaIcon,
  Teach as TutorialIcon,
  ViewDashboard as DashboardIcon,
} from 'mdi-material-ui';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Role } from 'shared/model/Role';
import AttendanceAdminView from '../view/attendance/AttendanceAdminView';
import AttendanceView from '../view/attendance/AttendanceView';
import CriteriaInfoView from '../view/criteria-info-view/CriteriaInfoView';
import Dashboard from '../view/dashboard/Dashboard';
import Login from '../view/Login';
import EnterScheinexamPoints from '../view/points-scheinexam/enter-form/EnterScheinexamPoints';
import ScheinexamPointsOverview from '../view/points-scheinexam/overview/ScheinexamPointsOverview';
import EnterStudentPoints from '../view/points-sheet/enter-form/EnterStudentPoints';
import EnterTeamPoints from '../view/points-sheet/enter-form/EnterTeamPoints';
import PointsOverview from '../view/points-sheet/overview/PointsOverview';
import PresentationPoints from '../view/presentation-points/PresentationPoints';
import ScheinCriteriaManagement from '../view/scheincriteriamanagement/ScheinCriteriaManagement';
import ScheinExamManagement from '../view/scheinexam-management/ScheinExamManagement';
import SheetManagement from '../view/sheetmanagement/SheetManagement';
import AllStudentsAdminView from '../view/studentmanagement/AllStudentsAdminView';
import StudentInfo from '../view/studentmanagement/student-info/StudentInfo';
import TutorStudentmanagement from '../view/studentmanagement/TutorStudentmanagement';
import Teamoverview from '../view/teamoverview/Teamoverview';
import TutorialManagement from '../view/tutorialmanagement/TutorialManagement';
import TutorialSubstituteManagement from '../view/tutorialmanagement/TutorialSubstituteManagement';
import UserManagement from '../view/usermanagement/UserManagement';
import ImportData from '../view/import-data/ImportData';
import GenerateTutorials from '../view/generate-tutorials/GenerateTutorials';

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

export const ROOT_REDIRECT_PATH: RoutingPath = RoutingPath.LOGIN;
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
    icon: AttendancesIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  },
  {
    path: RoutingPath.ENTER_POINTS_STUDENT,
    title: 'Punkte eintragen',
    component: EnterStudentPoints,
    icon: EnterPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: false,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.ENTER_POINTS_TEAM,
    title: 'Punkte eintragen',
    component: EnterTeamPoints,
    icon: EnterPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: false,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.ENTER_POINTS_OVERVIEW,
    title: 'Punkte verwalten',
    component: PointsOverview,
    icon: EnterPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.PRESENTATION_POINTS,
    title: 'Präsentationen',
    component: PresentationPoints,
    icon: PresentationIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  },
  {
    path: RoutingPath.SCHEIN_EXAMS_STUDENT,
    title: 'Scheinklausuren',
    component: EnterScheinexamPoints,
    icon: ScheinexamPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: false,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.SCHEIN_EXAMS_OVERVIEW,
    title: 'Scheinklausuren',
    component: ScheinexamPointsOverview,
    icon: ScheinexamPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.STUDENT_INFO,
    title: 'Studierendeninformation',
    component: StudentInfo,
    icon: StudentIcon,
    roles: [Role.TUTOR, Role.ADMIN],
    isInDrawer: false,
    isPrivate: true,
    isTutorialRelated: false,
  },
  {
    path: RoutingPath.STUDENTOVERVIEW,
    title: 'Studierendenübersicht',
    component: TutorStudentmanagement,
    icon: StudentIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.TEAMOVERVIEW,
    title: 'Teamübersicht',
    component: Teamoverview,
    icon: TeamIcon,
    roles: [Role.TUTOR],
    isInDrawer: true,
    isPrivate: true,
    isTutorialRelated: true,
  },
  {
    path: RoutingPath.MANAGE_USERS,
    title: 'Nutzerverwaltung',
    component: UserManagement,
    icon: UserIcon,
    roles: [Role.ADMIN],
    isInDrawer: true,
    isPrivate: true,
    isExact: true,
  },
  {
    path: RoutingPath.IMPORT_USERS,
    title: 'Importiere Nutzer',
    component: ImportData,
    icon: UserIcon,
    roles: [Role.ADMIN],
    isInDrawer: false,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_TUTORIALS_SUBSTITUTES,
    title: 'Tutorienvertretungen',
    component: TutorialSubstituteManagement,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: false,
    isPrivate: true,
  },
  {
    path: RoutingPath.GENERATE_TUTORIALS,
    title: 'Generiere Tutorien',
    component: GenerateTutorials,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: false,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_TUTORIALS,
    title: 'Tutorienverwaltung',
    component: TutorialManagement,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
    isExact: true,
  },
  {
    path: RoutingPath.MANAGE_ALL_STUDENTS,
    title: 'Studierendenübersicht',
    component: AllStudentsAdminView,
    icon: StudentIcon,
    roles: [Role.ADMIN],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.SCHEIN_CRITERIAS_INFO,
    title: 'Scheinkriterien',
    component: CriteriaInfoView,
    icon: ScheincriteriaIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: false,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_SCHEIN_CRITERIAS,
    title: 'Scheinkriterien',
    component: ScheinCriteriaManagement,
    icon: ScheincriteriaIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_SHEETS,
    title: 'Übungsblätter',
    component: SheetManagement,
    icon: SheetIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_ATTENDANCES,
    title: 'Anwesenheiten',
    component: AttendanceAdminView,
    icon: AttendancesIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
  {
    path: RoutingPath.MANAGE_SCHEIN_EXAMS,
    title: 'Scheinklausuren',
    component: ScheinExamManagement,
    icon: ScheinexamManagementIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isInDrawer: true,
    isPrivate: true,
  },
];
