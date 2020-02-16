import { Injectable, ExecutionContext, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * Checks if the provided credentials match any user in the database.
 *
 * If the credentials match access is granted, a session for that user is created. If there is no user matching the credentials access if refused.
 *
 * Furthermore, if the request body does not contain an `username` and a `password` a `BadRequestException` is thrown.
 */
@Injectable()
export class LoginGuard extends AuthGuard('local') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const { username, password } = request.body ?? { username: undefined, password: undefined };

    if (!username || !password) {
      throw new BadRequestException('Both username and password have to be provided.');
    }

    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }
}
