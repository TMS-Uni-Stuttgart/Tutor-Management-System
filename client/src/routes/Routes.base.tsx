import {
  Account as StudentIcon,
  Login as LoginIcon,
  ViewDashboard as DashboardIcon,
} from 'mdi-material-ui';
import { Role } from '../../../server/src/shared/model/Role';
import Dashboard from '../view/dashboard/Dashboard';
import Login from '../view/Login';
import StudentInfo from '../view/studentmanagement/student-info/StudentInfo';
import { RouteType, RoutingPath } from './Routing.routes';

export const BASE_ROUTES: readonly RouteType[] = [
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
    path: RoutingPath.STUDENT_INFO,
    title: 'Studierendeninformation',
    component: StudentInfo,
    icon: StudentIcon,
    roles: [Role.TUTOR, Role.ADMIN],
    isInDrawer: false,
    isPrivate: true,
    isTutorialRelated: false,
  },
];
