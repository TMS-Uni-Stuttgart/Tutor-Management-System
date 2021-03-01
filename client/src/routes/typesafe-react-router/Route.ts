import { hasOwnProperty } from '../../typings/guards';
import { PathParam, PathPart, RouteParams } from './types';

/**
 * Route to use in the application.
 */
export class Route<Parts extends Array<PathPart<any, any>>> {
  protected readonly pathParts: Parts;
  private readonly _template: string;

  /**
   * Creates the Route based upon the given paths.
   *
   * The parts can either be `string` of `PathParam` object (created with the `param()` function). However, only the last parameter of a path can be optional. If other parameters are optional an error during initialisation is thrown.
   *
   * @param pathParts Parts of the routes.
   *
   * @throws `Error` - If any parameters but the last one are optional.
   */
  constructor(...pathParts: Parts) {
    this.pathParts = pathParts;
    this._template = this.createTemplate();
  }

  /**
   * Template representation of the route.
   *
   * Parameters are not replaced but prefixed with `:`. If they are optional they are suffixed with `?`.
   */
  get template(): string {
    return this._template;
  }

  get parts(): Parts {
    return [...this.pathParts] as Parts;
  }

  /**
   * Creates a route string based on the provided parameters.
   *
   * Parameters get filled in at their respective places. If the Route contains an optional parameter and it is not provided the paramter's part is ommited from the resulting string.
   *
   * @param params Parameters to fill in the route path with.
   *
   * @returns Route with filled in parameters.
   */
  create(params: RouteParams<Parts>): string {
    const parts: string[] = [];

    this.pathParts.forEach((part) => {
      if (this.isParam(part)) {
        const paramValue: string | undefined = (params as any)[part.param];

        if (part.optional) {
          if (paramValue) {
            parts.push(paramValue);
          }
        } else {
          parts.push(paramValue as string);
        }
      } else {
        parts.push(part);
      }
    });

    return `/${parts.join('/')}`;
  }

  /**
   * Checks if the given `part` is a `PathParam`.
   *
   * @param part Part to check.
   *
   * @returns TypeAssertion: Is the given `part` a `PathParam`?
   */
  protected isParam(part: unknown): part is PathParam<any, any> {
    if (typeof part !== 'object' || part === null) {
      return false;
    }

    if (!hasOwnProperty(part, 'param')) {
      return false;
    }

    return part.param !== undefined && part.param !== null;
  }

  private createTemplate(): string {
    const parts: string[] = [];

    this.pathParts.forEach((part, idx) => {
      if (this.isParam(part)) {
        if (part.optional && idx !== this.pathParts.length - 1) {
          this.throwWrongOptionalError();
        }

        if (part.optional) {
          parts.push(`:${part.param}?`);
        } else {
          parts.push(`:${part.param}`);
        }
      } else {
        parts.push(part);
      }
    });

    return `/${parts.join('/')}`;
  }

  private throwWrongOptionalError(): never {
    throw new Error(
      `Only the last part of a path can be optional. Got the following path parts:\n${JSON.stringify(
        this.pathParts,
        null,
        2
      )}`
    );
  }
}
