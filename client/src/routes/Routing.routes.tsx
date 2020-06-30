import { SvgIconProps } from '@material-ui/core/SvgIcon';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Role } from 'shared/model/Role';
import { ADMIN_ROUTES } from './Routes.admin';
import { BASE_ROUTES } from './Routes.base';
import { TUTORIAL_ROUTES } from './Routes.tutorial';
import { RoutingPath } from './Routes.paths';

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

export const ROOT_REDIRECT_PATH: RoutingPath = RoutingPath.MANAGE_TUTORIAL_INTERNALS; // FIXME:
export const PATH_REDIRECT_AFTER_LOGIN: RoutingPath = RoutingPath.DASHBOARD;

export { RoutingPath };
export const ROUTES: readonly RouteType[] = [...BASE_ROUTES, ...TUTORIAL_ROUTES, ...ADMIN_ROUTES];
