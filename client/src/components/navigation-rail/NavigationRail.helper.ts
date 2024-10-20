import { Role } from 'shared/model/Role';
import {
    BASE_ROUTE_HANDLES,
    MANAGEMENT_ROUTE_HANDLES,
    ROUTES,
    TUTORIAL_ROUTE_HANDLES,
} from '../../routes/Routing.routes';

export interface FilteredRoutes {
    baseRoutes: typeof baseRoutes;
    tutorialRoutes: typeof tutorialRoutes;
    managementRoutes: typeof managementRoutes;
}

function isRoleMatching(userRoles: Role[], routeRoles: Role[] | 'all'): boolean {
    if (routeRoles === 'all') {
        return true;
    }

    return routeRoles.findIndex((role) => userRoles.includes(role)) !== -1;
}

const baseRoutes = [
    {
        route: ROUTES.DASHBOARD,
        handle: BASE_ROUTE_HANDLES.DASHBOARD,
    } as const,
];

const managementRoutes = [
    {
        route: ROUTES.MANAGE_ALL_STUDENTS,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_ALL_STUDENTS,
    } as const,
    {
        route: ROUTES.MANAGE_ATTENDANCES,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_ATTENDANCES,
    } as const,
    {
        route: ROUTES.MANAGE_HAND_INS,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_HAND_INS,
    } as const,
    {
        route: ROUTES.MANAGE_USERS,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_USERS,
    } as const,
    {
        route: ROUTES.MANAGE_TUTORIALS,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_TUTORIALS,
    } as const,
    {
        route: ROUTES.MANAGE_SCHEIN_CRITERIAS,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_SCHEIN_CRITERIAS,
    } as const,
    {
        route: ROUTES.MANAGE_SETTINGS,
        handle: MANAGEMENT_ROUTE_HANDLES.MANAGE_SETTINGS,
    } as const,
];

const tutorialRoutes = [
    {
        route: ROUTES.TUTORIAL.ATTENDANCE,
        handle: TUTORIAL_ROUTE_HANDLES.ATTENDANCE,
    } as const,
    {
        route: ROUTES.TUTORIAL.ENTER_POINTS_OVERVIEW,
        handle: TUTORIAL_ROUTE_HANDLES.ENTER_POINTS_OVERVIEW,
    } as const,
    {
        route: ROUTES.TUTORIAL.PRESENTATION_POINTS,
        handle: TUTORIAL_ROUTE_HANDLES.PRESENTATION_POINTS,
    } as const,
    {
        route: ROUTES.TUTORIAL.SCHEIN_EXAMS_OVERVIEW,
        handle: TUTORIAL_ROUTE_HANDLES.SCHEIN_EXAMS_OVERVIEW,
    } as const,
    {
        route: ROUTES.TUTORIAL.STUDENT_OVERVIEW,
        handle: TUTORIAL_ROUTE_HANDLES.STUDENT_OVERVIEW,
    } as const,
    {
        route: ROUTES.TUTORIAL.TEAM_OVERVIEW,
        handle: TUTORIAL_ROUTE_HANDLES.TEAM_OVERVIEW,
    } as const,
    {
        route: ROUTES.TUTORIAL.TUTORIAL_SUBSTITUTES,
        handle: TUTORIAL_ROUTE_HANDLES.TUTORIAL_SUBSTITUTES,
    } as const,
];

export function filterRoutes(userRoles: Role[]): FilteredRoutes {
    // const userRoutesWithoutTutorialRoutes: OnlyOptionalParamsRoute[] = [];
    // const tutorialRoutes: TutorialRelatedDrawerRoute[] = [];
    //const managementRoutes: OnlyOptionalParamsRoute[] = [];

    /*
    for (const route of Object.values(ROUTES)) {
        if (!route.isInDrawer) {
            continue;
        }

        if (!isRoleMatching(userRoles, route.roles)) {
            continue;
        }

        if (
            Array.isArray(route.roles) &&
            (route.roles.indexOf(Role.ADMIN) !== -1 || route.roles.indexOf(Role.EMPLOYEE) !== -1)
        ) {
            if (route.hasOnlyOptionalParams()) {
                managementRoutes.push(route);
            }
        } else {
            if (!route.isTutorialRelated && route.hasOnlyOptionalParams()) {
                userRoutesWithoutTutorialRoutes.push(route);
            }

            if (route.isTutorialRelated && route.isTutorialRelatedDrawerRoute()) {
                tutorialRoutes.push(route);
            }
        }
    }
        */

    return {
        baseRoutes: baseRoutes.filter((route) => isRoleMatching(userRoles, route.handle.roles)),
        tutorialRoutes: tutorialRoutes.filter((route) =>
            isRoleMatching(userRoles, route.handle.roles)
        ),
        managementRoutes: managementRoutes.filter((route) =>
            isRoleMatching(userRoles, route.handle.roles)
        ),
    };
}
