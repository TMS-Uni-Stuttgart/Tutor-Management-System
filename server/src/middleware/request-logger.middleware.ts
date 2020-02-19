import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: any, next: () => void) {
    const user: string = req.user?._id ?? 'Not identified user';

    Logger.debug(`Request: ${user} -> ${req.path}@${req.method}`);
    next();
  }
}
