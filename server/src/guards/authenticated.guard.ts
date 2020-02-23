import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Checks if the user making the request is logged in.
 *
 * If he/she is access is granted and if not access is refused.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  /**
   * Checks if the user making this request is logged in.
   *
   * @param context Context to use.
   *
   * @returns Is the user logged in?
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}
