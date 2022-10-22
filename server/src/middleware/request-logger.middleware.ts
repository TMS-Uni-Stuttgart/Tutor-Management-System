import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: Request, _: unknown, next: () => void): void {
        const user: string = req.user?.id ?? 'Not identified user';

        Logger.debug(`${user} -> ${req.path}@${req.method}`, 'Request');
        next();
    }
}
