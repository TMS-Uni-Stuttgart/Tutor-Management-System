import {
    AccountMultipleCheck as AttendancesIcon,
    ViewDashboard as DashboardIcon,
    Book as EnterPointsIcon,
    Comment as PresentationIcon,
    ScriptText as ScheincriteriaIcon,
    TextBox as ScheinexamPointsIcon,
    Cogs as SettingsIcon,
    File as SheetIcon,
    Account as StudentIcon,
    AccountConvert as SubstituteIcon,
    AccountMultiple as TeamIcon,
    HumanMaleBoard as TutorialIcon,
    BadgeAccount as UserIcon,
} from 'mdi-material-ui';
import { Role } from 'shared/model/Role';
import { route } from "react-router-typesafe-routes/dom"
import { UIMatch } from 'react-router';

export const BASE_ROUTES = {
    LOGIN: route("login"),
    DASHBOARD: route("dashboard"),
    STUDENT_INFO: route("studentInfo/student/:studentId/:tutorialId?"),
}

export const TUTORIAL_ROUTES = {
    ATTENDANCE: route("attendance"),
    ENTER_POINTS_STUDENT: route("enterpoints/:sheetId/team/:teamId/student/:studentId"),
    ENTER_POINTS_TEAM: route("enterpoints/:sheetId/team/:teamId"),
    ENTER_POINTS_OVERVIEW: route("enterpoints/:sheetId?"),
    PRESENTATION_POINTS: route("presentations/:sheetId?"),
    SCHEIN_EXAMS_STUDENT: route("scheinexams/:examId/student/:studentId"),
    SCHEIN_EXAMS_OVERVIEW: route("scheinexams/:examId?"),
    STUDENT_OVERVIEW: route("studentoverview"),
    IMPORT_STUDENTS: route("studentoverview/generate"),
    TEAM_OVERVIEW: route("teamoverview"),
    TUTORIAL_SUBSTITUTES: route("substitutes")
}

export const MANAGEMENT_ROUTES = {
    MANAGE_ALL_STUDENTS: route("admin/students"),
    MANAGE_ATTENDANCES: route("admin/attendances"),
    IMPORT_SHORT_TEST_RESULTS: route("admin/handins/shorttest/import/:shortTestId?"),
    MANAGE_HAND_INS: route("admin/handins/:location?"),
    MANAGE_USERS: route("admin/usermanagement"),
    IMPORT_USERS: route("admin/usermanagement/generate"),
    MANAGE_TUTORIAL_SUBSTITUTES: route("admin/tutorialmanagement/substitutes/:tutorialId"),
    GENERATE_TUTORIALS: route("admin/tutorialmanagement/generate"),
    MANAGE_TUTORIAL_INTERNALS: route("admin/tutorialmanagement/manage/:tutorialId", undefined, TUTORIAL_ROUTES),
    MANAGE_TUTORIALS: route("admin/tutorialmanagement"),
    SCHEIN_CRITERIAS_INFO: route("admin/scheincriterias/info/:id"),
    MANAGE_SCHEIN_CRITERIAS: route("admin/scheincriterias"),
    MANAGE_SETTINGS: route("admin/settings")
}

export const ROUTES = {
    ...BASE_ROUTES,
    TUTORIAL: route("tutorial/:tutorialId", undefined, TUTORIAL_ROUTES),
    ...MANAGEMENT_ROUTES
}

export function useTutorialRoutes(matches: UIMatch[]) {
    if ((matches.some(match => (match.handle as any)?.isAdminRoute))) {
        return ROUTES.MANAGE_TUTORIAL_INTERNALS
    } else {
        return ROUTES.TUTORIAL
    }
}

export const ROOT_REDIRECT_PATH = ROUTES.LOGIN;
export const PATH_REDIRECT_AFTER_LOGIN = ROUTES.DASHBOARD;

export const BASE_ROUTE_HANDLES = {
    LOGIN: {
        title: 'Tutor Management System',
        roles: 'all' as const,
        isPrivate: false,
        isExact: true,
    },
    DASHBOARD: {
        title: 'Dashboard',
        icon: DashboardIcon,
        roles: 'all' as const,
    },
    STUDENT_INFO: {
        title: 'Studierendeninformation',
        icon: StudentIcon,
        roles: [Role.TUTOR, Role.ADMIN],
    }
}

export const TUTORIAL_ROUTE_HANDLES = {
    ATTENDANCE: {
        title: 'Anwesenheiten',
        icon: AttendancesIcon,
        roles: [Role.TUTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: true,
    },
    ENTER_POINTS_STUDENT: {
        title: 'Punkte eintragen',
        roles: [Role.TUTOR, Role.CORRECTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    ENTER_POINTS_TEAM: {
        title: 'Punkte eintragen',
        roles: [Role.TUTOR, Role.CORRECTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    ENTER_POINTS_OVERVIEW: {
        title: 'Punkte verwalten',
        icon: EnterPointsIcon,
        roles: [Role.TUTOR, Role.CORRECTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    PRESENTATION_POINTS: {
        title: 'Präsentationen',
        icon: PresentationIcon,
        roles: [Role.TUTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: true,
    },
    SCHEIN_EXAMS_STUDENT: {
        title: 'Scheinklausuren',
        icon: ScheinexamPointsIcon,
        roles: [Role.TUTOR, Role.CORRECTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    SCHEIN_EXAMS_OVERVIEW: {
        title: 'Scheinklausuren',
        icon: ScheinexamPointsIcon,
        roles: [Role.TUTOR, Role.CORRECTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    STUDENT_OVERVIEW: {
        title: 'Studierendenübersicht',
        icon: StudentIcon,
        roles: [Role.TUTOR],
        isTutorialRelated: true,
        isExact: true,
        isAccessibleBySubstitute: false,
    },
    IMPORT_STUDENTS: {
        title: 'Importiere Studierende',
        icon: StudentIcon,
        roles: [Role.TUTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    TEAM_OVERVIEW: {
        title: 'Teamübersicht',
        icon: TeamIcon,
        roles: [Role.TUTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    },
    TUTORIAL_SUBSTITUTES: {
        title: 'Vertretungen',
        icon: SubstituteIcon,
        roles: [Role.TUTOR],
        isTutorialRelated: true,
        isAccessibleBySubstitute: false,
    }
}

export const MANAGEMENT_ROUTE_HANDLES = {
    MANAGE_ALL_STUDENTS: {
        title: 'Studierendenübersicht',
        icon: StudentIcon,
        roles: [Role.ADMIN],
    },
    MANAGE_ATTENDANCES: {
        title: 'Anwesenheiten',
        icon: AttendancesIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
    },
    IMPORT_SHORT_TEST_RESULTS: {
        title: 'Importiere Kurztestergebnisse',
        icon: SheetIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
    },
    MANAGE_HAND_INS: {
        title: 'Abgaben',
        icon: SheetIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
        isExact: true,
    },
    MANAGE_USERS: {
        title: 'Nutzerverwaltung',
        icon: UserIcon,
        roles: [Role.ADMIN],
        isExact: true,
    },
    IMPORT_USERS: {
        title: 'Importiere Nutzer',
        icon: UserIcon,
        roles: [Role.ADMIN],
    },
    MANAGE_TUTORIAL_SUBSTITUTES: {
        title: 'Tutorienvertretungen',
        icon: TutorialIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
    },
    GENERATE_TUTORIALS: {
        title: 'Generiere Tutorien',
        icon: TutorialIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
    },
    MANAGE_TUTORIAL_INTERNALS: {
        title: 'Tutorienverwaltung',
        icon: TutorialIcon,
        roles: [Role.ADMIN],
        isAdminRoute: true
    },
    MANAGE_TUTORIALS: {
        title: 'Tutorienverwaltung',
        icon: TutorialIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
        isExact: true,
    },
    SCHEIN_CRITERIAS_INFO: {
        title: 'Info Scheinkriterium',
        icon: ScheincriteriaIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
    },
    MANAGE_SCHEIN_CRITERIAS: {
        title: 'Scheinkriterien',
        icon: ScheincriteriaIcon,
        roles: [Role.ADMIN, Role.EMPLOYEE],
    },
    MANAGE_SETTINGS: {
        title: 'Einstellungen anpassen',
        icon: SettingsIcon,
        roles: [Role.ADMIN],
    }
}

