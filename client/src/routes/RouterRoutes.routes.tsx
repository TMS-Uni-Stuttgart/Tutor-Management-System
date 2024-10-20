import AttendanceAdminView from '../pages/attendance/AttendanceAdminView';
import AttendanceView from '../pages/attendance/AttendanceView';
import CriteriaInfoView from '../pages/criteria-info-view/CriteriaInfoView';
import Dashboard from '../pages/dashboard/Dashboard';
import GenerateTutorials from '../pages/generate-tutorials/GenerateTutorials';
import HandInsPage from '../pages/hand-ins/HandInsPage';
import ImportShortTests from '../pages/import-short-tests/components/ImportShortTests';
import ImportStudents from '../pages/import-students/ImportStudents';
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
import { Navigate, RouteObject } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import { BASE_ROUTE_HANDLES, ROUTES, TUTORIAL_ROUTE_HANDLES, MANAGEMENT_ROUTE_HANDLES, ROOT_REDIRECT_PATH } from './Routing.routes';

const ROUTER_BASE_ROUTES: RouteObject[] = [
    {
        element: <Login />,
        path: ROUTES.LOGIN.path,
        handle: BASE_ROUTE_HANDLES.LOGIN
    },
    {
        element: <PrivateRoute element={<Dashboard />} />,
        path: ROUTES.DASHBOARD.path,
        handle: BASE_ROUTE_HANDLES.DASHBOARD
    },
    {
        element: <PrivateRoute element={<StudentInfo />} />,
        path: ROUTES.STUDENT_INFO.path,
        handle: BASE_ROUTE_HANDLES.STUDENT_INFO
    },
]

const ROUTER_TUTORIAL_ROUTES: RouteObject[] = [
    {
        element: <PrivateRoute element={<AttendanceView />} />,
        path: ROUTES.TUTORIAL.$.ATTENDANCE.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.ATTENDANCE
    },
    {
        element: <PrivateRoute element={<EnterStudentPoints />} />,
        path: ROUTES.TUTORIAL.$.ENTER_POINTS_STUDENT.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.ENTER_POINTS_STUDENT
    },
    {
        element: <PrivateRoute element={<EnterTeamPoints />} />,
        path: ROUTES.TUTORIAL.$.ENTER_POINTS_TEAM.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.ENTER_POINTS_TEAM
    },
    {
        element: <PrivateRoute element={<PointsOverview />} />,
        path: ROUTES.TUTORIAL.$.ENTER_POINTS_OVERVIEW.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.ENTER_POINTS_OVERVIEW
    },
    {
        element: <PrivateRoute element={<PresentationPoints />} />,
        path: ROUTES.TUTORIAL.$.PRESENTATION_POINTS.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.PRESENTATION_POINTS
    },
    {
        element: <PrivateRoute element={<EnterScheinexamPoints />} />,
        path: ROUTES.TUTORIAL.$.SCHEIN_EXAMS_STUDENT.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.SCHEIN_EXAMS_STUDENT
    },
    {
        element: <PrivateRoute element={<ScheinexamPointsOverview />} />,
        path: ROUTES.TUTORIAL.$.SCHEIN_EXAMS_OVERVIEW.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.SCHEIN_EXAMS_OVERVIEW
    },
    {
        element: <PrivateRoute element={<TutorStudentmanagement />} />,
        path: ROUTES.TUTORIAL.$.STUDENT_OVERVIEW.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.STUDENT_OVERVIEW
    },
    {
        element: <PrivateRoute element={<ImportStudents />} />,
        path: ROUTES.TUTORIAL.$.IMPORT_STUDENTS.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.IMPORT_STUDENTS
    },
    {
        element: <PrivateRoute element={<Teamoverview />} />,
        path: ROUTES.TUTORIAL.$.TEAM_OVERVIEW.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.TEAM_OVERVIEW
    },
    {
        element: <PrivateRoute element={<SubstituteManagement />} />,
        path: ROUTES.TUTORIAL.$.TUTORIAL_SUBSTITUTES.relativePath,
        handle: TUTORIAL_ROUTE_HANDLES.TUTORIAL_SUBSTITUTES
    },
]

const ROUTER_MANAGEMENT_ROUTES: RouteObject[] = [
    {
        element: <PrivateRoute element={<AllStudentsAdminView />} />,
        path: ROUTES.MANAGE_ALL_STUDENTS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_ALL_STUDENTS
    },
    {
        element: <PrivateRoute element={<AttendanceAdminView />} />,
        path: ROUTES.MANAGE_ATTENDANCES.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_ATTENDANCES
    },
    {
        element: <PrivateRoute element={<ImportShortTests />} />,
        path: ROUTES.IMPORT_SHORT_TEST_RESULTS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.IMPORT_SHORT_TEST_RESULTS
    },
    {
        element: <PrivateRoute element={<HandInsPage />} />,
        path: ROUTES.MANAGE_HAND_INS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_HAND_INS
    },
    {
        element: <PrivateRoute element={<UserManagement />} />,
        path: ROUTES.MANAGE_USERS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_USERS
    },
    {
        element: <PrivateRoute element={<ImportUsers />} />,
        path: ROUTES.IMPORT_USERS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.IMPORT_USERS
    },
    {
        element: <PrivateRoute element={<SubstituteManagement />} />,
        path: ROUTES.MANAGE_TUTORIAL_SUBSTITUTES.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_TUTORIAL_SUBSTITUTES
    },
    {
        element: <PrivateRoute element={<GenerateTutorials />} />,
        path: ROUTES.GENERATE_TUTORIALS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.GENERATE_TUTORIALS
    },
    {
        element: <PrivateRoute element={<TutorialInternalsManagement />} />,
        path: ROUTES.MANAGE_TUTORIAL_INTERNALS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_TUTORIAL_INTERNALS,
        children: ROUTER_TUTORIAL_ROUTES
    },
    {
        element: <PrivateRoute element={<TutorialManagement />} />,
        path: ROUTES.MANAGE_TUTORIALS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_TUTORIALS
    },
    {
        element: <PrivateRoute element={<CriteriaInfoView />} />,
        path: ROUTES.SCHEIN_CRITERIAS_INFO.path,
        handle: MANAGEMENT_ROUTE_HANDLES.SCHEIN_CRITERIAS_INFO
    },
    {
        element: <PrivateRoute element={<ScheinCriteriaManagement />} />,
        path: ROUTES.MANAGE_SCHEIN_CRITERIAS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_SCHEIN_CRITERIAS
    },
    {
        element: <PrivateRoute element={<SettingsPage />} />,
        path: ROUTES.MANAGE_SETTINGS.path,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_SETTINGS
    },
]

export const ROUTER_ROUTES = [
    ...ROUTER_BASE_ROUTES,
    {
        path: ROUTES.TUTORIAL.path,
        children: ROUTER_TUTORIAL_ROUTES
    },
    ...ROUTER_MANAGEMENT_ROUTES,
    {
        path: "",
        element: <Navigate to={ROOT_REDIRECT_PATH.buildPath({})} />
    }
]