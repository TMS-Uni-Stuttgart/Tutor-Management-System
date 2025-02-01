import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    MessageEvent,
    Post,
    Req,
    Res,
    Sse,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, interval, map } from 'rxjs';
import { ILoggedInUser } from 'shared/model/User';
import { LoginGuard } from '../guards/login.guard';
import { UserService } from '../module/user/user.service';

const SSE_CHECK_INTERVAL = 5 * 60 * 1000;

@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) {}

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LoginGuard)
    async login(@Req() req: Request): Promise<ILoggedInUser> {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return await this.userService.getLoggedInUserInformation(req.user.id);
    }

    @Get('/logout')
    logout(@Req() req: Request, @Res() res: Response): void {
        req.logout(() => {
            return;
        });
        res.clearCookie('connect.sid').send('Successfully logged out.');
    }

    /**
     * Periodically sends session expiration status.
     */
    @Sse('/session-status')
    @HttpCode(HttpStatus.OK)
    streamSessionStatus(@Req() req: Request): Observable<MessageEvent> {
        return interval(SSE_CHECK_INTERVAL).pipe(
            map(() => {
                req.session.reload((err) => {
                    if (err) {
                        return { data: { status: 'expired' } };
                    }
                });

                if (!req.isAuthenticated() || !req.session.cookie.maxAge) {
                    return { data: { status: 'expired' } };
                }

                const timeLeft = req.session.cookie.maxAge;

                return timeLeft <= 0
                    ? { data: { status: 'expired' } }
                    : { data: { status: 'active', timeLeft } };
            })
        );
    }
}
