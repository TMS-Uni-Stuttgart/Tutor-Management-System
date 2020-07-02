import {
  Account as StudentIcon,
  AccountMultipleCheck as AttendancesIcon,
  BadgeAccount as UserIcon,
  File as SheetIcon,
  ScriptText as ScheincriteriaIcon,
  Teach as TutorialIcon,
  TextBoxMultiple as ScheinexamManagementIcon,
} from 'mdi-material-ui';
import { Role } from '../../../server/src/shared/model/Role';
import AttendanceAdminView from '../view/attendance/AttendanceAdminView';
import CriteriaInfoView from '../view/criteria-info-view/CriteriaInfoView';
import GenerateTutorials from '../view/generate-tutorials/GenerateTutorials';
import ImportUsers from '../view/import-data/ImportUsers';
import ScheinCriteriaManagement from '../view/scheincriteriamanagement/ScheinCriteriaManagement';
import ScheinExamManagement from '../view/scheinexam-management/ScheinExamManagement';
import SheetManagement from '../view/sheetmanagement/SheetManagement';
import AllStudentsAdminView from '../view/studentmanagement/AllStudentsAdminView';
import TutorialInternalsManagement from '../view/tutorial-internals-management/TutorialInternalsManagement';
import TutorialManagement from '../view/tutorialmanagement/TutorialManagement';
import TutorialSubstituteManagement from '../view/tutorialmanagement/TutorialSubstituteManagement';
import UserManagement from '../view/usermanagement/UserManagement';
import { RouteType } from './Routing.routes';
import { RoutingPath } from './Routes.paths';

export const ADMIN_ROUTES: readonly RouteType[] = [
  // {
  //   path: RoutingPath.MANAGE_USERS,
  //   title: 'Nutzerverwaltung',
  //   component: UserManagement,
  //   icon: UserIcon,
  //   roles: [Role.ADMIN],
  //   isInDrawer: true,
  //   isPrivate: true,
  //   isExact: true,
  // },
  // {
  //   path: RoutingPath.IMPORT_USERS,
  //   title: 'Importiere Nutzer',
  //   component: ImportUsers,
  //   icon: UserIcon,
  //   roles: [Role.ADMIN],
  //   isInDrawer: false,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_TUTORIALS_SUBSTITUTES,
  //   title: 'Tutorienvertretungen',
  //   component: TutorialSubstituteManagement,
  //   icon: TutorialIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: false,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.GENERATE_TUTORIALS,
  //   title: 'Generiere Tutorien',
  //   component: GenerateTutorials,
  //   icon: TutorialIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: false,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_TUTORIAL_INTERNALS,
  //   title: 'Tutorienverwaltung',
  //   component: TutorialInternalsManagement,
  //   icon: TutorialIcon,
  //   roles: [Role.ADMIN],
  //   isInDrawer: false,
  //   isPrivate: true,
  //   isExact: false,
  // },
  // {
  //   path: RoutingPath.MANAGE_TUTORIALS,
  //   title: 'Tutorienverwaltung',
  //   component: TutorialManagement,
  //   icon: TutorialIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: true,
  //   isPrivate: true,
  //   isExact: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_ALL_STUDENTS,
  //   title: 'Studierendenübersicht',
  //   component: AllStudentsAdminView,
  //   icon: StudentIcon,
  //   roles: [Role.ADMIN],
  //   isInDrawer: true,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.SCHEIN_CRITERIAS_INFO,
  //   title: 'Scheinkriterien',
  //   component: CriteriaInfoView,
  //   icon: ScheincriteriaIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: false,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_SCHEIN_CRITERIAS,
  //   title: 'Scheinkriterien',
  //   component: ScheinCriteriaManagement,
  //   icon: ScheincriteriaIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: true,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_SHEETS,
  //   title: 'Übungsblätter',
  //   component: SheetManagement,
  //   icon: SheetIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: true,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_ATTENDANCES,
  //   title: 'Anwesenheiten',
  //   component: AttendanceAdminView,
  //   icon: AttendancesIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: true,
  //   isPrivate: true,
  // },
  // {
  //   path: RoutingPath.MANAGE_SCHEIN_EXAMS,
  //   title: 'Scheinklausuren',
  //   component: ScheinExamManagement,
  //   icon: ScheinexamManagementIcon,
  //   roles: [Role.ADMIN, Role.EMPLOYEE],
  //   isInDrawer: true,
  //   isPrivate: true,
  // },
];
