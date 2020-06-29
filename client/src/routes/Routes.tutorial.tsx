import {
  Account as StudentIcon,
  AccountMultiple as TeamIcon,
  AccountMultipleCheck as AttendancesIcon,
  Book as EnterPointsIcon,
  Comment as PresentationIcon,
  TextBox as ScheinexamPointsIcon,
} from 'mdi-material-ui';
import { Role } from '../../../server/src/shared/model/Role';
import AttendanceView from '../view/attendance/AttendanceView';
import EnterScheinexamPoints from '../view/points-scheinexam/enter-form/EnterScheinexamPoints';
import ScheinexamPointsOverview from '../view/points-scheinexam/overview/ScheinexamPointsOverview';
import EnterStudentPoints from '../view/points-sheet/enter-form/EnterStudentPoints';
import EnterTeamPoints from '../view/points-sheet/enter-form/EnterTeamPoints';
import PointsOverview from '../view/points-sheet/overview/PointsOverview';
import PresentationPoints from '../view/presentation-points/PresentationPoints';
import TutorStudentmanagement from '../view/studentmanagement/TutorStudentmanagement';
import Teamoverview from '../view/teamoverview/Teamoverview';
import { RouteType, RoutingPath } from './Routing.routes';

export const TUTORIAL_ROUTES: readonly RouteType[] = [
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
];
