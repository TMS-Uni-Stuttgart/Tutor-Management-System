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

interface PrivateRouteOptions<Parts extends BaseArray>
  extends Omit<RouteOptions<Parts>, 'isPrivate'> {
  /** Roles allowed to access this route. */
  roles: Role[] | 'all';
}

interface DrawerRouteOptions<Parts extends BaseArray>
  extends Omit<PrivateRouteOptions<Parts>, 'isInDrawer'> {
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
export function parts<Parts extends BaseArray>(...parts: Parts): Parts {
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
    this.assertOptions(options);

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

  /**
   * Checks if the given options object is valid.
   *
   * The object is considered __not__ valid if:
   * - `isTutorialRelated` is `true` but no part of the path is a 'tutorialId' param.
   *
   * @param options Options to check.
   *
   * @throws `Error` - If the options object is __not__ valid.
   */
  private assertOptions(options: RouteOptions<Parts>) {
    if (options.isTutorialRelated && !this.checkIfTutorialIdParamIsPresent(options.path)) {
      throw new Error(
        `No 'tutorialId' param present in tutorial related route with title '${
          options.title
        }'. Got the following path parts:\n${JSON.stringify(options.path, null, 2)}`
      );
    }
  }

  /**
   * Checks if at least one of the parameters is 'tutorialId'.
   *
   * @param parts Parts to check
   *
   * @returns Boolean indicating if one parameter of the parts is 'tutorialId'.
   */
  private checkIfTutorialIdParamIsPresent(parts: Parts): boolean {
    for (const part of parts) {
      if (this.isParam(part) && part.param === 'tutorialId') {
        return true;
      }
    }
    return false;
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
