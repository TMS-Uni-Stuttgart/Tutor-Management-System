import { Injectable, ExecutionContext, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

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
