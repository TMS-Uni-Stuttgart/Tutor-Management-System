import {
  Account as StudentIcon,
  AccountConvert as SubstituteIcon,
  AccountMultiple as TeamIcon,
  AccountMultipleCheck as AttendancesIcon,
  BadgeAccount as UserIcon,
  Book as EnterPointsIcon,
  Cogs as SettingsIcon,
  Comment as PresentationIcon,
  File as SheetIcon,
  HumanMaleBoard as TutorialIcon,
  ScriptText as ScheincriteriaIcon,
  TextBox as ScheinexamPointsIcon,
  ViewDashboard as DashboardIcon,
} from 'mdi-material-ui';
import { Role } from 'shared/model/Role';
import AttendanceAdminView from '../pages/attendance/AttendanceAdminView';
import AttendanceView from '../pages/attendance/AttendanceView';
import CriteriaInfoView from '../pages/criteria-info-view/CriteriaInfoView';
import Dashboard from '../pages/dashboard/Dashboard';
import GenerateTutorials from '../pages/generate-tutorials/GenerateTutorials';
import HandInsPage from '../pages/hand-ins/HandInsPage';
import ImportShortTests from '../pages/import-short-tests/components/ImportShortTests';
import ImportUsers from '../pages/import-users/ImportUsers';
import Login from '../pages/Login';
import EnterScheinexamPoints from '../pages/points-scheinexam/enter-form/EnterScheinexamPoints';
import ScheinexamPointsOverview from '../pages/points-scheinexam/overview/ScheinexamPointsOverview';
import EnterStudentPoints from '../pages/points-sheet/enter-form/EnterStudentPoints';
import EnterTeamPoints from '../pages/points-sheet/enter-form/EnterTeamPoints';
import PointsOverview from '../pages/points-sheet/overview/PointsOverview';
import PresentationPoints from '../pages/presentation-points/PresentationPoints';
import ScheinCriteriaManagement from '../pages/scheincriteriamanagement/ScheinCriteriaManagement';
import SettingsPage from '../pages/settings/SettingsPage';
import StudentInfo from '../pages/student-info/StudentInfo';
import AllStudentsAdminView from '../pages/studentmanagement/AllStudentsAdminView';
import TutorStudentmanagement from '../pages/studentmanagement/TutorStudentmanagement';
import Teamoverview from '../pages/teamoverview/Teamoverview';
import TutorialInternalsManagement from '../pages/tutorial-internals-management/TutorialInternalsManagement';
import SubstituteManagement from '../pages/tutorial-substitutes/SubstituteManagement';
import TutorialManagement from '../pages/tutorialmanagement/TutorialManagement';
import UserManagement from '../pages/usermanagement/UserManagement';
import { CustomRoute, DrawerRoute, parts, PrivateRoute } from './Routing.types';
import { param } from './typesafe-react-router';

const BASE_ROUTES = {
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
};

export const TUTORIAL_ROUTES = {
  ATTENDANCE: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'attendance'),
    title: 'Anwesenheiten',
    component: AttendanceView,
    icon: AttendancesIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  }),
  ENTER_POINTS_STUDENT: new PrivateRoute({
    path: parts(
      'tutorial',
      param('tutorialId'),
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
    path: parts(
      'tutorial',
      param('tutorialId'),
      'enterpoints',
      param('sheetId'),
      'team',
      param('teamId')
    ),
    title: 'Punkte eintragen',
    component: EnterTeamPoints,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  ENTER_POINTS_OVERVIEW: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'enterpoints', param('sheetId', true)),
    title: 'Punkte verwalten',
    component: PointsOverview,
    icon: EnterPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  PRESENTATION_POINTS: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'presentations', param('sheetId', true)),
    title: 'Präsentationen',
    component: PresentationPoints,
    icon: PresentationIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
    isAccessibleBySubstitute: true,
  }),
  SCHEIN_EXAMS_STUDENT: new PrivateRoute({
    path: parts(
      'tutorial',
      param('tutorialId'),
      'scheinexams',
      param('examId'),
      'student',
      param('studentId')
    ),
    title: 'Scheinklausuren',
    component: EnterScheinexamPoints,
    icon: ScheinexamPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  SCHEIN_EXAMS_OVERVIEW: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'scheinexams', param('examId', true)),
    title: 'Scheinklausuren',
    component: ScheinexamPointsOverview,
    icon: ScheinexamPointsIcon,
    roles: [Role.TUTOR, Role.CORRECTOR],
    isTutorialRelated: true,
  }),
  STUDENTOVERVIEW: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'studentoverview'),
    title: 'Studierendenübersicht',
    component: TutorStudentmanagement,
    icon: StudentIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
  }),
  TEAMOVERVIEW: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'teamoverview'),
    title: 'Teamübersicht',
    component: Teamoverview,
    icon: TeamIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
  }),
  TUTORIAL_SUBSTITUTES: new DrawerRoute({
    path: parts('tutorial', param('tutorialId'), 'substitutes'),
    title: 'Vertretungen',
    component: SubstituteManagement,
    icon: SubstituteIcon,
    roles: [Role.TUTOR],
    isTutorialRelated: true,
  }),
};

const MANAGEMENT_ROUTES = {
  MANAGE_ALL_STUDENTS: new DrawerRoute({
    path: parts('admin', 'students'),
    title: 'Studierendenübersicht',
    component: AllStudentsAdminView,
    icon: StudentIcon,
    roles: [Role.ADMIN],
  }),
  MANAGE_ATTENDANCES: new DrawerRoute({
    path: parts('admin', 'attendances'),
    title: 'Anwesenheiten',
    component: AttendanceAdminView,
    icon: AttendancesIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  IMPORT_SHORT_TEST_RESULTS: new PrivateRoute({
    path: parts('admin', 'handins', 'shorttest', 'import', param('shortTestId', true)),
    title: 'Importiere Kurztestergebnisse',
    component: ImportShortTests,
    icon: SheetIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
  }),
  MANAGE_HAND_INS: new DrawerRoute({
    path: parts('admin', 'handins', param('location', true)),
    title: 'Abgaben',
    component: HandInsPage,
    icon: SheetIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isExact: true,
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
    component: SubstituteManagement,
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
  }),
  MANAGE_TUTORIALS: new DrawerRoute({
    path: parts('admin', 'tutorialmanagement'),
    title: 'Tutorienverwaltung',
    component: TutorialManagement,
    icon: TutorialIcon,
    roles: [Role.ADMIN, Role.EMPLOYEE],
    isExact: true,
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
  MANAGE_SETTINGS: new DrawerRoute({
    path: parts('admin', 'settings'),
    title: 'Einstellungen anpassen',
    component: SettingsPage,
    icon: SettingsIcon,
    roles: [Role.ADMIN],
  }),
};

export const ROUTES = {
  ...BASE_ROUTES,
  ...TUTORIAL_ROUTES,
  ...MANAGEMENT_ROUTES,
};

export const ROOT_REDIRECT_PATH = ROUTES.LOGIN;
export const PATH_REDIRECT_AFTER_LOGIN = ROUTES.DASHBOARD;
