import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';
import { Request, Response } from 'express';
import { ILoggedInUser } from '../shared/model/User';
import { UserService } from '../module/user/user.service';

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
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout();
    res.clearCookie('connect.sid').send('Successfully logged out.');
  }
}
