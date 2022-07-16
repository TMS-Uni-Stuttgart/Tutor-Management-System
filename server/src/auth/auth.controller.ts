import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginGuard } from '../guards/login.guard';
import { UserService } from '../module/user/user.service';
import { ILoggedInUser } from '../shared/model/User';

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

        return await this.userService.getLoggedInUserInformation(req.user._id);
    }

    @Get('/logout')
    logout(@Req() req: Request, @Res() res: Response): void {
        req.logout(() => {
            return;
        });
        res.clearCookie('connect.sid').send('Successfully logged out.');
    }
}
