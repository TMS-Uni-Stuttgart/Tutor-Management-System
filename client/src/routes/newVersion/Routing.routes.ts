import {
  ViewDashboard as DashboardIcon,
  Account as StudentIcon,
  AccountMultiple as TeamIcon,
  AccountMultipleCheck as AttendancesIcon,
  Book as EnterPointsIcon,
  Comment as PresentationIcon,
  TextBox as ScheinexamPointsIcon,
  BadgeAccount as UserIcon,
  File as SheetIcon,
  ScriptText as ScheincriteriaIcon,
  Teach as TutorialIcon,
  TextBoxMultiple as ScheinexamManagementIcon,
} from 'mdi-material-ui';
import Login from '../../view/Login';
import { parts, CustomRoute, DrawerRoute, PrivateRoute } from './Routing.types';
import { param } from '../typesafe-react-router';
import Dashboard from '../../view/dashboard/Dashboard';
import StudentInfo from '../../view/studentmanagement/student-info/StudentInfo';
import { Role } from '../../../../server/src/shared/model/Role';
import AttendanceView from '../../view/attendance/AttendanceView';
import EnterStudentPoints from '../../view/points-sheet/enter-form/EnterStudentPoints';
import EnterTeamPoints from '../../view/points-sheet/enter-form/EnterTeamPoints';
import PointsOverview from '../../view/points-sheet/overview/PointsOverview';
import EnterScheinexamPoints from '../../view/points-scheinexam/enter-form/EnterScheinexamPoints';
import PresentationPoints from '../../view/presentation-points/PresentationPoints';
import ScheinexamPointsOverview from '../../view/points-scheinexam/overview/ScheinexamPointsOverview';
import TutorStudentmanagement from '../../view/studentmanagement/TutorStudentmanagement';
import Teamoverview from '../../view/teamoverview/Teamoverview';
import UserManagement from '../../view/usermanagement/UserManagement';
import ImportUsers from '../../view/import-data/ImportUsers';
import TutorialSubstituteManagement from '../../view/tutorialmanagement/TutorialSubstituteManagement';
import GenerateTutorials from '../../view/generate-tutorials/GenerateTutorials';
import TutorialInternalsManagement from '../../view/tutorial-internals-management/TutorialInternalsManagement';
import TutorialManagement from '../../view/tutorialmanagement/TutorialManagement';
import AllStudentsAdminView from '../../view/studentmanagement/AllStudentsAdminView';
import CriteriaInfoView from '../../view/criteria-info-view/CriteriaInfoView';
import ScheinCriteriaManagement from '../../view/scheincriteriamanagement/ScheinCriteriaManagement';
import SheetManagement from '../../view/sheetmanagement/SheetManagement';
import AttendanceAdminView from '../../view/attendance/AttendanceAdminView';
import ScheinExamManagement from '../../view/scheinexam-management/ScheinExamManagement';

export const ROUTES = {
  LOGIN: new CustomRoute({
    path: parts('login'),
    title: 'Tutor Management System',
    component: Login,
    roles: 'all',
    isInDrawer: false,
    isPrivate: false,
    isExact: true,
  }),
  DASHBOARD: new DrawerRoute({
    path: parts('dashboard'),
    title: 'Dashboard',
    component: Dashboard,
    icon: DashboardIcon,
    roles: 'all',
  }),
  STUDENT_INFO: new PrivateRoute({
    path: parts('studentInfo', 'student', param('studentId'), param('tutorialId', true)),
    title: 'Studierendeninformation',
    component: StudentInfo,
    icon: StudentIcon,
    roles: [Role.TUTOR, Role.ADMIN],
  }),
  ATTENDANCE: new DrawerRoute({
    path: parts('attendance'),
    title: 'Anwesenheiten',
    component: AttendanceView,
    icon: AttendancesIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  }),
  ENTER_POINTS_STUDENT: new PrivateRoute({
    path: parts(
      'enterpoints',
      param('sheetId'),
      'team',
      param('teamId'),
      'student',
      param('studentId')
    ),
    title: 'Punkte eintragen',
    component: EnterStudentPoints,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  ENTER_POINTS_TEAM: new PrivateRoute({
    path: parts('enterpoints', param('sheetId'), 'team', param('teamId')),
    title: 'Punkte eintragen',
    component: EnterTeamPoints,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  ENTER_POINTS_OVERVIEW: new DrawerRoute({
    path: parts('enterpoints', param('sheetId', true)),
    title: 'Punkte verwalten',
    component: PointsOverview,
    icon: EnterPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  PRESENTATION_POINTS: new DrawerRoute({
    path: parts('presentations', param('sheetId', true)),
    title: 'Präsentationen',
    component: PresentationPoints,
    icon: PresentationIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  }),
  SCHEIN_EXAMS_STUDENT: new PrivateRoute({
    path: parts('scheinexams', param('examId'), 'student', param('studentId')),
    title: 'Scheinklausuren',
    component: EnterScheinexamPoints,
    icon: ScheinexamPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  SCHEIN_EXAMS_OVERVIEW: new DrawerRoute({
    path: parts('scheinexams', param('examId', true)),
    title: 'Scheinklausuren',
    component: ScheinexamPointsOverview,
    icon: ScheinexamPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  STUDENTOVERVIEW: new DrawerRoute({
    path: parts('studentoverview'),
    title: 'Studierendenübersicht',
    component: TutorStudentmanagement,
    icon: StudentIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
  }),
  TEAMOVERVIEW: new DrawerRoute({
    path: parts('teamoverview'),
    title: 'Teamübersicht',
    component: Teamoverview,
    icon: TeamIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
  }),
  MANAGE_USERS: new DrawerRoute({
    path: parts('admin', 'usermanagement'),
    title: 'Nutzerverwaltung',
    component: UserManagement,
    icon: UserIcon,
    roles: [Role.ADMIN],
    isExact: true,
  }),
  IMPORT_USERS: new PrivateRoute({
    path: parts('admin', 'usermanagement', 'generate'),
    title: 'Importiere Nutzer',
    component: ImportUsers,
    icon: UserIcon,
    roles: [Role.ADMIN],
  }),
  MANAGE_TUTORIAL_SUBSTITUTES: new PrivateRoute({
    path: parts('admin', 'tutorialmanagement', 'substitutes', param('tutorialId')),
    title: 'Tutorienvertretungen',
    component: TutorialSubstituteManagement,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  GENERATE_TUTORIALS: new PrivateRoute({
    path: parts('admin', 'tutorialmanagement', 'generate'),
    title: 'Generiere Tutorien',
    component: GenerateTutorials,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  MANAGE_TUTORIAL_INTERNALS: new PrivateRoute({
    path: parts('admin', 'tutorialmanagement', 'manage', param('tutorialId')),
    title: 'Tutorienverwaltung',
    component: TutorialInternalsManagement,
    icon: TutorialIcon,
    roles: [Role.ADMIN],
    isExact: false,
  }),
  MANAGE_TUTORIALS: new DrawerRoute({
    path: parts('admin', 'tutorialmanagement'),
    title: 'Tutorienverwaltung',
    component: TutorialManagement,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isExact: true,
  }),
  MANAGE_ALL_STUDENTS: new DrawerRoute({
    path: parts('admin', 'students'),
    title: 'Studierendenübersicht',
    component: AllStudentsAdminView,
    icon: StudentIcon,
    roles: [Role.ADMIN],
  }),
  SCHEIN_CRITERIAS_INFO: new PrivateRoute({
    path: parts('admin', 'scheincriterias', 'info', param('id')),
    title: 'Info Scheinkriterium',
    component: CriteriaInfoView,
    icon: ScheincriteriaIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  MANAGE_SCHEIN_CRITERIAS: new DrawerRoute({
    path: parts('admin', 'scheincriterias'),
    title: 'Scheinkriterien',
    component: ScheinCriteriaManagement,
    icon: ScheincriteriaIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  MANAGE_SHEETS: new DrawerRoute({
    path: parts('admin', 'sheets'),
    title: 'Übungsblätter',
    component: SheetManagement,
    icon: SheetIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  MANAGE_ATTENDANCES: new DrawerRoute({
    path: parts('admin', 'attendances'),
    title: 'Anwesenheiten',
    component: AttendanceAdminView,
    icon: AttendancesIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  MANAGE_SCHEIN_EXAMS: new DrawerRoute({
    path: parts('admin', 'scheinexams'),
    title: 'Scheinklausuren',
    component: ScheinExamManagement,
    icon: ScheinexamManagementIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
};

export const ROOT_REDIRECT_PATH = ROUTES.LOGIN;
export const PATH_REDIRECT_AFTER_LOGIN = ROUTES.DASHBOARD;
