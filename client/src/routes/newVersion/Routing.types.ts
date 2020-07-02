import { SvgIconProps } from '@material-ui/core';
import { RouteComponentProps } from 'react-router';
import { Role } from 'shared/model/Role';
import { PathPart, Route } from '../typesafe-react-router';

type RouteComponent = React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
type BaseArray = Array<PathPart<any, any>>;

interface RouteOptions<Parts extends BaseArray> {
  /**
   * Parts of the route.
   *
   * **Must be created with the `createPathParts` function** to ensure propper typing.
   */
  path: Parts;

  /** Title of the route shown in the app bar. */
  title: string;

  /** Component to display on the given route. */
  component: RouteComponent;

  /**
   * Is this route related to tutorials?
   *
   * Default: `false`
   */
  isTutorialRelated?: boolean;

  /**
   * Can this route be accessible by substitute tutors?
   *
   * Default: `false`
   */
  isAccessibleBySubstitute?: boolean;

  /**
   * Is the route 'exact' as specified in react-router?
   *
   * Default: `false`
   */
  isExact?: boolean;

  /**
   * Should the route be displayed in the drawer?
   *
   * Default: `false`
   */
  isInDrawer?: boolean;

  /**
   * Icon displayed in the drawer.
   *
   * Default: `null`
   */
  icon?: React.ComponentType<SvgIconProps> | null;

  /**
   * If true only the specified roles can access this route. If false everyone can access it.
   *
   * Default: `false`
   */
  isPrivate?: boolean;

  /**
   * Roles allowed to access this route.
   *
   * Default: `'all'`
   */
  roles?: Role[] | 'all';
}

interface PrivateRouteOptions<Parts extends BaseArray> extends RouteOptions<Parts> {
  /** Roles allowed to access this route. */
  roles: Role[] | 'all';
}

interface DrawerRouteOptions<Parts extends BaseArray> extends PrivateRouteOptions<Parts> {
  /** Icon displayed in the drawer. */
  icon: React.ComponentType<SvgIconProps>;
}

/**
 * This function is for typing purposes. It solves the problem that arrays are typed slighty different than spread parameters. This makes it possible to use a `path` array in the `CustomRoute` constructor parameter and also getting the correct generic type.
 *
 * It does not modify the parameter.
 *
 * @param parts Parts to return.
 *
 * @returns Unmodified `parts`.
 */
export function createPathParts<Parts extends BaseArray>(...parts: Parts): Parts {
  return parts;
}

/**
 * Route with options tailored to the TMS app.
 *
 * If possible use the helper classes `PrivateRoute` or `DrawerRoute` to use their presets.
 */
export class CustomRoute<Parts extends BaseArray> extends Route<Parts> {
  readonly title: string;
  readonly component: RouteComponent;
  readonly icon: React.ComponentType<SvgIconProps> | null;
  readonly roles: Role[] | 'all';
  readonly isInDrawer: boolean;
  readonly isPrivate: boolean;
  readonly isTutorialRelated: boolean;
  readonly isAccessibleBySubstitute: boolean;
  readonly isExact: boolean;

  constructor(options: RouteOptions<Parts>) {
    super(...options.path);

    this.title = options.title;
    this.component = options.component;
    this.icon = options.icon ?? null;
    this.roles = options.roles ?? 'all';
    this.isInDrawer = options.isInDrawer ?? false;
    this.isPrivate = options.isPrivate ?? false;
    this.isTutorialRelated = options.isTutorialRelated ?? false;
    this.isAccessibleBySubstitute = options.isAccessibleBySubstitute ?? false;
    this.isExact = options.isExact ?? false;
  }
}

/**
 * Creates a route which is only accessible by logged in users with the appropriate role.
 */
export class PrivateRoute<Parts extends BaseArray> extends CustomRoute<Parts> {
  constructor(params: PrivateRouteOptions<Parts>) {
    super({ ...params, isPrivate: true });
  }
}

/**
 * Creates a route which gets displayed in the drawer.
 */
export class DrawerRoute<Parts extends BaseArray> extends PrivateRoute<Parts> {
  constructor(params: DrawerRouteOptions<Parts>) {
    super({ ...params, isInDrawer: true });
  }
}
